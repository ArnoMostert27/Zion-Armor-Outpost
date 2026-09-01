import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { rankForXp } from '../utils/ranks.js';

const badgeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'A name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'An email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'A password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: { type: String, enum: ['customer', 'keeper'], default: 'customer' },

    // Gamification
    xp: { type: Number, default: 0, min: 0 },
    badges: [badgeSchema],
    streak: { type: Number, default: 0 },
    lastVisit: { type: Date },

    // The Scroll (wishlist)
    scroll: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    avatarSigil: { type: String, default: 'shield' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: current rank derived from XP, never stored.
userSchema.virtual('rank').get(function () {
  return rankForXp(this.xp);
});

// Hash the password whenever it is set or changed.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

/** Adds XP and returns any badge keys newly unlocked by the XP change. */
userSchema.methods.awardXp = function (amount) {
  this.xp = Math.max(0, this.xp + amount);
  return this.xp;
};

/** Adds a badge if it is not already held. Returns true if newly awarded. */
userSchema.methods.awardBadge = function (key, name) {
  if (this.badges.some((b) => b.key === key)) return false;
  this.badges.push({ key, name });
  return true;
};

const User = mongoose.model('User', userSchema);
export default User;

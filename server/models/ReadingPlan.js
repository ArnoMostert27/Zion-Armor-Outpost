import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    passage: { type: String, required: true },
    prompt: { type: String, default: '' },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completedDays: [{ type: Number }],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { _id: false }
);

const readingPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    summary: { type: String, required: true },
    armorSlot: { type: String, default: 'sword' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    steps: [stepSchema],
    progress: [progressSchema],
  },
  { timestamps: true }
);

readingPlanSchema.virtual('dayCount').get(function () {
  return this.steps.length;
});

const ReadingPlan = mongoose.model('ReadingPlan', readingPlanSchema);
export default ReadingPlan;

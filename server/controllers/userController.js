import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import generateToken from '../utils/generateToken.js';
import { rankForXp, nextRankForXp, rankProgress, XP_RULES, BADGES } from '../utils/ranks.js';

/** Shapes a user document for the client, including derived rank data. */
const shapeUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  xp: user.xp,
  rank: rankForXp(user.xp),
  nextRank: nextRankForXp(user.xp),
  rankProgress: rankProgress(user.xp),
  badges: user.badges,
  streak: user.streak,
  avatarSigil: user.avatarSigil,
  createdAt: user.createdAt,
  ...(token ? { token } : {}),
});

// @desc    Register a new recruit
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are all required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('That email is already enlisted');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(res, user._id);

  res.status(201).json(shapeUser(user, token));
});

// @desc    Authenticate and issue a token
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Those credentials do not open the gate');
  }

  // Daily visit streak
  const now = new Date();
  const last = user.lastVisit ? new Date(user.lastVisit) : null;
  const dayMs = 24 * 60 * 60 * 1000;
  if (!last) {
    user.streak = 1;
    user.awardXp(XP_RULES.DAILY_VISIT);
  } else {
    const gap = Math.floor((now.setHours(0, 0, 0, 0) - new Date(last).setHours(0, 0, 0, 0)) / dayMs);
    if (gap === 1) {
      user.streak += 1;
      user.awardXp(XP_RULES.DAILY_VISIT);
    } else if (gap > 1) {
      user.streak = 1;
    }
  }
  if (user.streak >= 30) user.awardBadge('faithful-watch', 'Faithful Watch');
  user.lastVisit = new Date();
  await user.save();

  const token = generateToken(res, user._id);
  res.json(shapeUser(user, token));
});

// @desc    Clear the auth cookie
// @route   POST /api/users/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Stood down.' });
});

// @desc    Current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  res.json(shapeUser(req.user));
});

// @desc    Update name / email / password / sigil
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  user.avatarSigil = req.body.avatarSigil ?? user.avatarSigil;
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();
  res.json(shapeUser(updated));
});

// @desc    Full rank dossier: xp, badges, progress, order count
// @route   GET /api/users/rank
// @access  Private
export const getRankDossier = asyncHandler(async (req, res) => {
  const user = req.user;
  const orderCount = await Order.countDocuments({ user: user._id });
  const owned = await Order.distinct('items.product', { user: user._id });

  res.json({
    xp: user.xp,
    rank: rankForXp(user.xp),
    nextRank: nextRankForXp(user.xp),
    progress: rankProgress(user.xp),
    streak: user.streak,
    orderCount,
    titlesOwned: owned.length,
    badges: user.badges,
    allBadges: BADGES,
  });
});

// @desc    Add or remove a product from The Scroll (wishlist)
// @route   POST /api/users/scroll/:productId
// @access  Private
export const toggleScroll = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  const index = user.scroll.findIndex((id) => id.toString() === productId);
  if (index >= 0) user.scroll.splice(index, 1);
  else user.scroll.push(productId);

  await user.save();
  res.json({ scroll: user.scroll });
});

// @desc    Read The Scroll
// @route   GET /api/users/scroll
// @access  Private
export const getScroll = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('scroll');
  res.json(user.scroll);
});

// @desc    List every user
// @route   GET /api/users
// @access  Keeper
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort('-createdAt');
  res.json(users.map((u) => shapeUser(u)));
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Keeper
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('No such user');
  }
  if (user.role === 'keeper') {
    res.status(400);
    throw new Error('The Keeper cannot be removed');
  }
  await user.deleteOne();
  res.json({ message: 'User removed' });
});

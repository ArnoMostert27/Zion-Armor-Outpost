import asyncHandler from 'express-async-handler';
import ReadingPlan from '../models/ReadingPlan.js';
import User from '../models/User.js';
import { XP_RULES, rankForXp } from '../utils/ranks.js';

// @desc    List all reading plans
// @route   GET /api/plans
// @access  Public
export const getPlans = asyncHandler(async (req, res) => {
  const plans = await ReadingPlan.find({}).select('-progress').populate('product', 'title slug coverImage');
  res.json(plans);
});

// @desc    One plan, with the current user's progress if signed in
// @route   GET /api/plans/:slug
// @access  Public
export const getPlanBySlug = asyncHandler(async (req, res) => {
  const plan = await ReadingPlan.findOne({ slug: req.params.slug.toLowerCase() }).populate(
    'product',
    'title slug coverImage price'
  );
  if (!plan) {
    res.status(404);
    throw new Error('No such plan');
  }

  const mine = req.user
    ? plan.progress.find((p) => p.user.toString() === req.user._id.toString())
    : null;

  res.json({
    ...plan.toObject({ virtuals: true }),
    progress: undefined,
    myProgress: mine || null,
  });
});

// @desc    Mark a day complete or incomplete
// @route   POST /api/plans/:slug/day/:day
// @access  Private
export const toggleDay = asyncHandler(async (req, res) => {
  const day = Number(req.params.day);
  const plan = await ReadingPlan.findOne({ slug: req.params.slug.toLowerCase() });
  if (!plan) {
    res.status(404);
    throw new Error('No such plan');
  }
  if (!plan.steps.some((s) => s.day === day)) {
    res.status(400);
    throw new Error('That day is not part of this plan');
  }

  let mine = plan.progress.find((p) => p.user.toString() === req.user._id.toString());
  if (!mine) {
    plan.progress.push({ user: req.user._id, completedDays: [] });
    mine = plan.progress[plan.progress.length - 1];
  }

  const index = mine.completedDays.indexOf(day);
  if (index >= 0) mine.completedDays.splice(index, 1);
  else mine.completedDays.push(day);

  let xpAwarded = 0;
  let xp = req.user.xp;
  const justFinished = mine.completedDays.length === plan.steps.length && !mine.completedAt;
  if (justFinished) {
    mine.completedAt = new Date();
    const user = await User.findById(req.user._id);
    user.awardXp(XP_RULES.READING_PLAN);
    await user.save();
    xpAwarded = XP_RULES.READING_PLAN;
    xp = user.xp;
  }

  await plan.save();
  res.json({
    myProgress: mine,
    xpAwarded,
    xp,
    rank: rankForXp(xp),
    completed: Boolean(mine.completedAt),
  });
});

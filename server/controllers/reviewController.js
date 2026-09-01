import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { rankForXp, XP_RULES } from '../utils/ranks.js';

/** Recomputes a product's average rating from its reviews. */
const refreshProductRating = async (productId) => {
  const [agg] = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: agg ? Math.round(agg.avg * 10) / 10 : 0,
    numReports: agg ? agg.count : 0,
  });
};

// @desc    File a field report
// @route   POST /api/reviews/:productId
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, headline, body } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('No such product');
  }

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already filed a report on this title');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    name: req.user.name,
    rankName: rankForXp(req.user.xp).name,
    rating,
    headline,
    body,
  });

  await refreshProductRating(product._id);

  const user = await User.findById(req.user._id);
  user.awardXp(XP_RULES.REVIEW);
  const reportCount = await Review.countDocuments({ user: user._id });
  const newBadges = [];
  if (reportCount >= 10 && user.awardBadge('scribe', 'Scribe')) newBadges.push('scribe');
  await user.save();

  res.status(201).json({ review, xpAwarded: XP_RULES.REVIEW, xp: user.xp, newBadges });
});

// @desc    Reports for a product
// @route   GET /api/reviews/:productId
// @access  Public
export const getReviewsForProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).sort('-createdAt');
  res.json(reviews);
});

// @desc    Delete a report (author or keeper)
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('No such report');
  }
  const isAuthor = review.user.toString() === req.user._id.toString();
  if (!isAuthor && req.user.role !== 'keeper') {
    res.status(403);
    throw new Error('Not your report to strike');
  }
  const productId = review.product;
  await review.deleteOne();
  await refreshProductRating(productId);
  res.json({ message: 'Report withdrawn' });
});

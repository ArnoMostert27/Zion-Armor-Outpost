import mongoose from 'mongoose';

/** A "Field Report" - a review left by a user on a product. */
const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rankName: { type: String, default: 'Recruit' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    headline: { type: String, required: true, maxlength: 80 },
    body: { type: String, required: true, maxlength: 1200 },
  },
  { timestamps: true }
);

// One field report per user per product.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;

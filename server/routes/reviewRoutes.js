import express from 'express';
import {
  createReview,
  getReviewsForProduct,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:productId').get(getReviewsForProduct).post(protect, createReview);
router.delete('/report/:id', protect, deleteReview);

export default router;

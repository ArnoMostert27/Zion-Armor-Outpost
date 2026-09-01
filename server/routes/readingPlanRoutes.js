import express from 'express';
import { getPlans, getPlanBySlug, toggleDay } from '../controllers/readingPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPlans);
router.get('/:slug', getPlanBySlug);
router.post('/:slug/day/:day', protect, toggleDay);

export default router;

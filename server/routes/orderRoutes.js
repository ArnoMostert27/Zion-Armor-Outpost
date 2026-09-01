import express from 'express';
import {
  quoteOrder,
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController.js';
import { protect, keeperOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, keeperOnly, getOrders);

router.post('/quote', protect, quoteOrder);
router.get('/mine', protect, getMyOrders);
router.get('/stats', protect, keeperOnly, getOrderStats);

router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, keeperOnly, updateOrderStatus);

export default router;

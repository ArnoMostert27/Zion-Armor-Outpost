import express from 'express';
import {
  getProducts,
  getFeatured,
  getProductsBySlot,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, keeperOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, keeperOnly, createProduct);

router.get('/featured', getFeatured);
router.get('/by-slot', getProductsBySlot);

router.get('/:slug', getProductBySlug);

router
  .route('/:id')
  .put(protect, keeperOnly, updateProduct)
  .delete(protect, keeperOnly, deleteProduct);

export default router;

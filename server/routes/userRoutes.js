import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  getRankDossier,
  toggleScroll,
  getScroll,
  getUsers,
  deleteUser,
} from '../controllers/userController.js';
import { protect, keeperOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.get('/rank', protect, getRankDossier);

router.get('/scroll', protect, getScroll);
router.post('/scroll/:productId', protect, toggleScroll);

router.get('/', protect, keeperOnly, getUsers);
router.delete('/:id', protect, keeperOnly, deleteUser);

export default router;

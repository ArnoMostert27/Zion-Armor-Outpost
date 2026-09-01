import express from 'express';
import { getArmorSlots, validateBundle } from '../controllers/bundleController.js';

const router = express.Router();

router.get('/slots', getArmorSlots);
router.post('/validate', validateBundle);

export default router;

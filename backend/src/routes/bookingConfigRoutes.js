import express from 'express';
import { getBookingConfig, saveBookingConfig } from '../controllers/bookingConfigController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBookingConfig);
router.put('/', protect, saveBookingConfig);

export default router;

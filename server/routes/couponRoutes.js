import express from 'express';
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Customer endpoint
router.post('/validate', validateCoupon);

// Admin-only endpoints
router.get('/', protect, admin, getAllCoupons);
router.post('/', protect, admin, createCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

export default router;

import express from 'express';
import { getDeliveryFees, updateDeliveryFee } from '../controllers/deliveryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/fees', getDeliveryFees);
router.put('/fees/:id', protect, admin, updateDeliveryFee);

export default router;

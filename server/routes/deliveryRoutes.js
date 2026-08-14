import express from 'express';
import { getDeliveryFees, updateDeliveryFee, createDeliveryFee } from '../controllers/deliveryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/fees', getDeliveryFees);
router.post('/fees', protect, admin, createDeliveryFee);
router.put('/fees/:id', protect, admin, updateDeliveryFee);

export default router;

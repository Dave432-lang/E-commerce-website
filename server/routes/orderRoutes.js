import express from 'express';
import { createOrder, getMyOrders, trackOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateOrder } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/', protect, validateOrder, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/track/:orderId', trackOrder);

export default router;


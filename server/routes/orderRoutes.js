import express from 'express';
import { createOrder, getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all order routes

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

export default router;

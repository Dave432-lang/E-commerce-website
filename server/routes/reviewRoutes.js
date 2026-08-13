import express from 'express';
import { getProductReviews, addReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, addReview);

export default router;

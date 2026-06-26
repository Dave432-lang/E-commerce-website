import express from 'express';
import { 
  getCartItems, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  syncCart 
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes must be protected
router.use(protect);

router.get('/', getCartItems);
router.post('/', addToCart);
router.put('/', updateCartItem);
router.delete('/', removeFromCart);
router.post('/sync', syncCart);

export default router;

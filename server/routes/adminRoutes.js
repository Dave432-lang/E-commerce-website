import express from 'express';
import { 
  getDashboardStats, 
  getAllOrders, 
  updateOrderStatus, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getAllUsers 
} from '../controllers/adminController.js';
import { getProducts } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes must be logged in and authorized as admin!
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/products', getProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/users', getAllUsers);

export default router;

import express from 'express';
import { getProducts, getProductById } from '../controllers/productController.js';

const router = express.Router();

// GET /api/products?search=&category=&color=&size=&maxPrice=&sortBy=
router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;


import express from 'express';
import { handlePaystackWebhook } from '../controllers/paymentController.js';

const router = express.Router();

// Webhook listener should be public, NOT protected by token auth middleware
router.post('/webhook', handlePaystackWebhook);

export default router;

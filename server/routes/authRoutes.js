import express from 'express';
import { registerUser, loginUser, getCurrentUser, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile')
  .get(protect, getCurrentUser)
  .put(protect, updateUserProfile);

export default router;

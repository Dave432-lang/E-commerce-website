import express from 'express';
import { registerUser, loginUser, getCurrentUser, updateUserProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.route('/profile')
  .get(protect, getCurrentUser)
  .put(protect, updateUserProfile);

export default router;

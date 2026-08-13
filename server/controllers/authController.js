import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { emailService } from '../services/emailService.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password' });
  }

  try {
    const existingUser = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    const newUser = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = newUser[0];

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Profile Retrieval Error:', error);
    res.status(500).json({ message: 'Server Error retrieving profile' });
  }
};

// @desc    Update user profile (name, email, and optionally password)
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    // If email changed, check it is not taken
    if (email !== req.user.email) {
      const existingUser = await query('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
    }

    // Handle optional password change
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new password are required to update password' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      // Fetch raw password hash for verification
      const userRows = await query('SELECT password_hash FROM users WHERE id = ?', [userId]);
      const isMatch = await bcrypt.compare(currentPassword, userRows[0].password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      await query('UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?', [name, email, newHash, userId]);
    } else {
      await query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
    }

    const rows = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ message: 'Server Error updating profile' });
  }
};

// @desc    Request password reset (generate token & send email)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    // Always return 200 so we don't leak which emails exist
    if (users.length === 0) {
      return res.status(200).json({ message: 'If that email is registered, a password reset link has been sent to your inbox.' });
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [token, expires, email]);

    // Send formatted HTML email
    await emailService.sendPasswordResetEmail(email, user.name, token);

    res.status(200).json({
      message: 'If that email is registered, a password reset link has been sent to your inbox.',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server Error during forgot password request' });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const users = await query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [newHash, users[0].id]
    );

    res.status(200).json({ message: 'Password has been reset successfully. Please log in.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server Error during password reset' });
  }
};

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (!token) {
      return setError('Reset token is missing. Please request a new reset link.');
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, newPassword);
      navigate('/login?reset=success');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Token may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="navbar-logo" style={{ marginBottom: '2rem' }}>
            <ShoppingBag className="icon-primary" size={32} />
            <span className="logo-text">Boutique</span>
          </Link>
          <h1>Reset Password</h1>
          <p>Enter and confirm your new password below</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Enter new password (min. 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isSubmitting || !token}>
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Reset Password <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="auth-switch">
          <p><Link to="/login">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

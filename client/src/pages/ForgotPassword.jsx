import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = await authService.forgotPassword(email);
      // In production the token is emailed; for dev we display it directly
      if (data.resetToken) {
        setResetToken(data.resetToken);
      } else {
        setResetToken('__sent__');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
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
          <h1>Forgot Password</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        {resetToken ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Reset Token Generated!</h3>
            {resetToken !== '__sent__' && (
              <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', wordBreak: 'break-all' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>Your reset token (dev mode):</p>
                <p style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.875rem' }}>{resetToken}</p>
              </div>
            )}
            <Link to={`/reset-password?token=${resetToken}`} className="btn-primary" style={{ display: 'block', textDecoration: 'none', padding: '0.875rem', borderRadius: '8px', textAlign: 'center' }}>
              Continue to Reset Password
            </Link>
            <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Send Reset Token <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="auth-switch">
              <p>Remembered your password? <Link to="/login">Log In</Link></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

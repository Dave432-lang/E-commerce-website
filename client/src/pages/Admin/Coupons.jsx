import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { couponService } from '../../services/couponService';
import Loader from '../../components/Loader/Loader';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form state
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
      setError('Failed to load store coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountPercent) {
      setError('Please provide coupon code and discount percentage.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await couponService.createCoupon({
        code: code.trim().toUpperCase(),
        discountPercent: Number(discountPercent),
        minSpend: minSpend ? Number(minSpend) : 0
      });
      setSuccessMsg(`Coupon code ${code.toUpperCase()} created successfully!`);
      setCode('');
      setDiscountPercent('');
      setMinSpend('');
      fetchCoupons();
    } catch (err) {
      setError(err.message || 'Failed to create coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id, couponCode) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${couponCode}?`)) return;

    try {
      await couponService.deleteCoupon(id);
      setSuccessMsg(`Coupon ${couponCode} deleted successfully.`);
      fetchCoupons();
    } catch (err) {
      setError(err.message || 'Failed to delete coupon.');
    }
  };

  if (loading && coupons.length === 0) return <Loader />;

  return (
    <div className="admin-coupons-page">
      <div className="admin-page-header">
        <div>
          <h1>Store Coupons & Promo Codes</h1>
          <p className="admin-page-subtitle">Create and manage discount codes for checkout promotions</p>
        </div>
      </div>

      {error && (
        <div className="admin-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="admin-error-banner" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add New Coupon Form */}
      <div className="admin-card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={18} className="icon-primary" /> Create New Discount Coupon
        </h2>
        <form onSubmit={handleCreateCoupon} className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Coupon Code <span className="text-danger">*</span></label>
            <input
              type="text"
              placeholder="e.g. SUMMER20"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ textTransform: 'uppercase' }}
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Discount (%) <span className="text-danger">*</span></label>
            <input
              type="number"
              min="1"
              max="100"
              placeholder="e.g. 20"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Min Spend ($)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 50"
              value={minSpend}
              onChange={(e) => setMinSpend(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 'none' }}>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '0.75rem 1.5rem' }}>
              <Plus size={18} /> {submitting ? 'Saving...' : 'Add Coupon'}
            </button>
          </div>
        </form>
      </div>

      {/* Active Coupons List */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Active Promo Codes ({coupons.length})</h2>
        </div>
        <div className="admin-table-wrapper">
          {coupons.length === 0 ? (
            <p className="no-data-text">No promo codes created yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Minimum Spend</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="order-id-label" style={{ fontSize: '0.95rem' }}>{c.code}</span>
                    </td>
                    <td><b>{c.discount_percent}% OFF</b></td>
                    <td>{c.min_spend > 0 ? `$${Number(c.min_spend).toFixed(2)}` : 'No Minimum'}</td>
                    <td>{new Date(c.created_at || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Coupons;

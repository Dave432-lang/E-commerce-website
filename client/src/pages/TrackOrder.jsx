import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  CreditCard, 
  Printer, 
  Loader2
} from 'lucide-react';
import { orderService } from '../services/orderService';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('orderId') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);

  const fetchTracking = async (idToTrack) => {
    if (!idToTrack || !idToTrack.trim()) {
      setError('Please enter your Order ID (e.g. BTQ-100)');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const data = await orderService.trackOrder(idToTrack.trim());
      setOrderData(data);
    } catch (err) {
      setError(err.message || `Order #${idToTrack} was not found. Please check your ID and try again.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchTracking(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTracking(orderIdInput);
  };

  return (
    <div className="track-order-page" style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ 
          background: 'rgba(168, 85, 247, 0.15)', 
          color: '#c084fc', 
          fontSize: '0.8rem', 
          fontWeight: '700', 
          letterSpacing: '2px', 
          textTransform: 'uppercase', 
          padding: '0.35rem 1rem', 
          borderRadius: '50px', 
          display: 'inline-block',
          marginBottom: '0.75rem'
        }}>
          Real-Time Tracking
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: 'var(--text)' }}>
          Track Your <span style={{ color: 'var(--primary)' }}>Boutique Order</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '550px', margin: '0 auto' }}>
          Enter your official Order ID below to view instant status updates, courier progress, and delivery details.
        </p>
      </div>

      {/* Search Input Form */}
      <form 
        onSubmit={handleSearchSubmit} 
        style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '16px', 
          padding: '0.75rem 1rem', 
          display: 'flex', 
          gap: '0.75rem', 
          alignItems: 'center', 
          marginBottom: '2.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}
      >
        <Search size={22} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.5rem' }} />
        <input 
          type="text" 
          placeholder="Enter Order ID (e.g. BTQ-100 or 100)..." 
          value={orderIdInput} 
          onChange={(e) => setOrderIdInput(e.target.value)}
          style={{ 
            flex: 1, 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text)', 
            fontSize: '1rem', 
            outline: 'none',
            padding: '0.5rem'
          }}
        />
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading}
          style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Track Order'}
        </button>
      </form>

      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          color: '#f87171', 
          padding: '1rem 1.25rem', 
          borderRadius: '12px', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {orderData && (
        <div className="animate-fade-in" style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: '20px', 
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Order Info Card Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            flexWrap: 'wrap', 
            gap: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            paddingBottom: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Order #{orderData.orderId}</h2>
                <span className={`order-status-badge status-${String(orderData.status).toLowerCase()}`}>
                  {orderData.status}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Placed on <strong>{orderData.date}</strong> &bull; Customer: <strong>{orderData.customerName}</strong> ({orderData.customerEmail})
              </p>
            </div>

            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => window.print()} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <Printer size={16} /> Print Receipt
            </button>
          </div>

          {/* Stepper Timeline Tracker */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Fulfillment Timeline
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              {orderData.timeline.map((step, idx) => (
                <div key={idx} style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '50%', 
                    margin: '0 auto 0.75rem auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: step.isCurrent 
                      ? 'var(--primary)' 
                      : step.isCompleted 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: step.isCurrent 
                      ? '2px solid #ffffff' 
                      : step.isCompleted 
                      ? '2px solid #10b981' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    color: step.isCurrent ? '#ffffff' : step.isCompleted ? '#34d399' : 'var(--text-muted)',
                    transition: 'all 0.3s ease'
                  }}>
                    {step.isCompleted ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: step.isCurrent ? '700' : '500', 
                    color: step.isCurrent ? 'var(--text)' : 'var(--text-muted)',
                    margin: 0
                  }}>
                    {step.status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Items Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#c084fc" /> Shipping Destination
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: '0 0 0.35rem 0', fontWeight: '600' }}>
                {orderData.shippingAddress}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={14} /> Method: {orderData.paymentMethod}
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Total Paid
              </h4>
              <p style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', margin: 0 }}>
                GH₵{orderData.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Order Items Table */}
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Order Line Items ({orderData.items.length})
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.8rem' }}>
                  <th style={{ padding: '0.75rem' }}>Item Description</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div>
                        <strong style={{ color: 'var(--text)' }}>{item.name}</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Size: {item.size} | Color: {item.color}</p>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text)' }}>{item.quantity}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '700', color: 'var(--text)' }}>
                      GH₵{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { couponService } from '../services/couponService';
import { 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Smartphone, 
  ArrowLeft, 
  ShoppingBag,
  Truck,
  ShieldCheck,
  Loader2,
  Tag
} from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, setIsCartOpen, setCartItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Delivery fees state
  const [deliveryFeesList, setDeliveryFeesList] = useState([]);

  React.useEffect(() => {
    const fetchFees = async () => {
      try {
        const fees = await orderService.getDeliveryFees();
        if (Array.isArray(fees)) {
          setDeliveryFeesList(fees);
        }
      } catch (err) {
        console.warn('Could not load dynamic regional delivery fees:', err.message);
      }
    };
    fetchFees();
  }, []);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    address: '',
    city: '',
    region: 'Greater Accra',
    country: 'Ghana',
    phone: '',
  });

  const activeFeeRow = deliveryFeesList.find(f => f.region_name === formData.region);
  const deliveryFee = activeFeeRow ? Number(activeFeeRow.fee) : 25.00;
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
  const finalTotal = Math.max(0, cartTotal + deliveryFee - discountAmount);

  const ghanaRegions = [
    'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 
    'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono', 
    'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti', 'Western North'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await couponService.validateCoupon(couponInput, cartTotal);
      setAppliedCoupon(res);
      setCouponSuccess(res.message);
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.address || !formData.city || !formData.phone || !formData.region) {
        setError('Please fill in all delivery fields');
        return;
      }
      const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
      if (cleanPhone.length < 9) {
        setError('Please enter a valid Ghana phone number (at least 9 digits)');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleOrderCompletion = async (response) => {
    try {
      const orderResponse = await orderService.createOrder({
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        totalAmount: finalTotal,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.region}, Ghana`,
        region: formData.region,
        city: formData.city,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        paymentReference: response.reference,
        paymentMethod: response.channel === 'card' ? 'Paystack Card' : 'Paystack Momo'
      });

      setCreatedOrderId(orderResponse.orderId);
      setIsOrderPlaced(true);
      setCartItems([]);
    } catch (err) {
      console.error('Order Submission Error:', err);
      setError(err.message || 'Payment verified, but saving your order to database failed. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaystackPayment = () => {
    setError('');

    if (isPlaceholderKey) {
      setError('A valid Paystack Public Key is required for live gateway popups. Please add your key to client/.env as VITE_PAYSTACK_PUBLIC_KEY, or click "Simulate Test Payment (Dev Mode)" below.');
      return;
    }

    setIsSubmitting(true);

    if (!window.PaystackPop || typeof window.PaystackPop.setup !== 'function') {
      setIsSubmitting(false);
      setError('Unable to load Paystack payment gateway. Please check your internet connection or disable ad-blockers, then refresh.');
      return;
    }

    try {
      // Paystack inline integration setup
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_d3c3332152861c8a514d7a8f15d22bf5716dfbc2',
        email: formData.email,
        amount: Math.round(finalTotal * 100), // Minor units, GHS pesewas.
        currency: 'GHS', // Set to GHS to support cards & Mobile Money (MTN, Telecel, AirtelTigo)
        ref: 'BTQ-' + Math.floor(Math.random() * 1000000000 + 1),
        metadata: {
          userId: user?.id || null,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0,
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.region}, Ghana`,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }))
        },
        onClose: function() {
          setIsSubmitting(false);
          setError('Payment cancelled by user.');
        },
        callback: function(response) {
          handleOrderCompletion(response);
        },
        onSuccess: function(response) {
          handleOrderCompletion(response);
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error('Paystack initialization error:', err);
      setError('Failed to initialize Paystack. Please ensure you are online.');
      setIsSubmitting(false);
    }
  };

  const handleSimulatePayment = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const mockRef = 'SIM-' + Math.floor(Math.random() * 1000000000 + 1);
      const orderResponse = await orderService.createOrder({
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        totalAmount: finalTotal,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.region}, Ghana`,
        region: formData.region,
        city: formData.city,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        paymentReference: mockRef,
        paymentMethod: 'Test Simulation (Dev Mode)'
      });

      setCreatedOrderId(orderResponse.orderId);
      setIsOrderPlaced(true);
      setCartItems([]);
    } catch (err) {
      console.error('Simulated Payment Error:', err);
      setError(err.message || 'Simulated payment failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPlaceholderKey = !import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY.includes('d3c3332152861c8a514d7a8f15d22bf5716dfbc2') || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY.includes('your_paystack_public_key');

  if (cartItems.length === 0 && !isOrderPlaced) {
    return (
      <div className="checkout-page empty-checkout">
        <div className="empty-cart-card">
          <ShoppingBag size={48} className="icon-muted" />
          <h2>Your Cart is Empty</h2>
          <p>Add some stylish Ghanaian apparel to your cart before checking out.</p>
          <Link to="/shop" className="btn-primary">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  if (isOrderPlaced) {
    return (
      <div className="checkout-page order-success-page">
        <div className="success-card">
          <div className="success-icon-wrapper">
            <CheckCircle size={56} className="icon-success" />
          </div>
          <h2>Order Confirmed!</h2>
          <p className="order-number">Order ID: <span>#{createdOrderId}</span></p>
          <p className="success-message">
            Thank you for shopping with us! We have received your payment and your order is currently being processed for delivery to <strong>{formData.city}, {formData.region} Region</strong>.
          </p>

          <div className="order-next-steps">
            <div className="step-item">
              <Truck size={20} />
              <div>
                <strong>Estimated Delivery:</strong>
                <p>1 - 3 Business Days via Local Express Delivery</p>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
            <Link to="/profile" className="btn-secondary">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className={`step-badge ${step >= 1 ? 'active' : ''}`}>1. Delivery Info</div>
          <ChevronRight size={16} />
          <div className={`step-badge ${step >= 2 ? 'active' : ''}`}>2. Payment & Review</div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      <div className="checkout-layout">
        <main className="checkout-main">
          <div className="checkout-card">
            {step === 1 && (
              <div className="step-content">
                <h3>Delivery Information</h3>
                <form className="delivery-form" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number (Mobile Money / Contact)</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        placeholder="e.g. 0540001122" 
                        value={formData.phone} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Street Address / Digital Address (Ghana Post GPS)</label>
                    <input 
                      type="text" 
                      name="address" 
                      placeholder="e.g. GA-123-4567, Oxford Street" 
                      value={formData.address} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City / Town</label>
                      <input 
                        type="text" 
                        name="city" 
                        placeholder="e.g. Osu, East Legon, Kumasi" 
                        value={formData.city} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Region</label>
                      <select name="region" value={formData.region} onChange={handleInputChange}>
                        {ghanaRegions.map(reg => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="step-actions">
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.9rem' }}>
                      Proceed to Payment & Review
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <h3>Review & Payment</h3>
                
                {isPlaceholderKey && (
                  <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#eab308', lineHeight: '1.5' }}>
                    <strong>Paystack Public Key Required:</strong> To test with live/test Paystack popups, add your Paystack Public Key (starts with <code>pk_test_</code> or <code>pk_live_</code>) to <code>client/.env</code> as <code>VITE_PAYSTACK_PUBLIC_KEY</code>.<br />
                    <em>For local development without a key, click <strong>Simulate Test Payment</strong> below.</em>
                  </div>
                )}

                <div className="review-summary-block">
                  <div className="review-section">
                    <h4>Delivery Address</h4>
                    <p><b>{formData.firstName} {formData.lastName}</b></p>
                    <p>{formData.address}, {formData.city}</p>
                    <p>{formData.region} Region, Ghana</p>
                    <p>Phone: {formData.phone}</p>
                  </div>

                  <div className="payment-info-box">
                    <div className="secure-badge">
                      <ShieldCheck size={20} className="icon-success" />
                      <span>Secured by Paystack</span>
                    </div>
                    <p className="paystack-help-text">
                      Supports Visa, Mastercard, and Mobile Money (MTN, Telecel, AirtelTigo).
                    </p>
                    <div className="payment-network-logos">
                      <div className="logo-badge">Card</div>
                      <div className="logo-badge momo-mtn">MTN Momo</div>
                      <div className="logo-badge momo-telecel">Telecel</div>
                      <div className="logo-badge momo-airtel">AirtelTigo</div>
                    </div>
                  </div>
                </div>

                <div className="step-actions" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                    <button className="btn-secondary" onClick={prevStep} disabled={isSubmitting}>
                      <ArrowLeft size={18} /> Back
                    </button>
                    
                    <button 
                      className="btn-primary add-to-cart-large" 
                      onClick={handlePaystackPayment} 
                      disabled={isSubmitting}
                      style={{ flex: 1, padding: '1rem' }}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin" size={18} /> Verifying...</>
                      ) : (
                        <>Pay securely with Paystack (GH₵{finalTotal.toFixed(2)})</>
                      )}
                    </button>
                  </div>

                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={handleSimulatePayment}
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    Simulate Test Payment (Dev Mode)
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="checkout-sidebar">
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="summary-item">
                  <div className="summary-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="summary-item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-meta">Size: {item.size} | Qty: {item.quantity}</p>
                    <p className="item-price">GH₵{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Form */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Promo Code (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  type="submit"
                  className="btn-secondary"
                  disabled={isValidatingCoupon || !couponInput.trim()}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  {isValidatingCoupon ? '...' : 'Apply'}
                </button>
              </form>
              {couponError && <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.35rem' }}>{couponError}</p>}
              {couponSuccess && <p style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.35rem' }}>{couponSuccess}</p>}
            </div>

            <div className="summary-totals" style={{ marginTop: '1rem' }}>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>GH₵{cartTotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="summary-row" style={{ color: '#16a34a', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Tag size={14} /> Coupon ({appliedCoupon.code})
                  </span>
                  <span>-GH₵{appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Delivery ({formData.region})</span>
                <span>GH₵{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>GH₵{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-guarantee">
              <Truck size={18} />
              <p>Express Regional Delivery across Ghana</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;

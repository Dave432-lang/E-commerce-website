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

  const handlePaystackPayment = () => {
    setError('');
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
          userId: user.id,
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
        onClose: () => {
          setIsSubmitting(false);
          setError('Payment cancelled by user.');
        },
        callback: async (response) => {
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
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error('Paystack initialization error:', err);
      setError('Failed to initialize Paystack. Please ensure you are online.');
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !isOrderPlaced) {
    return (
      <div className="empty-checkout">
        <ShoppingBag size={64} />
        <h2>Your cart is empty</h2>
        <p>Add some premium apparel before checking out.</p>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  if (isOrderPlaced) {
    return (
      <div className="order-success-page">
        <CheckCircle size={80} className="success-icon" />
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for shopping with Boutique. Your order number is <b>#{createdOrderId}</b></p>
        <p>We've sent a confirmation email to <b>{formData.email}</b></p>
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/profile" className="btn-primary">View My Orders</Link>
          <Link to="/" className="btn-secondary">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <main className="checkout-main">
          {/* Stepper */}
          <div className="checkout-stepper">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">{step > 1 ? <CheckCircle size={18} /> : 1}</div>
              <span>Delivery</span>
            </div>
            <div className="step-connector" />
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Payment & Review</span>
            </div>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <div className="step-content">
            {step === 1 ? (
              <div className="shipping-step">
                <div className="step-header">
                  <MapPin size={24} />
                  <h2>Delivery Information (Within Ghana Only)</h2>
                </div>
                <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" required />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Country</label>
                      <input name="country" value="Ghana" disabled className="disabled-input" />
                    </div>
                    <div className="form-group">
                      <label>Ghana Region</label>
                      <select name="region" value={formData.region} onChange={handleInputChange} required className="region-select">
                        {ghanaRegions.map(reg => (
                          <option key={reg} value={reg}>{reg} Region</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Address</label>
                      <input name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Ring Road, Airport Residential Area" required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>City / Town</label>
                      <input name="city" value={formData.city} onChange={handleInputChange} placeholder="Accra" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Phone Number (Ghana Mobile)</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. +233 24 123 4567 or 0241234567" required />
                  </div>
                  
                  <div className="step-actions">
                    <button type="submit" className="btn-primary">
                      Continue to Payment <ChevronRight size={18} />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="payment-step">
                <div className="step-header">
                  <CreditCard size={24} />
                  <h2>Review & Secure Payment</h2>
                </div>

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

                <div className="step-actions">
                  <button className="btn-secondary" onClick={prevStep} disabled={isSubmitting}>
                    <ArrowLeft size={18} /> Back to Delivery
                  </button>
                  
                  <button 
                    className="btn-primary add-to-cart-large" 
                    onClick={handlePaystackPayment} 
                    disabled={isSubmitting}
                    style={{ flex: 1, padding: '1rem' }}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="animate-spin" size={18} /> Verifying Transaction...</>
                    ) : (
                      <>Pay securely with Paystack (GH₵{finalTotal.toFixed(2)})</>
                    )}
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

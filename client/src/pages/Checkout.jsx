import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
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
  Loader2
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

  const ghanaRegions = [
    'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 
    'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono', 
    'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti', 'Western North'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.address || !formData.city || !formData.phone || !formData.region) {
        setError('Please fill in all shipping fields');
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

    try {
      // Paystack inline integration setup
      const handler = window.PaystackPop.setup({
        key: 'pk_test_d3c3332152861c8a514d7a8f15d22bf5716dfbc2', // Test public key (supports sandbox Momo + Cards)
        email: formData.email,
        amount: Math.round(cartTotal * 100), // Minor units, GHS pesewas. Free shipping applied ($0 shipping!)
        currency: 'GHS', // Set to GHS to support cards & Mobile Money (MTN, Telecel, AirtelTigo) out-of-the-box!
        ref: 'BTQ-' + Math.floor(Math.random() * 1000000000 + 1),
        onClose: () => {
          setIsSubmitting(false);
          setError('Payment cancelled by user.');
        },
        callback: async (response) => {
          // Payment succeeded, now verify on backend and create order in MySQL
          try {
            const orderResponse = await orderService.createOrder({
              items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size
              })),
              totalAmount: cartTotal, // Free shipping ($0)
              shippingAddress: `${formData.address}, ${formData.city}, ${formData.region}, Ghana`,
              paymentReference: response.reference,
              paymentMethod: response.channel === 'card' ? 'Paystack Card' : 'Paystack Momo'
            });

            // Set final success state
            setCreatedOrderId(orderResponse.orderId);
            setIsOrderPlaced(true);
            setCartItems([]); // Clear local cart
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
              <span>Shipping</span>
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
                  <h2>Shipping Information (Delivery within Ghana Only)</h2>
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
                    <h4>Shipping Address</h4>
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
                    <ArrowLeft size={18} /> Back to Shipping
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
                      <>Pay securely with Paystack (${cartTotal.toFixed(2)})</>
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
                    <p className="item-price">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping-text" style={{ color: '#10b981', fontWeight: 600 }}>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-guarantee">
              <Truck size={18} />
              <p>Free delivery within Ghana</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;

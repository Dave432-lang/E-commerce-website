import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Smartphone, 
  ArrowLeft, 
  ShoppingBag,
  Truck
} from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    momoNetwork: 'MTN',
    momoNumber: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const placeOrder = () => {
    // Mock order placement
    setIsOrderPlaced(true);
    // In a real app, we would clear the cart here too
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
        <p>Thank you for shopping with Boutique. Your order number is <b>#BTQ-{Math.floor(Math.random() * 90000) + 10000}</b></p>
        <p>We've sent a confirmation email to {formData.email}</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '2rem' }}>Return to Home</Link>
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
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-number">{step > 2 ? <CheckCircle size={18} /> : 2}</div>
              <span>Payment</span>
            </div>
            <div className="step-connector" />
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Review</span>
            </div>
          </div>

          <div className="step-content">
            {step === 1 && (
              <div className="shipping-step">
                <div className="step-header">
                  <MapPin size={24} />
                  <h2>Shipping Information</h2>
                </div>
                <form className="checkout-form">
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
                    <input name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Luxury St" required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input name="city" value={formData.city} onChange={handleInputChange} placeholder="Accra" required />
                    </div>
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="00233" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+233 24 000 0000" required />
                  </div>
                </form>
                <div className="step-actions">
                  <button className="btn-primary" onClick={nextStep}>Continue to Payment <ChevronRight size={18} /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="payment-step">
                <div className="step-header">
                  <CreditCard size={24} />
                  <h2>Payment Method</h2>
                </div>
                
                <div className="payment-tabs">
                  <button 
                    className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard size={20} />
                    <span>Card</span>
                  </button>
                  <button 
                    className={`payment-tab ${paymentMethod === 'momo' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('momo')}
                  >
                    <Smartphone size={20} />
                    <span>Momo</span>
                  </button>
                </div>

                <div className="payment-form-container">
                  {paymentMethod === 'card' ? (
                    <div className="card-form">
                      <div className="form-group">
                        <label>Card Number</label>
                        <input name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date</label>
                          <input name="expiry" value={formData.expiry} onChange={handleInputChange} placeholder="MM/YY" />
                        </div>
                        <div className="form-group">
                          <label>CVV</label>
                          <input name="cvv" value={formData.cvv} onChange={handleInputChange} placeholder="123" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="momo-form">
                      <div className="form-group">
                        <label>Network</label>
                        <select name="momoNetwork" value={formData.momoNetwork} onChange={handleInputChange}>
                          <option value="MTN">MTN MoMo</option>
                          <option value="Vodafone">Vodafone Cash</option>
                          <option value="AirtelTigo">AirtelTigo Money</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Momo Number</label>
                        <input name="momoNumber" value={formData.momoNumber} onChange={handleInputChange} placeholder="+233 24 000 0000" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="step-actions">
                  <button className="btn-secondary" onClick={prevStep}><ArrowLeft size={18} /> Back</button>
                  <button className="btn-primary" onClick={nextStep}>Review Order <ChevronRight size={18} /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="review-step">
                <div className="step-header">
                  <CheckCircle size={24} />
                  <h2>Order Review</h2>
                </div>

                <div className="review-details">
                  <div className="review-section">
                    <h4>Shipping to</h4>
                    <p>{formData.firstName} {formData.lastName}</p>
                    <p>{formData.address}, {formData.city}</p>
                    <p>{formData.phone}</p>
                  </div>
                  <div className="review-section">
                    <h4>Payment Method</h4>
                    {paymentMethod === 'card' ? (
                      <p>Credit Card ending in {formData.cardNumber.slice(-4) || '****'}</p>
                    ) : (
                      <p>Mobile Money ({formData.momoNetwork}) - {formData.momoNumber}</p>
                    )}
                  </div>
                </div>

                <div className="step-actions">
                  <button className="btn-secondary" onClick={prevStep}><ArrowLeft size={18} /> Back</button>
                  <button className="btn-primary" onClick={placeOrder}>Place Order (${(cartTotal + 15).toFixed(2)})</button>
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
                <span>$15.00</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${(cartTotal + 15).toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-guarantee">
              <Truck size={18} />
              <p>Free returns within 30 days</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;

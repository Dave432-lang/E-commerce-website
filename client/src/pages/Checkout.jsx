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
  Tag,
  Printer,
  FileText
} from 'lucide-react';
import { VisaLogo, MastercardLogo, MtnBadge, MtnMomoLogo, TelecelLogo, TigoLogo } from '../components/PaymentLogos';

const Checkout = () => {
  const { cartItems, cartTotal, setIsCartOpen, setCartItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [placedOrderSummary, setPlacedOrderSummary] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
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
    let isMounted = true;
    const fetchFees = async () => {
      try {
        const fees = await orderService.getDeliveryFees();
        if (isMounted && Array.isArray(fees)) {
          setDeliveryFeesList(fees);
        }
      } catch (err) {
        // Fallback to static regional delivery fees table if API is temporarily unavailable
      }
    };
    fetchFees();
    return () => { isMounted = false; };
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

      const orderSummaryData = {
        orderId: orderResponse.orderId,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        items: [...cartItems],
        subtotal: cartTotal,
        deliveryFee: deliveryFee,
        discountAmount: discountAmount,
        total: finalTotal,
        customerName: `${formData.firstName} ${formData.lastName}`.trim() || user?.name || 'Customer',
        email: formData.email,
        phone: formData.phone,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.region}, Ghana`,
        paymentMethod: response.channel === 'card' ? 'Paystack Card' : 'Paystack Mobile Money'
      };

      setPlacedOrderSummary(orderSummaryData);
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

    if (!validatePaymentDetails()) return;

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
    setError('');
    if (!validatePaymentDetails()) return;
    setIsSubmitting(true);
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

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [momoNumber, setMomoNumber] = useState('');

  React.useEffect(() => {
    if (formData.phone && !momoNumber) {
      setMomoNumber(formData.phone);
    }
  }, [formData.phone]);

  const validatePaymentDetails = () => {
    if (selectedPaymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        setError('Please fill in your card details (Card Number, Expiry Date, and CVV).');
        return false;
      }
    } else {
      const cleanPhone = momoNumber.replace(/[\s\-\(\)\+]/g, '');
      if (!cleanPhone || cleanPhone.length < 9) {
        const providerName = selectedPaymentMethod === 'mtn' ? 'MTN MoMo' : selectedPaymentMethod === 'telecel' ? 'Telecel' : 'AirtelTigo';
        setError(`Please enter a valid ${providerName} mobile money phone number.`);
        return false;
      }
    }
    return true;
  };

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
            Thank you for shopping with us! An order confirmation receipt email has been sent to <strong>{formData.email}</strong> and your order is currently being prepared for delivery to <strong>{formData.city}, {formData.region} Region</strong>.
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

          <div className="success-actions" style={{ flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => setShowInvoiceModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Printer size={18} /> Print / Download Invoice
            </button>
            <Link to="/shop" className="btn-secondary">
              Continue Shopping
            </Link>
            <Link to="/profile" className="btn-secondary">
              View Order History
            </Link>
          </div>
        </div>

        {/* Modal Printable Invoice Overlay */}
        {showInvoiceModal && placedOrderSummary && (
          <div className="invoice-modal-overlay">
            <div className="invoice-modal-container">
              <div className="invoice-actions-bar no-print">
                <button type="button" className="btn-primary" onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.2rem', borderRadius: '50px' }}>
                  <Printer size={16} /> Print / Save as PDF
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowInvoiceModal(false)} style={{ padding: '0.55rem 1.2rem', borderRadius: '50px' }}>
                  Close Invoice
                </button>
              </div>

              <div className="invoice-paper" id="printable-invoice">
                <div className="invoice-header">
                  <div>
                    <h1 className="invoice-brand">BOUTIQUE</h1>
                    <p className="invoice-subbrand">Ghanaian Luxury & Modern Apparel</p>
                  </div>
                  <div className="invoice-meta-right">
                    <h2 className="invoice-title">OFFICIAL INVOICE RECEIPT</h2>
                    <p><strong>Invoice #:</strong> {placedOrderSummary.orderId}</p>
                    <p><strong>Date:</strong> {placedOrderSummary.date}</p>
                    <p><strong>Status:</strong> <span className="badge-paid">✓ CONFIRMED & PAID</span></p>
                  </div>
                </div>

                <div className="invoice-divider" />

                <div className="invoice-addresses-grid">
                  <div>
                    <h4 className="invoice-section-title">Billed To:</h4>
                    <p><strong>{placedOrderSummary.customerName}</strong></p>
                    <p>{placedOrderSummary.email}</p>
                    <p>{placedOrderSummary.phone}</p>
                  </div>
                  <div>
                    <h4 className="invoice-section-title">Shipping Address:</h4>
                    <p>{placedOrderSummary.shippingAddress}</p>
                    <p><strong>Payment Method:</strong> {placedOrderSummary.paymentMethod}</p>
                  </div>
                </div>

                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th>Options</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {placedOrderSummary.items.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.color || 'Standard'} / {item.size}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>GH₵{Number(item.price).toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>GH₵{(Number(item.price) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="invoice-summary-section">
                  <div className="invoice-totals-box">
                    <div className="invoice-row">
                      <span>Subtotal:</span>
                      <span>GH₵{placedOrderSummary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="invoice-row">
                      <span>Express Regional Shipping:</span>
                      <span>GH₵{placedOrderSummary.deliveryFee.toFixed(2)}</span>
                    </div>
                    {placedOrderSummary.discountAmount > 0 && (
                      <div className="invoice-row discount">
                        <span>Discount:</span>
                        <span>-GH₵{placedOrderSummary.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="invoice-row total-paid">
                      <span>Total Amount Paid:</span>
                      <span>GH₵{placedOrderSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="invoice-footer-note">
                  <p>Thank you for your purchase with Boutique! For any inquiries regarding your order, please contact <strong>support@boutique.com</strong> or WhatsApp our customer help desk.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Top Header & Luxury Stepper */}
      <div className="checkout-header-bar">
        <div className="checkout-brand-logo">BOUTIQUE</div>
        <div className="aurum-stepper">
          <div className={`stepper-step ${step > 1 ? 'completed' : 'active'}`}>
            <CheckCircle size={14} /> Cart
          </div>
          <div className="stepper-divider" />
          <div className={`stepper-step ${step > 1 ? 'completed' : step === 1 ? 'active' : ''}`}>
            <CheckCircle size={14} /> Delivery
          </div>
          <div className="stepper-divider" />
          <div className={`stepper-step ${step === 2 ? 'active' : ''}`}>
            <span>3</span> Payment
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
          <p>{error}</p>
        </div>
      )}

      <div className="checkout-layout-grid">
        <main className="checkout-card-main">
          {step === 1 && (
            <div className="step-content">
              <div className="checkout-title-group">
                <div className="title-icon-wrapper">
                  <MapPin size={22} />
                </div>
                <div>
                  <h1 className="checkout-main-title">Delivery <span>information</span></h1>
                  <p className="checkout-subtitle">Enter your shipping address for express courier delivery.</p>
                </div>
              </div>

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

                <div className="step-actions" style={{ marginTop: '1.5rem' }}>
                  <button type="submit" className="btn-aurum-pay" style={{ width: '100%' }}>
                    Proceed to Payment & Review <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              {/* Title Section */}
              <div className="checkout-title-group">
                <div className="title-icon-wrapper">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h1 className="checkout-main-title">Review & <span>secure payment</span></h1>
                  <p className="checkout-subtitle">One last look before we charge your order.</p>
                </div>
              </div>

              {isPlaceholderKey && (
                <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#eab308', lineHeight: '1.5' }}>
                  <strong>Paystack Public Key Required:</strong> To test with live/test Paystack popups, add your Paystack Public Key to <code>client/.env</code> as <code>VITE_PAYSTACK_PUBLIC_KEY</code>.<br />
                  <em>For local development without a key, click <strong>Simulate Test Payment</strong> below.</em>
                </div>
              )}

              {/* Delivery Address Card */}
              <div className="delivery-address-card">
                <div className="delivery-header">
                  <span className="delivery-label">
                    <MapPin size={14} color="#a855f7" /> DELIVERY ADDRESS
                  </span>
                  <button type="button" className="edit-delivery-btn" onClick={prevStep}>
                    Edit
                  </button>
                </div>
                <p className="customer-name">{formData.firstName} {formData.lastName}</p>
                <p className="customer-address-text">{formData.address}, {formData.city}</p>
                <p className="customer-address-text">{formData.region} Region, Ghana</p>
                <p className="customer-phone-text">Phone: {formData.phone}</p>
                
                <div className="delivery-status-badge">
                  <Truck size={14} color="#34d399" />
                  <span>Arrives in 1 - 3 Business Days — free express courier</span>
                </div>
              </div>

              {/* Payment Method Selection Grid */}
              <p className="payment-section-title">PAYMENT METHOD</p>
              <div className="payment-grid">
                {/* Card Option */}
                <div 
                  className={`payment-option-card ${selectedPaymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('card')}
                >
                  <div className="payment-option-left">
                    <div>
                      <p className="option-title">Card</p>
                      <p className="option-subtitle">Visa, Mastercard</p>
                    </div>
                  </div>
                  <div className="payment-option-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VisaLogo />
                    <MastercardLogo />
                  </div>
                </div>

                {/* MTN MoMo Option */}
                <div 
                  className={`payment-option-card ${selectedPaymentMethod === 'mtn' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('mtn')}
                >
                  <div className="payment-option-left" style={{ display: 'flex', alignItems: 'center' }}>
                    <MtnBadge />
                    <div>
                      <p className="option-title">MTN Momo</p>
                      <p className="option-subtitle">Mobile Money</p>
                    </div>
                  </div>
                  <div className="payment-option-right">
                    <MtnMomoLogo />
                  </div>
                </div>

                {/* Telecel Option */}
                <div 
                  className={`payment-option-card ${selectedPaymentMethod === 'telecel' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('telecel')}
                >
                  <div className="payment-option-left">
                    <div>
                      <p className="option-title">Telecel</p>
                      <p className="option-subtitle">Mobile Money</p>
                    </div>
                  </div>
                  <div className="payment-option-right">
                    <TelecelLogo />
                  </div>
                </div>

                {/* AirtelTigo Option */}
                <div 
                  className={`payment-option-card ${selectedPaymentMethod === 'airteltigo' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('airteltigo')}
                >
                  <div className="payment-option-left">
                    <div>
                      <p className="option-title">AirtelTigo</p>
                      <p className="option-subtitle">Mobile Money</p>
                    </div>
                  </div>
                  <div className="payment-option-right">
                    <TigoLogo />
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Details Input Section */}
              <div className="payment-input-container">
                {selectedPaymentMethod === 'card' ? (
                  <div className="payment-details-box animate-fade-in">
                    <div className="payment-box-header">
                      <CreditCard size={18} />
                      <span>Enter Card Details</span>
                    </div>
                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        name="number"
                        placeholder="0000 0000 0000 0000"
                        value={cardDetails.number}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                          setCardDetails(prev => ({ ...prev, number: val.slice(0, 19) }));
                        }}
                        maxLength={19}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          type="text"
                          name="expiry"
                          placeholder="MM / YY"
                          value={cardDetails.expiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 3) {
                              val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                            }
                            setCardDetails(prev => ({ ...prev, expiry: val.slice(0, 5) }));
                          }}
                          maxLength={5}
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV / CVC</label>
                        <input
                          type="password"
                          name="cvv"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setCardDetails(prev => ({ ...prev, cvv: val }));
                          }}
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Cardholder Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Kwame Mensah"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="payment-details-box animate-fade-in">
                    <div className="payment-box-header">
                      <Smartphone size={18} />
                      <span>
                        Enter {selectedPaymentMethod === 'mtn' ? 'MTN MoMo' : selectedPaymentMethod === 'telecel' ? 'Telecel Cash' : 'AirtelTigo Money'} Details
                      </span>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>
                        {selectedPaymentMethod === 'mtn' 
                          ? 'MTN Mobile Money Number' 
                          : selectedPaymentMethod === 'telecel' 
                          ? 'Telecel Number' 
                          : 'AirtelTigo Number'}
                      </label>
                      <input
                        type="tel"
                        name="momoNumber"
                        placeholder={
                          selectedPaymentMethod === 'mtn'
                            ? 'Enter MTN MoMo number (e.g. 024XXXXXXX)'
                            : selectedPaymentMethod === 'telecel'
                            ? 'Enter Telecel number (e.g. 020XXXXXXX)'
                            : 'Enter AirtelTigo number (e.g. 027XXXXXXX)'
                        }
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                      />
                      <p className="payment-input-hint">
                        An authorization prompt will be sent to this mobile money number to complete payment.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Encryption Footnote */}
              <div className="paystack-security-footnote">
                <ShieldCheck size={16} />
                <span>Secured by Paystack. Your details are encrypted end to end.</span>
              </div>

              {/* Bottom Action Row */}
              <div className="checkout-actions-row">
                <button type="button" className="btn-aurum-back" onClick={prevStep} disabled={isSubmitting}>
                  <ArrowLeft size={16} /> Back to delivery
                </button>

                <button 
                  type="button" 
                  className="btn-aurum-pay" 
                  onClick={handlePaystackPayment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin" size={18} /> Processing...</>
                  ) : (
                    <>Pay securely — GH₵{finalTotal.toFixed(2)}</>
                  )}
                </button>
              </div>

              <button 
                type="button"
                className="btn-secondary"
                onClick={handleSimulatePayment}
                disabled={isSubmitting}
                style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '0.85rem', borderColor: 'rgba(255,255,255,0.15)', color: '#94a3b8' }}
              >
                Simulate Test Payment (Dev Mode)
              </button>
            </div>
          )}
        </main>

        {/* Sidebar Order Summary */}
        <aside className="checkout-summary-card">
          <p className="summary-title-header">ORDER SUMMARY</p>
          
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.size}`} className="summary-product-item">
              <img src={item.image} alt={item.name} className="summary-product-thumb" />
              <div className="summary-product-details">
                <p className="summary-product-name">{item.name}</p>
                <p className="summary-product-meta">{item.color || 'Standard'} · {item.size} · Qty {item.quantity}</p>
                <p className="summary-product-price">GH₵{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}

          {/* Fee Breakdown */}
          <div className="summary-fee-line">
            <span>Subtotal</span>
            <span>GH₵{cartTotal.toFixed(2)}</span>
          </div>

          <div className="summary-fee-line">
            <span>Express delivery</span>
            <span style={{ color: deliveryFee === 0 ? '#34d399' : 'inherit' }}>
              {deliveryFee === 0 ? 'Free' : `GH₵${deliveryFee.toFixed(2)}`}
            </span>
          </div>

          {appliedCoupon && (
            <div className="summary-fee-line" style={{ color: '#34d399' }}>
              <span>Discount ({appliedCoupon.code})</span>
              <span>-GH₵{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-fee-line total-line">
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Total due</span>
            <span className="summary-total-amount">GH₵{finalTotal.toFixed(2)}</span>
          </div>

          <div className="guarantee-note-box">
            30-day returns and authentic warranty are included with every Boutique item.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;

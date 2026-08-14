import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, updateSize, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '3rem auto 0' }}>
      <div className="cart-page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingBag size={28} className="icon-primary" /> Shopping Cart
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          {cartItems.length === 1 ? '1 item in your cart' : `${cartItems.length} items in your cart`}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart-view" style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <ShoppingBag size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--text-muted)' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Add some premium items to get started.</p>
          <Link to="/shop" className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '50px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="cart-page-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          {/* Cart Items List */}
          <div className="cart-page-items" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cartItems.map((item) => (
              <div 
                key={`${item.id}-${item.size}`} 
                className="cart-page-item" 
                style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  padding: '1.5rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '16px',
                  alignItems: 'center',
                  background: 'var(--surface)'
                }}
              >
                <div className="cart-item-image" style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div className="cart-item-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id, item.size)} 
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Color: <span style={{ fontWeight: 500, color: 'var(--text)' }}>{item.color || 'Default'}</span></p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Size:</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['S', 'M', 'L', 'XL'].map(size => (
                        <button 
                          key={size}
                          className={`cart-size-btn ${item.size === size ? 'active' : ''}`}
                          onClick={() => updateSize(item.id, item.size, size)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            border: item.size === size ? '1px solid var(--primary)' : '1px solid var(--border)',
                            backgroundColor: item.size === size ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                            color: item.size === size ? '#ffffff' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div className="cart-item-quantity" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0, 0, 0, 0.2)' }}>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                        style={{ padding: '8px 12px', border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '0 12px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                        style={{ padding: '8px 12px', border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>GH₵{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar Summary */}
          <div className="cart-page-summary">
            <div 
              style={{ 
                border: '1px solid var(--border)', 
                borderRadius: '16px', 
                padding: '2rem', 
                background: 'var(--surface)',
                position: 'sticky',
                top: '6rem'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', color: 'var(--text)' }}>
                Order Summary
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>GH₵{cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Free</span>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  borderTop: '1px solid var(--border)', 
                  paddingTop: '1.5rem', 
                  marginBottom: '2rem' 
                }}
              >
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>Total</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>GH₵{cartTotal.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout} 
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '50px', 
                  fontWeight: 600, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer' 
                }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link to="/shop" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
                  or <span style={{ textDecoration: 'underline', color: 'var(--primary)' }}>Continue Shopping</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

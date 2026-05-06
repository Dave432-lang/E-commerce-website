import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`cart-backdrop ${isCartOpen ? 'open' : ''}`} 
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={20} />
            <h2>Your Cart</h2>
          </div>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} className="empty-cart-icon" />
              <p>Your cart is currently empty.</p>
              <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-row">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <button className="cart-item-remove" onClick={() => removeFromCart(item.id, item.size)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="cart-item-size">Size: {item.size}</p>
                    <div className="cart-item-row">
                      <div className="cart-item-quantity">
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-subtotal">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <p className="cart-tax-note">Taxes and shipping calculated at checkout</p>
          <button className="btn-primary checkout-btn" disabled={cartItems.length === 0}>
            Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;

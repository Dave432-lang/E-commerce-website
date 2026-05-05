import React from 'react';
import { X, ShoppingBag } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`cart-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={20} />
            <h2>Your Cart</h2>
          </div>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          <div className="empty-cart">
            <ShoppingBag size={48} className="empty-cart-icon" />
            <p>Your cart is currently empty.</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={onClose}>
              Continue Shopping
            </button>
          </div>
          {/* Future: Render cart items here */}
        </div>

        <div className="cart-footer">
          <div className="cart-subtotal">
            <span>Subtotal</span>
            <span>$0.00</span>
          </div>
          <p className="cart-tax-note">Taxes and shipping calculated at checkout</p>
          <button className="btn-primary checkout-btn" disabled>
            Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;

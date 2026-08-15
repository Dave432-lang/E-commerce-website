import React from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const WhatsAppButton = () => {
  const location = useLocation();
  const { isCartOpen } = useCart();
  const isCheckoutRoute = location.pathname === '/checkout';
  
  // Position on bottom-left if on checkout page OR if cart drawer is open
  const positionOnLeft = isCheckoutRoute || isCartOpen;

  const phoneNumber = '233540001122'; // Ghana phone format
  const message = encodeURIComponent('Hello Boutique Ghana! I have an inquiry about a product/order.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: positionOnLeft ? '24px' : 'auto',
        right: positionOnLeft ? 'auto' : '24px',
        backgroundColor: '#25D366',
        color: '#ffffff',
        borderRadius: '50px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
        zIndex: 1500, // Below Cart Drawer (z-index: 2000)
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '0.9rem',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
      }}
    >
      <MessageCircle size={22} fill="currentColor" />
      <span>WhatsApp Help</span>
    </a>
  );
};

export default WhatsAppButton;

import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
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
        right: '24px',
        backgroundColor: '#25D366',
        color: '#ffffff',
        borderRadius: '50px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
        zIndex: 9999,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '0.9rem',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
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

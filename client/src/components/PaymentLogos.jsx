import React from 'react';

// Visa Logo SVG Component
export const VisaLogo = () => (
  <svg viewBox="0 0 100 32" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M37.3 3.5L24.4 31.2h-6.2L11 6.8c-.5-2-1.9-2.7-3.7-3.7H.7l.2.8c3.5.8 7.5 2.2 9.9 3.5 1.5.8 1.9 1.5 2.4 3.4l5.8 20.4h6.5l10-27.7h-8.2zM52.7 3.5h-5.2c-1.6 0-2.8.5-3.5 2.1L32.7 31.2h6.5s1.1-2.9 1.3-3.6h8c.2.7.8 3.6.8 3.6h5.7L52.7 3.5zm-6.8 17.5c.5-1.4 2.5-6.8 2.5-6.8l1.4 6.8h-3.9zM76.9 11.2c-.1-3.6-3.2-5.4-7-5.4-5.4 0-9.2 2.9-9.2 7 0 3.1 2.7 4.8 4.8 5.8 2.1 1 2.8 1.7 2.8 2.6 0 1.4-1.7 2-3.3 2-2.8 0-4.3-.4-6.6-1.4l-.9 4.4c1.2.6 3.5 1.1 5.9 1.1 5.7 0 9.4-2.8 9.5-7.2 0-2.4-1.4-4.2-4.6-5.7-1.9-.9-3.1-1.6-3.1-2.6 0-.9 1-1.8 3.1-1.8 1.8 0 3.2.4 4.2.8l.5.2 1-4.8zM96.8 3.5h-5c-1.6 0-2.7.7-3.3 2.1l-9.3 25.6h6.5l1.3-3.6h8c.2.7.8 3.6.8 3.6h5.7L96.8 3.5zm-5.4 17.5l2.4-11.6 1.4 11.6h-3.8z" fill="#FFFFFF"/>
  </svg>
);

// Mastercard Logo SVG Component
export const MastercardLogo = () => (
  <svg viewBox="0 0 50 32" height="22" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#EB001B"/>
    <circle cx="34" cy="16" r="14" fill="#F79E1B"/>
    <path d="M25 5.5a13.9 13.9 0 0 0-5 10.5c0 4.1 1.8 7.8 5 10.5a13.9 13.9 0 0 0 5-10.5c0-4.1-1.8-7.8-5-10.5z" fill="#FF5F00"/>
  </svg>
);

// MTN Yellow Oval Badge for the left side of MTN Momo card
export const MtnBadge = () => (
  <div style={{
    background: '#FFCC00',
    borderRadius: '16px',
    padding: '2px 8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid #000000',
    marginRight: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    flexShrink: 0
  }}>
    <span style={{
      color: '#000000',
      fontSize: '0.65rem',
      fontWeight: '900',
      fontStyle: 'italic',
      letterSpacing: '0.5px',
      fontFamily: 'sans-serif'
    }}>MTN</span>
  </div>
);

// MTN MoMo Right Badge Logo
export const MtnMomoLogo = () => (
  <div style={{
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    background: '#FFCC00',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
  }}>
    <div style={{
      background: '#000000',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '2px'
    }}>
      <span style={{ color: '#FFCC00', fontSize: '0.45rem', fontWeight: 900, fontStyle: 'italic' }}>momo</span>
    </div>
    <span style={{ color: '#000000', fontSize: '0.45rem', fontWeight: 900, textTransform: 'lowercase', lineHeight: 1 }}>momo</span>
  </div>
);

// Telecel Logo SVG Component
export const TelecelLogo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
    <svg viewBox="0 0 40 24" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 2C20 2 14 8 16 16C19 27 31 26 34 32C36 36 33 38 29 38C24 38 19 35 17 32" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round"/>
    </svg>
    <span style={{
      color: '#FFFFFF',
      fontSize: '0.7rem',
      fontWeight: '900',
      letterSpacing: '1px',
      fontFamily: 'sans-serif',
      textTransform: 'uppercase',
      marginTop: '-2px'
    }}>TELECEL</span>
  </div>
);

// AirtelTigo Logo SVG Component
export const TigoLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <svg viewBox="0 0 75 36" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="25" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="sans-serif">tigo</text>
      <path d="M38 27C44 32 54 32 60 27" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  </div>
);

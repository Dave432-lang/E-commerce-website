import React from 'react';

const Loader = () => {
  return (
    <div className="loader-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      width: '100%'
    }}>
      <div className="spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '50%',
        borderTopColor: 'var(--primary-color, #000)',
        animation: 'spin 1s ease-in-out infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="hero-section">
      <div className="hero-content">
        <span style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '50px', background: 'rgba(229, 169, 60, 0.15)', color: 'var(--primary, #e5a93c)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          GHANA'S PREMIERE FASHION DESTINATION
        </span>
        <h1 className="hero-title">
          Authentic Ghanaian <br /> Luxury & Modern Style
        </h1>
        <p className="hero-subtitle">
          Discover curated apparel, handcrafted footwear, and tailored menswear & womenswear delivered anywhere across Ghana.
        </p>
        <div className="hero-actions" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/women')} style={{ padding: '0.85rem 1.75rem' }}>
            Shop Women <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" onClick={() => navigate('/men')} style={{ padding: '0.85rem 1.75rem' }}>
            Shop Men <ArrowRight size={18} />
          </button>
        </div>
      </div>
      
      {/* Decorative blurred blob for visual aesthetic */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
  );
};

export default Hero;

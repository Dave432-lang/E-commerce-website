import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Elevate Your <br /> Everyday Style
        </h1>
        <p className="hero-subtitle">
          Discover curated fashion and premium aesthetics tailored exclusively for you. 
          Experience a new standard of shopping.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate('/shop')}>
            Explore Collection <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" onClick={() => navigate('/shop')}>
            View Lookbook
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

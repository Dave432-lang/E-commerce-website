import React from 'react';
import { ArrowRight, Star, ShieldCheck, Zap, Globe } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { newArrivals, bestSellers, trendingNow } from '../utils/dummyData';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">New Collection 2024</span>
          <h1>Elevate Your Style With Premium Apparel</h1>
          <p>Discover our curated collection of high-quality garments designed for those who appreciate the finer details.</p>
          <div className="hero-btns">
            <Link to="/shop" className="btn-primary">Shop Now <ArrowRight size={18} /></Link>
            <a href="#collections" className="btn-secondary">View Collections</a>
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-image-overlay"></div>
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000" alt="Hero Fashion" />
        </div>
      </section>

      {/* Stats/Features Section */}
      <section className="features-strip">
        <div className="feature-item">
          <Globe size={24} />
          <span>Worldwide Shipping</span>
        </div>
        <div className="feature-item">
          <ShieldCheck size={24} />
          <span>Secure Payment</span>
        </div>
        <div className="feature-item">
          <Zap size={24} />
          <span>Fast Delivery</span>
        </div>
        <div className="feature-item">
          <Star size={24} />
          <span>Premium Quality</span>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="product-section">
        <div className="section-header">
          <h2>New Arrivals</h2>
          <Link to="/shop" className="view-all">View All <ArrowRight size={16} /></Link>
        </div>
        <ProductGrid products={newArrivals} />
      </section>

      {/* Collections Section */}
      <section id="collections" className="collections-section">
        <div className="section-header">
          <h2>Curated Collections</h2>
          <p>Explore our seasonal edits tailored for every occasion.</p>
        </div>
        <div className="collections-grid">
          <Link to="/shop?category=Men" className="collection-card large">
            <img src="/C:/Users/David Dagbanja/.gemini/antigravity/brain/36b12646-28e8-4fd9-907f-7cf502d73814/collection_men_luxury_1778028733216.png" alt="Men's Collection" />
            <div className="collection-info">
              <h3>Men's Collection</h3>
              <p>Sophisticated essentials for the modern man.</p>
              <span className="shop-link">Explore Now <ArrowRight size={16} /></span>
            </div>
          </Link>
          <div className="collection-stack">
            <Link to="/shop?category=Women" className="collection-card small">
              <img src="/C:/Users/David Dagbanja/.gemini/antigravity/brain/36b12646-28e8-4fd9-907f-7cf502d73814/collection_women_luxury_1778028992916.png" alt="Women's Collection" />
              <div className="collection-info">
                <h3>Women's Selection</h3>
                <p>Elegant pieces for every silhouette.</p>
                <span className="shop-link">Shop Selection <ArrowRight size={16} /></span>
              </div>
            </Link>
            <Link to="/shop?category=Accessories" className="collection-card small">
              <img src="/C:/Users/David Dagbanja/.gemini/antigravity/brain/36b12646-28e8-4fd9-907f-7cf502d73814/collection_accessories_luxury_v2_1778029668917.png" alt="Accessories" />
              <div className="collection-info">
                <h3>Signature Accessories</h3>
                <p>The perfect finishing touch.</p>
                <span className="shop-link">View All <ArrowRight size={16} /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="product-section alternate-bg">
        <div className="section-header">
          <h2>Trending Now</h2>
          <Link to="/shop" className="view-all">Shop Trends <ArrowRight size={16} /></Link>
        </div>
        <ProductGrid products={trendingNow} />
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-content">
            <span className="about-tag">Our Story</span>
            <h2>Redefining Modern Luxury Apparel</h2>
            <p>
              Founded with a passion for exceptional craftsmanship, Boutique is more than just a fashion brand. 
              We believe that luxury should be felt in every stitch and seen in every detail.
            </p>
            <p>
              Our mission is to provide timeless pieces that transcend seasons, combining sustainable practices 
              with premium materials sourced from the world's finest mills.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15+</span>
                <span className="stat-label">Countries Supplied</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Organic Cotton</span>
              </div>
            </div>
          </div>
          <div className="about-image">
            <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1000" alt="Our Atelier" />
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="product-section">
        <div className="section-header">
          <h2>Best Sellers</h2>
          <Link to="/shop" className="view-all">Shop All <ArrowRight size={16} /></Link>
        </div>
        <ProductGrid products={bestSellers} />
      </section>
    </div>
  );
};

export default Home;

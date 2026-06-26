import React from 'react';
import { Leaf, Award, Heart } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-image">
          <img src="/about-hero.png" alt="Boutique Interior" />
          <div className="about-hero-overlay">
            <h1>Our Story</h1>
            <p>Elevating everyday aesthetics with premium, sustainable fashion.</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="about-content">
        <div className="about-text-container">
          <h2>Who We Are</h2>
          <p>
            Founded in 2023, Boutique was born out of a desire to create clothing that is as thoughtful as it is beautiful. We believe that true style shouldn't come at the expense of our planet or the people who inhabit it.
          </p>
          <p>
            Our journey began in a small studio, crafting limited pieces for friends and family. Today, we are a global brand, yet we remain committed to our core philosophy: meticulous craftsmanship, timeless design, and an unwavering dedication to quality.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="about-values">
        <div className="values-container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <Award className="value-icon" size={40} />
              <h3>Uncompromising Quality</h3>
              <p>We source the finest materials globally to ensure every piece we create is built to last.</p>
            </div>
            <div className="value-card">
              <Leaf className="value-icon" size={40} />
              <h3>Sustainability</h3>
              <p>Our commitment to the earth is woven into our fabric. We utilize eco-friendly practices in every step.</p>
            </div>
            <div className="value-card">
              <Heart className="value-icon" size={40} />
              <h3>Community First</h3>
              <p>We celebrate diversity and design for the modern individual, creating clothing that empowers.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section (Optional) */}
      <section className="about-team">
        <div className="team-container">
          <h2>Meet the Founders</h2>
          <p>The visionaries behind Boutique.</p>
          <div className="team-grid">
            <div className="team-member">
              <div className="team-avatar placeholder-1"></div>
              <h4>Jane Doe</h4>
              <p>Creative Director</p>
            </div>
            <div className="team-member">
              <div className="team-avatar placeholder-2"></div>
              <h4>John Smith</h4>
              <p>Head of Operations</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

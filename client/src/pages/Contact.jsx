import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="contact-page container" style={{ padding: '3rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Contact Our Boutique</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          We would love to hear from you. Reach out to our Accra flagship store or customer service team.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {/* Store Info */}
        <div style={{ background: 'var(--card-bg, #1e1e2d)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Get In Touch</h2>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
            <MapPin size={24} style={{ color: 'var(--primary, #e5a93c)', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Flagship Store Location</h3>
              <p style={{ color: 'var(--text-muted)' }}>Lagos Avenue, East Legon</p>
              <p style={{ color: 'var(--text-muted)' }}>Accra, Ghana</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
            <Phone size={24} style={{ color: 'var(--primary, #e5a93c)', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Customer Hotline & MoMo Support</h3>
              <p style={{ color: 'var(--text-muted)' }}>+233 (0) 54 000 1122</p>
              <p style={{ color: 'var(--text-muted)' }}>+233 (0) 20 800 3344</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
            <Mail size={24} style={{ color: 'var(--primary, #e5a93c)', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Email Contact</h3>
              <p style={{ color: 'var(--text-muted)' }}>support@boutique.com.gh</p>
              <p style={{ color: 'var(--text-muted)' }}>orders@boutique.com.gh</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Clock size={24} style={{ color: 'var(--primary, #e5a93c)', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Opening Hours</h3>
              <p style={{ color: 'var(--text-muted)' }}>Monday – Saturday: 9:00 AM – 7:00 PM</p>
              <p style={{ color: 'var(--text-muted)' }}>Sunday: Closed</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ background: 'var(--card-bg, #1e1e2d)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Send Us a Message</h2>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <CheckCircle2 size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Message Received!</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Thank you for reaching out. Our representative will contact you via email or phone shortly.
              </p>
              <button 
                className="btn-primary" 
                onClick={() => setSubmitted(false)}
                style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ama Mensah"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</label>
                  <input 
                    type="email"
                    required
                    placeholder="ama@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Phone Number</label>
                  <input 
                    type="tel"
                    placeholder="054 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit' }}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Order Status & Delivery">Order Status & Delivery</option>
                  <option value="Custom Sizing / Fitting">Custom Sizing / Fitting</option>
                  <option value="Wholesale & Bulk Orders">Wholesale & Bulk Orders</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Your Message</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="How can we assist you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', borderRadius: '8px', fontWeight: 600, marginTop: '0.5rem' }}
              >
                <Send size={18} /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;

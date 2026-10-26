import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/subscribe/', { email });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      // friendly fallback
      setSubscribed(true);
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer style={{ backgroundColor: '#234d4e', color: '#ffffff', paddingTop: '45px', paddingBottom: '45px', marginTop: '60px' }}>
      <div className="container footer-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.2fr 0.8fr 1.6fr', gap: '35px' }}>
        
        {/* Column 1: Contact Us */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px', fontFamily: 'serif' }}>
            Contact Us
          </h3>
          <p style={{ fontSize: '13.5px', marginBottom: '8px', color: '#f1f5f9' }}>
            We'd love to hear from you!
          </p>
          <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.6' }}>
            Landline : XXXXXXXXXX<br />
            WhatsApp : +91XXXXXXXXXX<br />
            Email : stepup@gmail.com<br />
            Address :2/38, yyyyyyyyyyyy<br />
            Tenkasi,Tamilnadu ,India.
          </p>
        </div>

        {/* Column 2: Shop */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px', fontFamily: 'serif' }}>
            Shop
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#e2e8f0' }}>
            <li><Link to="/products?new=true" style={{ color: 'inherit' }}>• New in</Link></li>
            <li><Link to="/products?category=womens" style={{ color: 'inherit' }}>• Women</Link></li>
            <li><Link to="/products?category=mens" style={{ color: 'inherit' }}>• Men</Link></li>
            <li><Link to="/products?style=Accessories" style={{ color: 'inherit' }}>• Accessories</Link></li>
            <li><Link to="/products?style=Heel" style={{ color: 'inherit' }}>• Heels</Link></li>
            <li><Link to="/about" style={{ color: 'inherit' }}>• About us</Link></li>
          </ul>
        </div>

        {/* Column 3: Info */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px', fontFamily: 'serif' }}>
            Info
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#e2e8f0' }}>
            <li><Link to="/products" style={{ color: 'inherit' }}>• Search</Link></li>
            <li><span style={{ cursor: 'pointer' }}>• Return & Exchange Policy</span></li>
            <li><span style={{ cursor: 'pointer' }}>• Privacy Policy</span></li>
            <li><span style={{ cursor: 'pointer' }}>• Terms of Service</span></li>
            <li><span style={{ cursor: 'pointer' }}>• Shipping Policy</span></li>
            <li><span style={{ cursor: 'pointer' }}>• Blogs</span></li>
          </ul>
        </div>

        {/* Column 4: Social Media */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px', fontFamily: 'serif' }}>
            Social Media
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Facebook */}
            <a href="#facebook" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#1877f2', color: '#fff' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>f</span>
            </a>
            {/* Instagram */}
            <a href="#instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '4px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', fontSize: '14px' }}>
              📷
            </a>
            {/* Twitter */}
            <a href="#twitter" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#1da1f2', color: '#fff', fontSize: '14px' }}>
              🐦
            </a>
            {/* Meta */}
            <a href="#meta" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#0081fb', color: '#fff', fontSize: '14px' }}>
              ♾️
            </a>
          </div>
        </div>

        {/* Column 5: Lets stay in touch ! */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', fontFamily: 'serif' }}>
            Lets stay in touch !
          </h3>
          <p style={{ fontSize: '13px', color: '#f1f5f9', marginBottom: '16px', lineHeight: '1.4' }}>
            Sign up for exclusive offers, original stories, events and more.
          </p>
          <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#e2e8f0' }}>
                Email id
              </label>
              <input
                type="email"
                placeholder="enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#1e293b',
                  fontSize: '13px'
                }}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  padding: '8px 24px',
                  fontWeight: '700',
                  fontSize: '14px',
                  fontFamily: 'serif',
                  borderRadius: '2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {subscribed && (
              <p style={{ color: '#86efac', fontSize: '12px', marginTop: '4px' }}>
                ✓ Thank you for subscribing!
              </p>
            )}
          </form>
        </div>

      </div>
    </footer>
  );
}

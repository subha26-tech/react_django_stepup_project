import React, { useState } from 'react';
import axios from 'axios';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setSubmitError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);
    setSubmitError('');
    try {
      await axios.post('http://127.0.0.1:8000/api/contact/', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setSubmitError(
        error.response?.data?.error || 'Unable to send your enquiry. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in container" style={{ maxWidth: '1080px', marginTop: '36px', marginBottom: '80px' }}>
      
      {/* Top Section: Info on Left, Image on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '50px', alignItems: 'center', marginBottom: '36px' }}>
        
        {/* Left Information */}
        <div>
          <h1 className="serif-font" style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>
            Contact Us
          </h1>

          <h2 className="serif-font" style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
            For Online Orders
          </h2>

          <div style={{ fontSize: '14.5px', color: '#1e293b', lineHeight: '1.8' }}>
            <p style={{ fontWeight: '500', color: '#475569' }}>Inquiry/Complanit</p>
            <p style={{ fontWeight: '600', marginBottom: '14px' }}>9976357250</p>

            <p style={{ fontWeight: '500', color: '#475569' }}>Any other queries</p>
            <p style={{ fontWeight: '600' }}>9976357250</p>
            <p style={{ fontWeight: '600' }}>9976357250</p>
            <p style={{ color: '#475569', marginBottom: '14px' }}>10 AM-7.00 PM</p>

            <p>
              Email: <a href="mailto:customercarestepup.in@gmail.com" style={{ textDecoration: 'underline', color: '#1f4747' }}>customercarestepup.in@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Right Photo Banner */}
        <div style={{ borderRadius: '6px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <img 
            src="/assets/contact_banner.png" 
            alt="StepUp Footwear Collection" 
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = '/assets/image.png'; }}
          />
        </div>

      </div>

      <div style={{ borderBottom: '1px solid #1e293b', marginBottom: '40px' }}></div>

      {/* Bottom Section: Enquiry Form */}
      <section style={{ maxWidth: '800px' }}>
        <h2 className="serif-font" style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>
          Enquiry Form
        </h2>

        {submitted && (
          <div role="status" style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '12px 18px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #bbf7d0', fontSize: '14px' }}>
            ✓ Thank you for reaching out! We will get back to you shortly.
          </div>
        )}
        {submitError && (
          <p role="alert" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px 18px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #fecaca', fontSize: '14px' }}>
            {submitError}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #1e293b',
                borderRadius: '2px',
                fontSize: '14px',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Email & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #1e293b',
                  borderRadius: '2px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #1e293b',
                  borderRadius: '2px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>

          {/* Message */}
          <div style={{ marginBottom: '26px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
              Message
            </label>
            <textarea
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #1e293b',
                borderRadius: '2px',
                fontSize: '14px',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#2b5050',
              color: '#ffffff',
              padding: '10px 48px',
              borderRadius: '6px',
              fontFamily: 'serif',
              fontSize: '17px',
              fontWeight: '600',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>

        </form>
      </section>

    </div>
  );
}

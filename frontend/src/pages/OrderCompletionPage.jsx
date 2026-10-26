import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function OrderCompletionPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { lastOrder } = useCart();
  const { user } = useAuth();
  const [order, setOrder] = useState(lastOrder || null);

  const displayOrderNo = orderId ? decodeURIComponent(orderId) : (order?.order_number || '#Bh2300006');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (orderId) {
      const cleanNo = decodeURIComponent(orderId).replace('#', '');
      axios.get(`http://127.0.0.1:8000/api/orders/${cleanNo}/`, {
        headers: { Authorization: `Token ${user?.token}` },
      })
        .then(res => setOrder(res.data))
        .catch(err => console.log('Using local order:', err));
    }
  }, [orderId, user?.token]);

  return (
    <div className="fade-in container" style={{ maxWidth: '800px', marginTop: '50px', marginBottom: '80px' }}>
      
      {/* Box */}
      <div 
        style={{
          border: '1px solid #1e293b',
          backgroundColor: '#ffffff',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}
      >
        
        {/* Animated Checkmark Badge Icon */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/assets/order_success_badge.png" 
            alt="Order Success" 
            style={{ width: '130px', height: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              // SVG fallback
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Heading */}
        <h1 className="serif-font" style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
          Thankyou for your ordering
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', marginBottom: '4px' }}>
          We've received your order will ship in 5-7 business days.
        </p>
        <p style={{ fontSize: '15.5px', color: '#0f172a', fontWeight: '500', marginBottom: '40px' }}>
          Your order number is <span style={{ fontWeight: '700' }}>{displayOrderNo}</span>
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
          <Link
            to="/profile?tab=orders"
            style={{
              border: '1px solid #1e293b',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '12px 36px',
              borderRadius: '6px',
              fontFamily: 'serif',
              fontSize: '17px',
              fontWeight: '600',
              minWidth: '160px',
              display: 'inline-block'
            }}
          >
            View My Orders
          </Link>

          <button
            onClick={() => navigate(`/tracking/${encodeURIComponent(displayOrderNo)}`)}
            style={{
              backgroundColor: '#234d4e',
              color: '#ffffff',
              padding: '12px 36px',
              borderRadius: '6px',
              fontFamily: 'serif',
              fontSize: '17px',
              fontWeight: '600',
              minWidth: '160px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            Track Shipment
          </button>
        </div>

      </div>

    </div>
  );
}

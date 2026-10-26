import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Lock, Truck, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, updateSize, cartTotal, cartSyncError } = useCart();

  // Countdown timer: 23 hours, 53 minutes, 50 seconds
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 53,
    seconds: 50
  });
  const [deliveryInfoOpen, setDeliveryInfoOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!deliveryInfoOpen) return undefined;

    const handleKeyDown = event => {
      if (event.key === 'Escape') setDeliveryInfoOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deliveryInfoOpen]);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="fade-in container" style={{ maxWidth: '980px', marginTop: '28px', marginBottom: '80px' }}>
      
      {/* Title */}
      <h1 className="serif-font" style={{ textAlign: 'center', fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>
        Your Cart
      </h1>

      {cartSyncError && (
        <p role="alert" style={{ color: '#b91c1c', textAlign: 'center', marginBottom: '20px' }}>
          {cartSyncError} Your cart remains available on this device.
        </p>
      )}

      {/* Arriving Notice Pill */}
      <div 
        style={{
          border: '1px solid #1e293b',
          borderRadius: '9999px',
          padding: '12px 24px',
          textAlign: 'center',
          fontSize: '15px',
          color: '#0f172a',
          marginBottom: '36px',
          backgroundColor: '#ffffff'
        }}
      >
        <span style={{ fontWeight: '700' }}>Free & Fast arriving by Monday </span>
        <span style={{ fontWeight: '400' }}>
          Order within {timeLeft.hours} hours,{timeLeft.minutes} minutes,{timeLeft.seconds} seconds
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '20px' }}>Your cart is empty.</p>
          <Link
            to="/products"
            style={{
              backgroundColor: '#1f4747',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '6px',
              fontWeight: '600'
            }}
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div>
          {/* Cart Items List */}
          {cartItems.map((item, idx) => (
            <div 
              key={`${item.id}-${item.size}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 0',
                borderBottom: '1px solid #1e293b',
                gap: '24px',
                flexWrap: 'wrap'
              }}
            >
              {/* Product Image */}
              <div style={{ width: '180px', height: '140px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                <img 
                  src={item.image || '/assets/image (46).png'} 
                  alt={item.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = '/assets/image (46).png'; }}
                />
              </div>

              {/* Product Info */}
              <div style={{ flex: '1', minWidth: '200px' }}>
                <h3 className="serif-font" style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                  {item.brand || 'Comfy Steps'}
                </h3>
                <p style={{ fontSize: '14.5px', color: '#334155', marginBottom: '10px' }}>
                  {item.name}
                </p>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                  MRP₹ {Number(item.price).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Selectors (Size & Quantity) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
                {/* Size Dropdown */}
                <select
                  value={item.size}
                  onChange={(e) => updateSize(item.id, item.size, e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #1e293b',
                    borderRadius: '2px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  {[36, 37, 38, 39, 40, 41, 42, 43, 44, 45].map(s => (
                    <option key={s} value={String(s)}>Size ({s})</option>
                  ))}
                </select>

                {/* Quantity Dropdown */}
                <select
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, item.size, Number(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #1e293b',
                    borderRadius: '2px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  {[1, 2, 3, 4, 5].map(q => (
                    <option key={q} value={q}>Quantity ({q})</option>
                  ))}
                </select>
              </div>

              {/* Remove Action */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#0f172a'
                  }}
                >
                  <span>Remove</span>
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}

          {/* Summary Section */}
          <div style={{ paddingTop: '20px', paddingBottom: '20px' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '10px' }}>
              Summary
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14.5px' }}>
              <span style={{ color: '#0f172a' }}>Total</span>
              <span style={{ fontWeight: '600' }}>₹ {Number(cartTotal).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14.5px' }}>
              <span style={{ color: '#0f172a' }}>Delivery</span>
              <span style={{ color: '#0f172a' }}>Free</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setDeliveryInfoOpen(true)}
                aria-haspopup="dialog"
                style={{ fontSize: '13.5px', color: '#0f172a', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Delivery & return information</span>
                <Truck size={16} />
              </button>
            </div>
          </div>

          {/* Checkout Securely Button */}
          <div style={{ marginBottom: '28px' }}>
            <button
              onClick={handleCheckout}
              style={{
                width: '100%',
                backgroundColor: '#2b5050',
                color: '#ffffff',
                padding: '14px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <Lock size={18} />
              <span>Checkout Securely</span>
            </button>
          </div>

        </div>
      )}

      {deliveryInfoOpen && (
        <div
          onClick={() => setDeliveryInfoOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-info-title"
            onClick={event => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '28px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
              <h2 id="delivery-info-title" className="serif-font" style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>
                Delivery & Returns
              </h2>
              <button
                type="button"
                onClick={() => setDeliveryInfoOpen(false)}
                aria-label="Close delivery and returns information"
                style={{ display: 'flex', padding: '6px', color: '#334155' }}
              >
                <X size={20} />
              </button>
            </div>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#1f4747' }}>Delivery options</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', lineHeight: 1.7 }}>
                <li>Standard delivery: free; estimated arrival in 5–7 business days.</li>
                <li>Express delivery: ₹199; estimated arrival in 2–3 business days.</li>
              </ul>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                Delivery times are estimates and may vary by location and product availability.
              </p>
            </section>

            <section>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#1f4747' }}>Returns & exchanges</h3>
              <p style={{ margin: 0, color: '#334155', lineHeight: 1.7 }}>
                You can request a return or exchange within 7 days of delivery. Items should be unused and returned with their original packaging and tags. Please contact support through the Contact Us page before sending an item back so we can confirm eligibility and next steps.
              </p>
              <p style={{ margin: '10px 0 0', color: '#334155', lineHeight: 1.7 }}>
                If an item arrives damaged or incorrect, contact support as soon as possible and include your order number and photos of the item and packaging.
              </p>
              <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                Returned items are subject to inspection. Support will confirm the available resolution and any applicable refund details.
              </p>
            </section>
          </section>
        </div>
      )}

    </div>
  );
}

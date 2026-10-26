import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Home, Truck, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function TrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orderResult, setOrderResult] = useState({ key: '', order: null, error: '' });
  const displayOrderNo = orderId ? decodeURIComponent(orderId) : '';
  const requestKey = `${user?.token || ''}:${displayOrderNo}`;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user?.token || !displayOrderNo) return undefined;

    let cancelled = false;
    const cleanNo = displayOrderNo.replace('#', '');
    axios.get(`http://127.0.0.1:8000/api/orders/${cleanNo}/`, {
      headers: { Authorization: `Token ${user?.token}` },
    })
      .then(res => {
        if (!cancelled) setOrderResult({ key: requestKey, order: res.data, error: '' });
      })
      .catch(() => {
        if (!cancelled) {
          setOrderResult({
            key: requestKey,
            order: null,
            error: 'Unable to load this order. Check the order number and try again.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [displayOrderNo, requestKey, user?.token]);

  const loading = Boolean(user?.token && displayOrderNo) && orderResult.key !== requestKey;
  const error = !user?.token
    ? 'Please sign in to track this order.'
    : !displayOrderNo
      ? 'Open Track Order from your order list to see shipment progress.'
      : orderResult.key === requestKey ? orderResult.error : '';
  const order = orderResult.key === requestKey ? orderResult.order : null;
  const statusOrder = ['Placed', 'Dispatched', 'In Transit', 'Delivered'];
  const currentStatusIndex = statusOrder.indexOf(order?.status);
  const history = order?.status_history || [];
  const firstItem = order?.items?.[0];

  const renderIcon = (type, isCompleted) => {
    const color = isCompleted ? '#ffffff' : '#64748b';
    switch (type?.toLowerCase()) {
      case 'cart':
        return <ShoppingCart size={22} color={color} />;
      case 'home':
        return <Home size={22} color={color} />;
      case 'truck':
        return <Truck size={22} color={color} />;
      case 'check':
      case 'thumbsup':
      default:
        return <ThumbsUp size={22} color={color} />;
    }
  };

  if (loading || error || !order) {
    return (
      <div className="fade-in container" style={{ maxWidth: '640px', marginTop: '30px', marginBottom: '80px' }}>
        <div role={error ? 'alert' : 'status'} style={{ padding: '32px', textAlign: 'center', color: error ? '#b91c1c' : '#475569' }}>
          {loading ? 'Loading order status…' : error}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in container" style={{ maxWidth: '640px', marginTop: '30px', marginBottom: '80px' }}>
      
      {/* Outer Card */}
      <div 
        style={{
          border: '1px solid #1e293b',
          backgroundColor: '#ffffff',
          borderRadius: '2px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}
      >
        {/* Card Header with Back Link */}
        <div style={{ padding: '24px 28px 16px 28px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <button 
              onClick={() => navigate(-1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}
            >
              <ArrowLeft size={20} />
              <h2 className="serif-font" style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
                Your Order
              </h2>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#334155', marginBottom: '16px' }}>
            <span>Order no {order.order_number || displayOrderNo}</span>
            <span style={{ fontWeight: '600' }}>
              {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Razorpay'} ₹ {Number(order.total_amount).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Product Thumbnail & Details */}
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center', paddingBottom: '16px' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
              <img 
                src={firstItem?.product_image || '/assets/image (46).png'} 
                alt={firstItem?.product_name || 'Ordered product'} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = '/assets/image (46).png'; }}
              />
            </div>
            <div>
              <h3 className="serif-font" style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
                {firstItem?.brand_name || 'StepUp'}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#334155', marginBottom: '6px' }}>
                {firstItem?.product_name || 'Order details'}
              </p>
              <p style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                {order.expected_delivery}
              </p>
              <p style={{ fontSize: '13px', color: '#1f4747', fontWeight: '700', marginTop: '6px' }}>
                Current status: {order.status}
              </p>
            </div>
          </div>

        </div>

        {/* Grey Timeline Container */}
        <div style={{ backgroundColor: '#f1f5f9', padding: '36px 36px', minHeight: '380px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {history.map((step, idx) => {
              const completed = currentStatusIndex >= idx;
              const isLast = idx === history.length - 1;
              return (
                <div key={idx} style={{ display: 'flex', gap: '24px', position: 'relative' }}>
                  
                  {/* Icon Circle + Connecting Line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div 
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        backgroundColor: completed ? '#2d4e4e' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {renderIcon(step.icon, completed)}
                    </div>

                    {/* Connecting line to next item */}
                    {!isLast && (
                      <div 
                        style={{
                          width: '2px',
                          height: '55px',
                          borderLeft: completed ? '2px solid #2d4e4e' : '2px dashed #94a3b8',
                          margin: '2px 0'
                        }}
                      />
                    )}
                  </div>

                  {/* Step Info */}
                  <div style={{ paddingTop: '6px', paddingBottom: !isLast ? '30px' : '0' }}>
                    <h4 className="serif-font" style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
                      {step.title}
                    </h4>
                    <p style={{ fontSize: '14px', color: completed ? '#1e293b' : '#64748b', fontWeight: completed ? '500' : '400' }}>
                      {step.time}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>
        </div>

      </div>

    </div>
  );
}

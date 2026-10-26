import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function PaymentFailedPage() {
  const { state } = useLocation();
  const { lastOrder } = useCart();
  const order = state?.order || (lastOrder?.payment_status === 'Failed' ? lastOrder : null);
  const paymentFailureReason = order?.payment_failure_reason;

  return (
    <div className="fade-in container" style={{ maxWidth: '800px', marginTop: '50px', marginBottom: '80px' }}>
      <section
        style={{
          border: '1px solid #fecaca',
          backgroundColor: '#ffffff',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 24px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            fontSize: '48px',
            lineHeight: '72px',
            fontWeight: '700',
          }}
        >
          ×
        </div>
        <h1 className="serif-font" style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
          Payment failed
        </h1>
        <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', marginBottom: '12px' }}>
          {paymentFailureReason || 'Your payment could not be completed. Your cart is still available so you can try again.'}
        </p>
        {order?.order_number && (
          <p style={{ fontSize: '15px', color: '#334155', marginBottom: '12px' }}>
            Order number: <strong>{order.order_number}</strong>
          </p>
        )}
        {order && (
          <>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '8px' }}>
              Order status: <strong>{order.status}</strong> · Payment status: <strong>{order.payment_status}</strong>
            </p>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
              Expected delivery: {order.expected_delivery || 'Not scheduled until payment is confirmed.'}
            </p>
          </>
        )}
        {state?.statusUpdateError && (
          <p role="alert" style={{ color: '#b91c1c', backgroundColor: '#fee2e2', padding: '10px 12px', borderRadius: '4px', margin: '0 auto 24px', maxWidth: '520px' }}>
            We could not update your order payment status. Please contact support with your order number.
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '28px' }}>
          <Link
            to="/checkout"
            style={{ backgroundColor: '#234d4e', color: '#ffffff', padding: '12px 28px', borderRadius: '6px', fontWeight: '600' }}
          >
            Try again
          </Link>
          <Link
            to="/cart"
            style={{ border: '1px solid #234d4e', color: '#234d4e', padding: '12px 28px', borderRadius: '6px', fontWeight: '600' }}
          >
            Return to cart
          </Link>
        </div>
      </section>
    </div>
  );
}

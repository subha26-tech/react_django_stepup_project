import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, setLastOrder } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(isAuthenticated ? 'address' : 'signin');
  const [deliveryOption, setDeliveryOption] = useState('standard');

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    paymentMethod: 'COD', // 'COD' or 'RAZORPAY'
    addressLine: '',
    city: '',
    state: '',
    landmark: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const deliveryFee = deliveryOption === 'express' ? 199 : 0;
  const checkoutTotal = Number(cartTotal || 2799) + deliveryFee;

  const primaryItem = cartItems.length > 0 ? cartItems[0] : {
    id: 1,
    name: "Harlan Mens Tan Boat Shoe",
    brand: "Comfy Steps",
    price: 2799,
    size: "41",
    quantity: 1,
    image: "/assets/image (46).png"
  };
  const orderItems = cartItems.length > 0 ? cartItems : [primaryItem];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMsg('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRazorpayPayment = async (orderData) => {
    try {
      if (!window.Razorpay) {
        setErrorMsg('Payment service is unavailable. Choose another payment method or try again.');
        setStep('payment');
        setLoading(false);
        return;
      }

      const amountInPaise = Math.round(Number(orderData.order?.total_amount) * 100);
      if (
        !orderData.razorpay_order_id ||
        typeof orderData.razorpay_key_id !== 'string' ||
        !orderData.razorpay_key_id.trim() ||
        !Number.isSafeInteger(amountInPaise) ||
        amountInPaise < 1
      ) {
        setErrorMsg('Payment order could not be created. Please try again.');
        setStep('payment');
        setLoading(false);
        return;
      }

      const isRazorpayTestMode = orderData.razorpay_key_id.startsWith('rzp_test_');
      const phoneDigits = formData.phone.replace(/\D/g, '');
      const razorpayContact = phoneDigits.length === 10
        ? `+91${phoneDigits}`
        : formData.phone.trim();

      const options = {
        key: orderData.razorpay_key_id,
        amount: amountInPaise,
        currency: 'INR',
        name: 'StepUp.in',
        description: 'Payment for Shoe Order',
        image: '/assets/stepup_logo.png',
        order_id: orderData.razorpay_order_id,
        handler: async function (response) {
          try {
            const verification = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/orders/razorpay-verify/`, {
              order_number: orderData.order.order_number,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (!verification.data?.success) {
              throw new Error('Payment could not be verified.');
            }
            setLastOrder(verification.data.order || orderData.order);
            clearCart();
            navigate(`/order-success/${encodeURIComponent(orderData.order.order_number)}`);
          } catch {
            console.error('Payment verification failed.');
            setErrorMsg('Payment could not be verified. Choose a payment method and try again.');
            setStep('payment');
            setLoading(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: razorpayContact,
        },
        ...(isRazorpayTestMode && { readonly: { contact: true } }),
        theme: {
          color: '#1f4747'
        },
        modal: {
          ondismiss: function () {
            setErrorMsg('Payment was cancelled. Choose a payment option to continue.');
            setStep('payment');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        let updatedOrder;
        let statusUpdateError;
        try {
          const result = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/orders/razorpay-failed/`, {
            order_number: orderData.order.order_number,
            razorpay_order_id: orderData.razorpay_order_id,
            razorpay_payment_id: response.error?.metadata?.payment_id,
            error_description: response.error?.description,
          });
          updatedOrder = result.data.order;
          setLastOrder(updatedOrder);
        } catch (err) {
          console.error('Failed to update the order payment status:', err);
          statusUpdateError = true;
        } finally {
          setLoading(false);
          navigate('/payment-failed', {
            state: {
              order: updatedOrder || orderData.order,
              statusUpdateError,
            },
          });
        }
      });
      rzp.open();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Unable to start payment. Choose another payment option or try again.');
      setStep('payment');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 'review') return;
    setLoading(true);
    setErrorMsg('');

    const payload = {
      ...formData,
      payment_method: formData.paymentMethod,
      total_amount: checkoutTotal,
      delivery_fees: deliveryFee,
      items: orderItems
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/orders/create/`, payload, {
        headers: user?.token ? { Authorization: `Token ${user.token}` } : {},
      });
      const data = res.data;

      if (formData.paymentMethod === 'RAZORPAY') {
        await handleRazorpayPayment(data);
      } else {
        // COD order completed
        setLastOrder(data.order);
        clearCart();
        navigate(`/order-success/${encodeURIComponent(data.order.order_number)}`);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.error;
      if (formData.paymentMethod === 'RAZORPAY') {
        setErrorMsg(serverMessage || 'Unable to create the payment order. Please review your payment method and try again.');
        setStep('payment');
        return;
      }
      setErrorMsg(serverMessage || 'Unable to save your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in container" style={{ maxWidth: '1100px', marginTop: '28px', marginBottom: '80px' }}>
      
      {/* Title */}
      <h1 className="serif-font" style={{ textAlign: 'center', fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '32px' }}>
        Checkout
      </h1>

      {!isAuthenticated ? (
        <section style={{ maxWidth: '640px', margin: '0 auto', padding: '36px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center' }}>
          <h2 className="serif-font" style={{ fontSize: '24px', marginBottom: '12px', color: '#0f172a' }}>Sign in or register to continue</h2>
          <p style={{ color: '#475569', marginBottom: '24px' }}>Your cart will be ready after you sign in. New to StepUp? Create an account to continue checkout.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/login" state={{ from: '/checkout' }} style={{ backgroundColor: '#234d4e', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', fontWeight: '600' }}>
              Sign In
            </Link>
            <Link to="/register" state={{ from: '/checkout' }} style={{ border: '1px solid #234d4e', color: '#234d4e', padding: '12px 24px', borderRadius: '6px', fontWeight: '600' }}>
              Register
            </Link>
            <button type="button" onClick={() => navigate('/cart')} style={{ padding: '12px 24px', color: '#334155' }}>
              Return to cart
            </button>
          </div>
        </section>
      ) : (
      <>
      <ol aria-label="Checkout progress" style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
        {[
          ['address', 'Delivery address'],
          ['delivery', 'Delivery option'],
          ['payment', 'Payment method'],
          ['review', 'Review order'],
        ].map(([key, label], index) => {
          const currentIndex = ['address', 'delivery', 'payment', 'review'].indexOf(step);
          const active = currentIndex >= index;
          return (
            <li key={key} aria-current={step === key ? 'step' : undefined} style={{ padding: '8px 12px', borderRadius: '20px', backgroundColor: active ? '#234d4e' : '#e2e8f0', color: active ? '#ffffff' : '#475569', fontSize: '13px', fontWeight: '600' }}>
              {index + 1}. {label}
            </li>
          );
        })}
      </ol>

      {/* Main Grid: Left Order Summary, Right Form */}
      <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '360px minmax(0, 1fr)', gap: '0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
        
        {/* Left Column: Order Summary (Dark Teal) */}
        <div style={{ backgroundColor: '#2d4747', color: '#ffffff', padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 className="serif-font" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
              Order Summary
            </h2>

            {/* Item Details */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#ffffff', flexShrink: 0 }}>
                <img 
                  src={primaryItem.image || '/assets/image (46).png'} 
                  alt={primaryItem.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = '/assets/image (46).png'; }}
                />
              </div>
              <div style={{ fontSize: '13.5px' }}>
                <h3 className="serif-font" style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px', color: '#ffffff' }}>
                  {primaryItem.brand || 'Comfy Steps'}
                </h3>
                <p style={{ color: '#e2e8f0', marginBottom: '8px' }}>
                  {primaryItem.name}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '4px', color: '#cbd5e1' }}>
                  <span>Size</span>
                  <span>{primaryItem.size}</span>
                  <span>Quantity</span>
                  <span>{primaryItem.quantity}</span>
                  <span>MRP</span>
                  <span>₹ {Number(primaryItem.price).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Totals */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#e2e8f0' }}>
              <span>Amount</span>
              <span>₹ {Number(cartTotal || primaryItem.price).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px', color: '#e2e8f0' }}>
              <span>Delivery fees</span>
              <span>{deliveryFee === 0 ? 'Free' : `₹ ${deliveryFee.toLocaleString('en-IN')}`}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700' }}>
              <span>Total</span>
              <span>₹ {checkoutTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Your Order Form (White) */}
        <div className="checkout-form-panel" style={{ backgroundColor: '#fafaf9', padding: '36px 40px', minWidth: 0 }}>
          <form onSubmit={handleSubmit} onKeyDown={event => {
            if (event.key === 'Enter' && step !== 'review' && event.target.tagName !== 'TEXTAREA') {
              event.preventDefault();
            }
          }}>
            <h2 className="serif-font" style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
              {step === 'address' ? 'Select Delivery Address' : step === 'delivery' ? 'Choose Delivery Option' : step === 'payment' ? 'Select Payment Method' : 'Review Order Details'}
            </h2>
            {errorMsg && (
              <p role="alert" style={{ color: '#b91c1c', backgroundColor: '#fee2e2', padding: '10px 12px', borderRadius: '4px', marginBottom: '16px' }}>
                {errorMsg}
              </p>
            )}

            {/* Personal Details */}
            {step === 'address' && <div data-checkout-address style={{ marginBottom: '24px' }}>
              <h3 className="serif-font" style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                Personal Details
              </h3>
              <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '2px', backgroundColor: '#ffffff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '2px', backgroundColor: '#ffffff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Email id</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={Boolean(user?.email)}
                    required
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '2px', backgroundColor: '#ffffff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter your phone no"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '2px', backgroundColor: '#ffffff', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>}

            {step === 'payment' && (
              <div className="payment-method-options" style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
                {[
                  {
                    value: 'COD',
                    title: 'Cash on Delivery',
                    detail: 'Pay when your order is delivered.',
                  },
                  {
                    value: 'RAZORPAY',
                    title: 'Pay Online with Razorpay',
                    detail: 'UPI, cards, and net banking. Payment details are entered securely in Razorpay Checkout.',
                  },
                ].map(option => (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '18px',
                      border: `1px solid ${formData.paymentMethod === option.value ? '#234d4e' : '#cbd5e1'}`,
                      borderRadius: '8px',
                      backgroundColor: formData.paymentMethod === option.value ? '#f0fdfa' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={formData.paymentMethod === option.value}
                      onChange={handleChange}
                      style={{ marginTop: '4px' }}
                    />
                    <span>
                      <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>{option.title}</strong>
                      <span style={{ color: '#475569', fontSize: '13px' }}>{option.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Shipping Address */}
            {step === 'address' && <div data-checkout-address style={{ marginBottom: '28px' }}>
              <h3 className="serif-font" style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                Shipping Address
              </h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Address Line 1</label>
                <input
                  type="text"
                  name="addressLine"
                  placeholder="Enter your address"
                  value={formData.addressLine}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '2px', backgroundColor: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '2px', backgroundColor: '#ffffff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Your state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '2px', backgroundColor: '#ffffff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Landmark</label>
                  <input
                    type="text"
                    name="landmark"
                    placeholder="Any landmark(famous place/mall)"
                    value={formData.landmark}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '2px', backgroundColor: '#ffffff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Code"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '2px', backgroundColor: '#ffffff', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>}

            {step === 'delivery' && (
              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {[
                  { value: 'standard', title: 'Standard delivery', detail: 'Free · Arrives in 5–7 business days', fee: 'Free' },
                  { value: 'express', title: 'Express delivery', detail: 'Arrives in 2–3 business days', fee: '₹199' },
                ].map(option => (
                  <label key={option.value} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '16px', border: `1px solid ${deliveryOption === option.value ? '#234d4e' : '#cbd5e1'}`, borderRadius: '6px', backgroundColor: deliveryOption === option.value ? '#f0fdfa' : '#ffffff', cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="radio" name="deliveryOption" value={option.value} checked={deliveryOption === option.value} onChange={() => {
                        setDeliveryOption(option.value);
                        setErrorMsg('');
                      }} />
                      <span><strong style={{ display: 'block', color: '#0f172a' }}>{option.title}</strong><span style={{ color: '#475569', fontSize: '13px' }}>{option.detail}</span></span>
                    </span>
                    <strong>{option.fee}</strong>
                  </label>
                ))}
              </div>
            )}

            {step === 'review' && (
              <div style={{ marginBottom: '24px', color: '#334155' }}>
                <section style={{ padding: '16px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '12px' }}>
                  <h3 style={{ color: '#0f172a', marginBottom: '8px' }}>Deliver to</h3>
                  <p>{formData.firstName} {formData.lastName} · {formData.phone}</p>
                  <p>{formData.addressLine}, {formData.landmark && `${formData.landmark}, `}{formData.city}, {formData.state} {formData.pincode}</p>
                </section>
                <section style={{ padding: '16px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '12px' }}>
                  <h3 style={{ color: '#0f172a', marginBottom: '8px' }}>Delivery and payment</h3>
                  <p>{deliveryOption === 'express' ? 'Express delivery · ₹199' : 'Standard delivery · Free'}</p>
                  <p>{formData.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Razorpay (UPI / Cards / NetBanking)'}</p>
                </section>
                <section style={{ padding: '16px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  <h3 style={{ color: '#0f172a', marginBottom: '8px' }}>Items ({orderItems.length})</h3>
                  {orderItems.map((item, index) => (
                    <p key={`${item.id}-${item.size}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                      <span>{item.name} · Size {item.size} · Qty {item.quantity}</span>
                      <span>₹ {(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                    </p>
                  ))}
                  <p style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '10px', marginTop: '10px', fontWeight: '700', color: '#0f172a' }}>
                    <span>Total</span><span>₹ {checkoutTotal.toLocaleString('en-IN')}</span>
                  </p>
                </section>
              </div>
            )}

            {/* Action Buttons */}
            <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  if (step === 'address') {
                    navigate('/cart');
                  } else {
                    const previousStep = {
                      delivery: 'address',
                      payment: 'delivery',
                      review: 'payment',
                    }[step];
                    setStep(previousStep);
                  }
                }}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#0f172a',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  fontFamily: 'serif',
                  textAlign: 'center'
                }}
              >
                {step === 'address' ? 'Return to Cart' : 'Back'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={event => {
                  if (step === 'review') {
                    handleSubmit(event);
                    return;
                  }
                  if (step === 'address') {
                    const requiredFields = document.querySelectorAll('[data-checkout-address] [required]');
                    for (const field of requiredFields) {
                      if (!field.reportValidity()) return;
                    }
                    setStep('delivery');
                  } else if (step === 'delivery') {
                    setStep('payment');
                  } else {
                    setErrorMsg('');
                    setStep('review');
                  }
                }}
                style={{ backgroundColor: '#234d4e', color: '#ffffff', padding: '12px', borderRadius: '6px', fontSize: '16px', fontWeight: '600', fontFamily: 'serif', textAlign: 'center' }}
              >
                {loading ? 'Processing...' : step === 'review' ? formData.paymentMethod === 'RAZORPAY' ? 'Place Order & Pay' : 'Place Order' : 'Continue'}
              </button>
            </div>

          </form>
        </div>

      </div>
      </>
      )}

    </div>
  );
}

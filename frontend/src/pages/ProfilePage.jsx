import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Phone, Mail, LogOut, ChevronRight, Package, CheckCircle, Truck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = ['Placed', 'Dispatched', 'In Transit', 'Delivered'];

function StatusBadge({ status }) {
  const colors = {
    Placed: { bg: '#dbeafe', text: '#1d4ed8' },
    Dispatched: { bg: '#fef9c3', text: '#854d0e' },
    'In Transit': { bg: '#ffedd5', text: '#9a3412' },
    Delivered: { bg: '#dcfce7', text: '#166534' },
  };
  const c = colors[status] || { bg: '#f1f5f9', text: '#475569' };
  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.text,
      fontSize: '11px',
      fontWeight: '700',
      padding: '3px 10px',
      borderRadius: '999px',
      letterSpacing: '0.4px',
      textTransform: 'uppercase'
    }}>
      {status}
    </span>
  );
}

function MiniTracker({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
      {STATUS_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            backgroundColor: i <= idx ? '#1f4747' : '#e2e8f0',
            flexShrink: 0
          }} />
          {i < STATUS_STEPS.length - 1 && (
            <div style={{
              flex: 1, height: '2px',
              backgroundColor: i < idx ? '#1f4747' : '#e2e8f0'
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    () => searchParams.get('tab') === 'orders' ? 'orders' : 'account'
  );
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!user?.token || user?.is_staff) {
      if (user?.is_staff) return undefined;
      setOrders([]);
      setOrdersLoading(false);
      setOrdersError('');
      return undefined;
    }

    let cancelled = false;
    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError('');
      setOrders([]);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/orders/', {
          headers: { Authorization: `Token ${user.token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Unable to load your orders.');
        }
        const list = Array.isArray(data) ? data : data.results;
        if (!Array.isArray(list)) {
          throw new Error('The orders service returned an invalid response.');
        }
        if (!cancelled) setOrders(list);
      } catch (error) {
        if (!cancelled) {
          setOrdersError(error instanceof Error ? error.message : 'Unable to load your orders.');
          setOrders([]);
        }
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user?.token, user?.is_staff]);

  const recentOrder = orders[0] || null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Avatar initials
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (user?.is_staff) {
    return (
      <div className="fade-in container" style={{ maxWidth: '960px', marginTop: '40px', marginBottom: '80px' }}>
        <section style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          padding: '28px 36px',
          marginBottom: '24px',
          borderRadius: '16px',
          backgroundColor: '#1f4747',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              border: '2px solid #ffffff55',
              backgroundColor: '#ffffff22',
              color: '#ffffff',
              fontSize: '26px',
              fontWeight: '700',
            }}>
              {initials}
            </div>
            <div>
              <h1 className="serif-font" style={{ margin: 0, color: '#ffffff', fontSize: '22px' }}>
                Staff Profile
              </h1>
              <p style={{ marginTop: '4px', color: '#a7f3d0' }}>{user.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              border: '1px solid #ffffff55',
              borderRadius: '8px',
              color: '#ffffff',
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <section style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', fontSize: '17px', color: '#0f172a' }}>
              <User size={18} color="#1f4747" />
              Staff Account
            </h2>
            <InfoRow label="Name" value={user.name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Access" value="Order management" />
          </section>

          <section style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '17px', color: '#0f172a' }}>
              <Package size={18} color="#1f4747" />
              Staff Actions
            </h2>
            <p style={{ marginBottom: '18px', color: '#64748b', lineHeight: 1.6 }}>
              Review store activity, view customer orders, and update shipment progress.
            </p>
            <Link
              to="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '6px',
                backgroundColor: '#1f4747',
                color: '#ffffff',
                fontWeight: '600',
              }}
            >
              Open Dashboard <ChevronRight size={16} />
            </Link>
            <Link
              to="/admin/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '10px',
                padding: '10px 18px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                color: '#1f4747',
                fontWeight: '600',
              }}
            >
              Manage Orders <ChevronRight size={16} />
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in container" style={{ maxWidth: '960px', marginTop: '40px', marginBottom: '80px' }}>

      {/* ── Header Card ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#1f4747', borderRadius: '16px',
        padding: '28px 36px', marginBottom: '28px', flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar */}
          <div style={{
            width: '68px', height: '68px', borderRadius: '50%',
            backgroundColor: '#ffffff22', border: '2px solid #ffffff55',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: '700', color: '#ffffff', fontFamily: 'serif'
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', fontFamily: 'serif' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '14px', color: '#a7f3d0', marginTop: '4px' }}>{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#ffffff18', border: '1px solid #ffffff33',
            color: '#ffffff', borderRadius: '8px', padding: '8px 18px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '28px', borderBottom: '2px solid #e2e8f0' }}>
        {[
          { id: 'account', label: 'Account Details', icon: <User size={16} /> },
          { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px',
              fontWeight: '600', fontSize: '15px',
              borderBottom: activeTab === tab.id ? '2px solid #1f4747' : '2px solid transparent',
              color: activeTab === tab.id ? '#1f4747' : '#64748b',
              marginBottom: '-2px',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Account Details Tab ── */}
      {activeTab === 'account' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Personal Info Card */}
          <div style={{
            border: '1px solid #e2e8f0', borderRadius: '12px',
            padding: '24px', backgroundColor: '#ffffff'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#1f4747" />
              Personal Information
            </h3>
            <InfoRow label="Full Name" value={user?.name} />
            <InfoRow label="Email Address" value={user?.email} />
            <InfoRow label="Member Since" value={new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })} />
            <InfoRow label="Account Type" value="Customer" />
          </div>

          {/* Quick Links Card */}
          <div style={{
            border: '1px solid #e2e8f0', borderRadius: '12px',
            padding: '24px', backgroundColor: '#ffffff'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="#1f4747" />
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <QuickLink label="Browse Products" to="/products" />
              <QuickLink label="View My Orders" onClick={() => setActiveTab('orders')} />
              <QuickLink label="Track an Order" to="/tracking" />
              <QuickLink label="Contact Support" to="/contact" />
            </div>
          </div>

          {/* Last Order Summary */}
          {ordersLoading ? (
            <div style={{ gridColumn: '1 / -1', color: '#64748b', textAlign: 'center', padding: '24px' }}>
              Loading your recent order…
            </div>
          ) : recentOrder ? (
            <div style={{
              border: '1px solid #e2e8f0', borderRadius: '12px',
              padding: '24px', backgroundColor: '#f8fafc', gridColumn: '1 / -1'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#1f4747" />
                Recent Order
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f4747', fontFamily: 'serif' }}>
                    {recentOrder.order_number}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    {recentOrder.expected_delivery}
                  </div>
                  <MiniTracker status={recentOrder.status} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                    ₹{Number(recentOrder.total_amount).toLocaleString('en-IN')}
                  </div>
                  <StatusBadge status={recentOrder.status} />
                </div>
                <Link
                  to={`/tracking/${recentOrder.order_number?.replace('#', '')}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    backgroundColor: '#1f4747', color: '#ffffff',
                    padding: '8px 18px', borderRadius: '6px', fontSize: '14px', fontWeight: '600'
                  }}
                >
                  Track Order <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ) : ordersError ? (
            <div role="alert" style={{ gridColumn: '1 / -1', color: '#b91c1c', textAlign: 'center', padding: '24px' }}>
              {ordersError}
            </div>
          ) : null}
        </div>
      )}

      {/* ── My Orders Tab ── */}
      {activeTab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '16px' }}>
              <Clock size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              Loading your orders…
            </div>
          ) : ordersError ? (
            <div role="alert" style={{ textAlign: 'center', padding: '60px 20px', color: '#b91c1c' }}>
              {ordersError}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <ShoppingBag size={56} style={{ margin: '0 auto 16px', display: 'block', color: '#cbd5e1' }} />
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>No orders yet</p>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>When you place an order, it will appear here.</p>
              <Link
                to="/products"
                style={{
                  display: 'inline-block', backgroundColor: '#1f4747', color: '#ffffff',
                  padding: '10px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '15px'
                }}
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order, idx) => (
                <OrderCard key={order.order_number || idx} order={order} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{label}</span>
      <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{value || '—'}</span>
    </div>
  );
}

function QuickLink({ label, to, onClick }) {
  const style = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: '500', color: '#0f172a',
    cursor: 'pointer', textDecoration: 'none', transition: 'background-color 0.2s'
  };
  if (to) {
    return (
      <Link to={to} style={style}>
        {label} <ChevronRight size={16} color="#64748b" />
      </Link>
    );
  }
  return (
    <button onClick={onClick} style={{ ...style, width: '100%', textAlign: 'left' }}>
      {label} <ChevronRight size={16} color="#64748b" />
    </button>
  );
}

function OrderCard({ order }) {
  const items = order.items || [];
  return (
    <div style={{
      border: '1px solid #e2e8f0', borderRadius: '12px',
      backgroundColor: '#ffffff', overflow: 'hidden'
    }}>
      {/* Card Header */}
      <div style={{
        backgroundColor: '#f8fafc', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px'
      }}>
        <div>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Order </span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1f4747', fontFamily: 'serif' }}>
            {order.order_number}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: i < items.length - 1 ? '12px' : 0 }}>
              {item.product_image && (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  style={{ width: '54px', height: '54px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #f1f5f9' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{item.product_name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Size: {item.size} · Qty: {item.quantity}</div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
      }}>
        <div>
          <span style={{ fontSize: '13px', color: '#64748b' }}>{order.expected_delivery}</span>
          <MiniTracker status={order.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
            ₹{Number(order.total_amount).toLocaleString('en-IN')}
          </span>
          <Link
            to={`/tracking/${order.order_number?.replace('#', '')}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#1f4747', color: '#ffffff',
              padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600'
            }}
          >
            Track <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

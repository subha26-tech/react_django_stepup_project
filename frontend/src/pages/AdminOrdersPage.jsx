import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin/orders/`;
const ORDER_STATUSES = ['Placed', 'Dispatched', 'In Transit', 'Delivered'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed'];

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [statusChanges, setStatusChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const filteredOrders = paymentStatusFilter
    ? orders.filter(order => order.payment_status === paymentStatusFilter)
    : orders;

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { Authorization: `Token ${user.token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || data.error || 'Unable to load orders.');
        }
        if (!Array.isArray(data)) {
          throw new Error('The orders service returned an invalid response.');
        }
        if (!cancelled) setOrders(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load orders.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user.token]);

  const saveStatus = async order => {
    const status = statusChanges[order.id] || order.status;
    if (status === order.status) return;

    setSavingOrderId(order.id);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`${API_URL}${order.id}/status/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Unable to update order status.');
      }
      setOrders(current => current.map(item => item.id === order.id ? data : item));
      setStatusChanges(current => {
        const updated = { ...current };
        delete updated[order.id];
        return updated;
      });
      setNotice(`Order ${data.order_number} status updated to ${data.status}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update order status.');
    } finally {
      setSavingOrderId(null);
    }
  };

  return (
    <section className="container" style={{ maxWidth: '1100px', margin: '36px auto 80px' }}>
      <h1 className="serif-font" style={{ marginBottom: '8px', color: '#0f172a' }}>Order Management</h1>
      <p style={{ marginBottom: '24px', color: '#64748b' }}>Review customer orders and update their shipment status.</p>
      <label htmlFor="payment-status-filter" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontWeight: '600' }}>
        Payment status
        <select
          id="payment-status-filter"
          value={paymentStatusFilter}
          onChange={event => setPaymentStatusFilter(event.target.value)}
          style={{ padding: '9px', border: '1px solid #94a3b8', borderRadius: '5px' }}
        >
          <option value="">All payment statuses</option>
          {PAYMENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>

      {error && <p role="alert" style={{ marginBottom: '16px', color: '#b91c1c' }}>{error}</p>}
      {notice && <p role="status" style={{ marginBottom: '16px', color: '#166534' }}>{notice}</p>}

      {loading ? (
        <p role="status">Loading orders…</p>
      ) : filteredOrders.length === 0 ? (
        <p style={{ padding: '28px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc' }}>There are no orders yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredOrders.map(order => {
            const selectedStatus = statusChanges[order.id] || order.status;
            const failedRazorpay = order.payment_method === 'RAZORPAY' && order.payment_status === 'Failed';
            const statusOptions = ORDER_STATUSES.includes(order.status) ? ORDER_STATUSES : [order.status, ...ORDER_STATUSES];
            return (
              <article key={order.id} style={{ padding: '20px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#1f4747' }}>{order.order_number}</h2>
                    <p style={{ marginTop: '6px', color: '#334155' }}>{order.customer_name} · {order.email}</p>
                    <p style={{ marginTop: '4px', color: '#64748b' }}>
                      {new Date(order.created_at).toLocaleString()} · ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <label htmlFor={`status-${order.id}`} style={{ fontWeight: '600' }}>Status</label>
                    <select
                      id={`status-${order.id}`}
                      value={selectedStatus}
                      onChange={event => setStatusChanges(current => ({ ...current, [order.id]: event.target.value }))}
                      disabled={failedRazorpay}
                      style={{ padding: '9px', border: '1px solid #94a3b8', borderRadius: '5px' }}
                    >
                      {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => saveStatus(order)}
                      disabled={savingOrderId === order.id || selectedStatus === order.status || failedRazorpay}
                      style={{
                        padding: '10px 16px',
                        color: '#ffffff',
                        backgroundColor: selectedStatus === order.status ? '#94a3b8' : '#1f4747',
                        borderRadius: '5px',
                        cursor: selectedStatus === order.status ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {savingOrderId === order.id ? 'Saving…' : 'Save status'}
                    </button>
                  </div>
                </div>
                <p style={{ marginTop: '10px', fontSize: '13px', color: '#64748b' }}>
                  {order.items?.length || 0} item(s) · Payment: {order.payment_method} · {order.payment_status}
                </p>
                {failedRazorpay && (
                  <p role="status" style={{ marginTop: '8px', fontSize: '13px', color: '#b91c1c' }}>
                    Shipment status is locked until payment succeeds.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  CalendarDays,
  CircleHelp,
  Download,
  LayoutDashboard,
  LogOut,
  Package,
  RefreshCw,
  Search,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboardPage.css';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin/orders/`;
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Product Analysis', icon: Boxes },
  { id: 'shipping', label: 'Shipping & Customers', icon: Truck },
  { id: 'time', label: 'Time Analysis', icon: CalendarDays },
  { id: 'data', label: 'Data View', icon: BarChart3 },
  { id: 'orders', label: 'Manage Orders', icon: Package },
];
const CHART_COLORS = ['#1f4747', '#2c5e5e', '#5f8b80', '#eab308', '#4385eb', '#ef9b0b'];
const EMPTY_FILTERS = { category: '', region: '', payment: '', status: '' };

const formatCurrency = amount =>
  `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const getItems = order => Array.isArray(order.items) ? order.items : [];
const getOrderCategories = order => [...new Set(getItems(order).map(item => item.product_category_name).filter(Boolean))];
const getRegion = order => order.state || order.city || 'Unknown';
const getOrderDate = order => new Date(order.created_at);
const monthKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

function MetricCard({ icon: Icon, label, value, tone = 0, footnote }) {
  return (
    <article className="admin-metric">
      <div className="admin-metric-icon" style={{ color: CHART_COLORS[tone % CHART_COLORS.length] }}>
        <Icon size={18} />
      </div>
      <p className="admin-metric-label">{label}</p>
      <strong className="admin-metric-value">{value}</strong>
      {footnote && <span className="admin-metric-note">{footnote}</span>}
    </article>
  );
}

function BarChart({ title, data, valueFormatter = value => value, horizontal = false }) {
  const max = Math.max(...data.map(item => item.value), 1);
  return (
    <article className="admin-panel">
      <h2 className="admin-panel-title">{title}</h2>
      {data.length ? (
        horizontal ? (
          <div className="admin-horizontal-chart">
            {data.map((item, index) => (
              <div className="admin-horizontal-row" key={item.label}>
                <span title={item.label}>{item.label}</span>
                <div className="admin-horizontal-track">
                  <div
                    className="admin-horizontal-bar"
                    style={{ width: `${Math.max((item.value / max) * 100, item.value ? 2 : 0)}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                </div>
                <strong>{valueFormatter(item.value)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-bar-chart">
            {data.map((item, index) => (
              <div className="admin-bar-column" key={item.label} title={`${item.label}: ${valueFormatter(item.value)}`}>
                <span className="admin-bar-value">{valueFormatter(item.value)}</span>
                <div className="admin-bar-track">
                  <div
                    className="admin-bar-fill"
                    style={{ height: `${Math.max((item.value / max) * 100, item.value ? 3 : 0)}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                </div>
                <span className="admin-bar-label">{item.label}</span>
              </div>
            ))}
          </div>
        )
      ) : <p className="admin-empty">No matching order data to chart.</p>}
    </article>
  );
}

function DonutChart({ title, data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const segments = data.reduce((result, item, index) => {
    const start = result.offset;
    const end = start + (total ? (item.value / total) * 100 : 0);
    return {
      offset: end,
      items: [...result.items, { ...item, start, end, color: CHART_COLORS[index % CHART_COLORS.length] }],
    };
  }, { offset: 0, items: [] }).items;
  const gradient = total
    ? `conic-gradient(${segments.map(item => `${item.color} ${item.start}% ${item.end}%`).join(', ')})`
    : '#e8e3e7';

  return (
    <article className="admin-panel">
      <h2 className="admin-panel-title">{title}</h2>
      <div className="admin-donut-layout">
        <div className="admin-donut" style={{ background: gradient }} role="img" aria-label={`${title}, ${total} total`}>
          <div className="admin-donut-hole">
            <strong>{total}</strong><span>orders</span>
          </div>
        </div>
        <ul className="admin-legend">
          {segments.filter(item => item.value > 0).map(item => (
            <li key={item.label}>
              <i style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </li>
          ))}
          {!total && <li className="admin-legend-empty">No matching data</li>}
        </ul>
      </div>
    </article>
  );
}

function DataTable({ orders }) {
  const [query, setQuery] = useState('');
  const rows = orders.filter(order => {
    const itemNames = getItems(order).map(item => item.product_name).join(' ');
    return `${order.order_number} ${order.customer_name} ${order.email} ${getRegion(order)} ${itemNames}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  return (
    <article className="admin-panel admin-data-panel">
      <div className="admin-table-heading">
        <div>
          <h2 className="admin-panel-title">Order data</h2>
          <p>{rows.length} matching order{rows.length === 1 ? '' : 's'}</p>
        </div>
        <label className="admin-search">
          <Search size={16} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search records..." />
        </label>
      </div>
      {rows.length ? (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                {['Order ID', 'Customer', 'Product / Category', 'Order Date', 'Region', 'Units', 'Payment', 'Shipping Status', 'Total'].map(label => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(order => {
                const items = getItems(order);
                const products = [...new Set(items.map(item => item.product_name))].filter(Boolean);
                const categories = getOrderCategories(order);
                const units = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                return (
                  <tr key={order.id}>
                    <td className="admin-table-id">{order.order_number}</td>
                    <td>{order.customer_name}<small>{order.email}</small></td>
                    <td>{products.length ? products.join(', ') : '—'}<small>{categories.join(', ') || 'Category unavailable'}</small></td>
                    <td>{getOrderDate(order).toLocaleDateString()}</td>
                    <td>{getRegion(order)}</td>
                    <td>{units}</td>
                    <td>{order.payment_method}<small>{order.payment_status}</small></td>
                    <td><span className={`admin-status admin-status-${String(order.status).toLowerCase().replaceAll(' ', '-')}`}>{order.status}</span></td>
                    <td>{formatCurrency(order.total_amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <p className="admin-empty">No orders match your search and filters.</p>}
    </article>
  );
}

function ManageOrdersPanel({ orders, token, onOrderUpdated }) {
  const [statusChanges, setStatusChanges] = useState({});
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const statuses = ['Placed', 'Dispatched', 'In Transit', 'Delivered'];

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
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || 'Unable to update order status.');
      onOrderUpdated(data);
      setStatusChanges(current => {
        const next = { ...current };
        delete next[order.id];
        return next;
      });
      setNotice(`${data.order_number} updated to ${data.status}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update order status.');
    } finally {
      setSavingOrderId(null);
    }
  };

  return (
    <article className="admin-panel admin-orders-panel">
      <div className="admin-table-heading">
        <div>
          <h2 className="admin-panel-title">Manage customer orders</h2>
          <p>Update shipment status and review payment details.</p>
        </div>
        <span className="admin-orders-count">{orders.length} orders</span>
      </div>
      {error && <p className="admin-inline-error" role="alert">{error}</p>}
      {notice && <p className="admin-inline-notice" role="status">{notice}</p>}
      {!orders.length ? (
        <p className="admin-empty">There are no orders for the selected filters.</p>
      ) : (
        <div className="admin-order-list">
          {orders.map(order => {
            const selectedStatus = statusChanges[order.id] || order.status;
            const units = getItems(order).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            return (
              <section className="admin-order-row" key={order.id}>
                <div className="admin-order-summary">
                  <strong>{order.order_number}</strong>
                  <span>{order.customer_name} · {order.email}</span>
                  <small>{getOrderDate(order).toLocaleString()} · {units} item(s) · {formatCurrency(order.total_amount)}</small>
                </div>
                <div className="admin-order-controls">
                  <span>Payment: {order.payment_status}</span>
                  <label htmlFor={`dashboard-status-${order.id}`}>Shipment status</label>
                  <select
                    id={`dashboard-status-${order.id}`}
                    value={selectedStatus}
                    onChange={event => setStatusChanges(current => ({ ...current, [order.id]: event.target.value }))}
                  >
                    {statuses.map(status => <option value={status} key={status}>{status}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => saveStatus(order)}
                    disabled={savingOrderId === order.id || selectedStatus === order.status}
                  >
                    {savingOrderId === order.id ? 'Saving…' : 'Save status'}
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = !!user?.is_superuser;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState(() => (
    searchParams.get('view') === 'orders' || !user?.is_superuser ? 'orders' : 'overview'
  ));
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [today] = useState(() => new Date());

  const requestOrders = useCallback(async () => {
    const response = await fetch(API_URL, {
      headers: { Authorization: `Token ${user.token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.error || 'Unable to load dashboard orders.');
    }
    if (!Array.isArray(data)) throw new Error('The orders service returned an invalid response.');
    return data;
  }, [user.token]);

  const refreshOrders = () => {
    setRefreshing(true);
    setError('');
    requestOrders()
      .then(setOrders)
      .catch(loadError => {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard orders.');
      })
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    let cancelled = false;
    requestOrders()
      .then(data => {
        if (!cancelled) setOrders(data);
      })
      .catch(loadError => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard orders.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestOrders]);

  const filterOptions = useMemo(() => ({
    categories: [...new Set(orders.flatMap(getOrderCategories))].sort(),
    regions: [...new Set(orders.map(getRegion).filter(region => region !== 'Unknown'))].sort(),
    payments: [...new Set(orders.map(order => order.payment_method).filter(Boolean))].sort(),
    statuses: [...new Set(orders.map(order => order.status).filter(Boolean))].sort(),
  }), [orders]);

  const filteredOrders = useMemo(() => orders.filter(order => {
    const categoryMatches = !filters.category || getOrderCategories(order).includes(filters.category);
    const regionMatches = !filters.region || getRegion(order) === filters.region;
    const paymentMatches = !filters.payment || order.payment_method === filters.payment;
    const statusMatches = !filters.status || order.status === filters.status;
    return categoryMatches && regionMatches && paymentMatches && statusMatches;
  }), [orders, filters]);

  const metrics = useMemo(() => {
    const revenue = filteredOrders
      .filter(order => order.payment_status === 'Paid')
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const totalValue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const units = filteredOrders.reduce(
      (sum, order) => sum + getItems(order).reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0),
      0,
    );
    const delivered = filteredOrders.filter(order => order.status === 'Delivered').length;
    const paidOrders = filteredOrders.filter(order => order.payment_status === 'Paid').length;
    const productNames = new Set(filteredOrders.flatMap(order => getItems(order).map(item => item.product_name).filter(Boolean)));
    const categories = new Set(filteredOrders.flatMap(getOrderCategories));
    return {
      revenue,
      totalValue,
      orderCount: filteredOrders.length,
      averageOrder: filteredOrders.length ? totalValue / filteredOrders.length : 0,
      units,
      productCount: productNames.size,
      categoryCount: categories.size,
      deliveredRate: filteredOrders.length ? (delivered / filteredOrders.length) * 100 : 0,
      onlinePaymentShare: filteredOrders.length
        ? (filteredOrders.filter(order => order.payment_method !== 'COD').length / filteredOrders.length) * 100
        : 0,
      paidOrders,
    };
  }, [filteredOrders]);

  const categoryRevenue = useMemo(() => {
    const totals = new Map();
    filteredOrders.forEach(order => getItems(order).forEach(item => {
      const category = item.product_category_name || 'Uncategorized';
      totals.set(category, (totals.get(category) || 0) + Number(item.price || 0) * Number(item.quantity || 0));
    }));
    return [...totals].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  const productRevenue = useMemo(() => {
    const totals = new Map();
    filteredOrders.forEach(order => getItems(order).forEach(item => {
      const product = item.product_name || 'Unknown product';
      totals.set(product, (totals.get(product) || 0) + Number(item.price || 0) * Number(item.quantity || 0));
    }));
    return [...totals].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filteredOrders]);

  const statusData = useMemo(() => {
    const counts = new Map();
    filteredOrders.forEach(order => counts.set(order.status, (counts.get(order.status) || 0) + 1));
    return [...counts].map(([label, value]) => ({ label, value }));
  }, [filteredOrders]);

  const regionalData = useMemo(() => {
    const counts = new Map();
    filteredOrders.forEach(order => {
      const region = getRegion(order);
      counts.set(region, (counts.get(region) || 0) + 1);
    });
    return [...counts].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filteredOrders]);

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - 11 + index, 1);
      return { key: monthKey(date), label: date.toLocaleDateString(undefined, { month: 'short' }), value: 0 };
    });
    const indexByMonth = new Map(months.map((item, index) => [item.key, index]));
    filteredOrders.forEach(order => {
      const index = indexByMonth.get(monthKey(getOrderDate(order)));
      if (index !== undefined) months[index].value += 1;
    });
    return months;
  }, [filteredOrders, today]);

  const exportCsv = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Order Date', 'Region', 'Products', 'Units', 'Payment Method', 'Payment Status', 'Shipping Status', 'Total'];
    const quote = value => {
      const text = String(value ?? '');
      const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replaceAll('"', '""')}"`;
    };
    const rows = filteredOrders.map(order => {
      const items = getItems(order);
      return [
        order.order_number,
        order.customer_name,
        order.email,
        getOrderDate(order).toISOString(),
        getRegion(order),
        items.map(item => item.product_name).filter(Boolean).join('; '),
        items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        order.payment_method,
        order.payment_status,
        order.status,
        order.total_amount,
      ].map(quote).join(',');
    });
    const blob = new Blob([[headers.map(quote).join(','), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'stepup-orders.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const updateFilter = (key, value) => setFilters(current => ({ ...current, [key]: value }));
  const visibleNavItems = isAdmin
    ? NAV_ITEMS
    : NAV_ITEMS.filter(item => item.id === 'orders');
  const selectedView = isAdmin || activeView === 'profile' ? activeView : 'orders';
  const activeViewLabel = selectedView === 'profile'
    ? 'Profile'
    : NAV_ITEMS.find(item => item.id === selectedView)?.label || 'Overview';

  const renderView = () => {
    if (selectedView === 'orders' || !isAdmin) {
      return (
        <ManageOrdersPanel
          orders={filteredOrders}
          token={user.token}
          onOrderUpdated={updatedOrder => setOrders(current => current.map(order =>
            order.id === updatedOrder.id ? updatedOrder : order
          ))}
        />
      );
    }
    if (selectedView === 'profile') {
      return (
        <section className="admin-panel admin-profile-panel">
          <div className="admin-profile-heading">
            <span className="admin-profile-avatar">{(user.name || 'A').slice(0, 1).toUpperCase()}</span>
            <div>
              <p>ADMINISTRATOR PROFILE</p>
              <h2>{user.name}</h2>
              <span>Staff account</span>
            </div>
          </div>
          <div className="admin-profile-details">
            <div><span>Full name</span><strong>{user.name || '—'}</strong></div>
            <div><span>Email address</span><strong>{user.email || '—'}</strong></div>
            <div><span>Account access</span><strong>{isAdmin ? 'Dashboard and order management' : 'Order management'}</strong></div>
          </div>
        </section>
      );
    }
    if (activeView === 'data') return <DataTable orders={filteredOrders} />;
    if (activeView === 'products') {
      return (
        <>
          <section className="admin-metrics-grid">
            <MetricCard icon={Boxes} label="Product categories" value={metrics.categoryCount} tone={0} />
            <MetricCard icon={Package} label="Unique products sold" value={metrics.productCount} tone={1} />
            <MetricCard icon={BarChart3} label="Average order value" value={formatCurrency(metrics.averageOrder)} tone={2} />
            <MetricCard icon={Package} label="Units ordered" value={metrics.units.toLocaleString('en-IN')} tone={3} />
          </section>
          <section className="admin-chart-grid">
            <BarChart title="Revenue by product name" data={productRevenue} horizontal valueFormatter={formatCurrency} />
            <BarChart title="Revenue by product category" data={categoryRevenue} valueFormatter={formatCurrency} />
          </section>
        </>
      );
    }
    if (activeView === 'shipping') {
      return (
        <>
          <section className="admin-metrics-grid">
            <MetricCard icon={Truck} label="Delivered rate" value={`${metrics.deliveredRate.toFixed(1)}%`} tone={3} />
            <MetricCard icon={Package} label="Orders in transit" value={statusData.find(item => item.label === 'In Transit')?.value || 0} tone={4} />
            <MetricCard icon={RefreshCw} label="Awaiting dispatch" value={statusData.find(item => item.label === 'Placed')?.value || 0} tone={1} />
            <MetricCard icon={Boxes} label="Online payments" value={`${metrics.onlinePaymentShare.toFixed(1)}%`} tone={5} />
          </section>
          <section className="admin-chart-grid">
            <DonutChart title="Orders by shipping status" data={statusData} />
            <BarChart title="Orders by customer region" data={regionalData} />
          </section>
        </>
      );
    }
    if (activeView === 'time') {
      return (
        <>
          <section className="admin-metrics-grid">
            <MetricCard icon={CalendarDays} label="Active months" value={monthlyData.filter(month => month.value > 0).length} tone={0} />
            <MetricCard icon={Package} label="Paid revenue" value={formatCurrency(metrics.revenue)} tone={1} />
            <MetricCard icon={BarChart3} label="Order value" value={formatCurrency(metrics.totalValue)} tone={2} />
            <MetricCard icon={Boxes} label="Total orders" value={metrics.orderCount} tone={3} />
          </section>
          <BarChart title="Monthly order volume (last 12 months)" data={monthlyData} />
        </>
      );
    }
    return (
      <>
        <section className="admin-metrics-grid">
          <MetricCard icon={Package} label="Gross order value" value={formatCurrency(metrics.totalValue)} tone={0} footnote="All matching orders" />
          <MetricCard icon={Boxes} label="Total orders" value={metrics.orderCount.toLocaleString('en-IN')} tone={1} footnote={`${metrics.units.toLocaleString('en-IN')} units ordered`} />
          <MetricCard icon={BarChart3} label="Average order value" value={formatCurrency(metrics.averageOrder)} tone={2} footnote="Based on matching orders" />
          <MetricCard icon={BarChart3} label="Paid revenue" value={formatCurrency(metrics.revenue)} tone={3} footnote={`${metrics.paidOrders} paid orders`} />
          <MetricCard icon={Truck} label="Delivered" value={statusData.find(item => item.label === 'Delivered')?.value || 0} tone={4} footnote={`${metrics.deliveredRate.toFixed(1)}% delivery rate`} />
        </section>
        <section className="admin-chart-grid">
          <BarChart title="Orders by customer region" data={regionalData} />
          <DonutChart title="Orders by shipping status" data={statusData} />
        </section>
        <DataTable orders={filteredOrders.slice(0, 8)} />
      </>
    );
  };

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <span className="admin-brand-mark">S</span>
          <span><strong>StepUp</strong><small>{isAdmin ? 'ADMIN CONSOLE' : 'STAFF CONSOLE'}</small></span>
        </Link>
        <p className="admin-sidebar-label">WORKSPACE</p>
        <nav aria-label="Dashboard sections" className="admin-sidebar-nav">
          {visibleNavItems.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`admin-nav-item${selectedView === id ? ' active' : ''}`}
              onClick={() => setActiveView(id)}
            >
              <Icon size={17} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-user-card">
            <button
              type="button"
              className={`admin-user-profile${selectedView === 'profile' ? ' active' : ''}`}
              onClick={() => setActiveView('profile')}
            >
              <span className="admin-user-avatar">{(user.name || 'A').slice(0, 1).toUpperCase()}</span>
              <span><strong>{user.name}</strong><small>{isAdmin ? 'Administrator' : 'Staff'}</small></span>
            </button>
            <button
              type="button"
              className="admin-signout-button"
              aria-label="Sign out"
              title="Sign out"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
          <p className="admin-help"><CircleHelp size={15} /> Dashboard data is based on customer orders.</p>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-breadcrumb">Workspace <span>/</span> Dashboard</p>
            <h1>{activeViewLabel}</h1>
          </div>
          {selectedView !== 'profile' && (
            <div className="admin-top-actions">
              <button type="button" className="admin-action-button" onClick={refreshOrders} disabled={loading || refreshing}>
                <RefreshCw size={15} className={refreshing ? 'admin-spin' : ''} /> Refresh
              </button>
              {isAdmin && (
                <>
                  <button type="button" className="admin-icon-button" aria-label="Search records" onClick={() => setActiveView('data')}>
                    <Search size={18} />
                  </button>
                  <button type="button" className="admin-action-button admin-export-button" onClick={exportCsv} disabled={!filteredOrders.length}>
                    <Download size={15} /> Export CSV
                  </button>
                </>
              )}
            </div>
          )}
        </header>

        {selectedView !== 'profile' && (isAdmin || selectedView === 'orders') && (
        <section className="admin-filters" aria-label="Filter dashboard data">
          {[
            ['category', 'Category', filterOptions.categories],
            ['region', 'Region', filterOptions.regions],
            ['payment', 'Payment method', filterOptions.payments],
            ['status', 'Ship status', filterOptions.statuses],
          ].map(([key, label, options]) => (
            <label className="admin-filter" key={key}>
              <span>{label}</span>
              <select value={filters[key]} onChange={event => updateFilter(key, event.target.value)}>
                <option value="">All</option>
                {options.map(option => <option value={option} key={option}>{option}</option>)}
              </select>
            </label>
          ))}
          <button type="button" className="admin-reset-button" onClick={() => setFilters(EMPTY_FILTERS)}>Reset filters</button>
        </section>
        )}

        <div className="admin-content">
          {error && (
            <div role="alert" className="admin-error">
              <span>{error}</span>
              <button type="button" onClick={refreshOrders}>Retry</button>
            </div>
          )}
          {loading ? (
            <p role="status" className="admin-loading">Loading dashboard data…</p>
          ) : (
            <>
              <div className="admin-section-intro">
                <div>
                  <h2>{activeViewLabel}</h2>
                  <p>{selectedView === 'profile'
                    ? `View your ${isAdmin ? 'administrator' : 'staff'} account information.`
                    : `Live summary from ${filteredOrders.length} matching customer order${filteredOrders.length === 1 ? '' : 's'}.`}</p>
                </div>
                <span className="admin-data-badge"><span /> Live order data</span>
              </div>
              {renderView()}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

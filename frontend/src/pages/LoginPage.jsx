import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getPostLoginPath = (authenticatedUser, fallback) =>
  authenticatedUser?.is_staff ? '/admin' : fallback;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user, isAuthenticated, authLoading, authError, setAuthError } = useAuth();

  // Where to go after login — default '/'
  const from = location.state?.from || '/';

  // If already logged in, redirect straight away
  useEffect(() => {
    if (isAuthenticated) navigate(getPostLoginPath(user, from), { replace: true });
  }, [isAuthenticated, navigate, user, from]);

  const [activeTab, setActiveTab] = useState(
    location.pathname === '/register' ? 'register' : 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setLocalError('');
    setAuthError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!formData.email || !formData.password) {
      setLocalError('Please enter your email and password.');
      return;
    }
    const result = await login(formData.email, formData.password);
    if (result?.success) navigate(getPostLoginPath(result.user, from), { replace: true });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    const result = await register(formData.name, formData.email, formData.password);
    if (result?.success) navigate(getPostLoginPath(result.user, from), { replace: true });
    else if (result?.error) setLocalError(result.error);
  };

  const handleGoogleLogin = async () => {
    const result = await login('google@gmail.com', 'google');
    if (result?.success) navigate(getPostLoginPath(result.user, from), { replace: true });
  };

  const errorMsg = localError || authError;

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #1e293b',
    borderRadius: '2px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '6px'
  };

  return (
    <div className="fade-in container" style={{ maxWidth: '520px', marginTop: '40px', marginBottom: '80px' }}>

      {/* Redirect hint */}
      {from !== '/' && (
        <div style={{
          backgroundColor: '#fef9c3', color: '#713f12',
          padding: '10px 16px', borderRadius: '8px', fontSize: '13px',
          marginBottom: '16px', fontWeight: '500'
        }}>
          🔒 Please log in to access that page.
        </div>
      )}

      <div style={{
        border: '1px solid #1e293b',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
      }}>

        {/* Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {['login', 'register'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setLocalError(''); setAuthError(''); }}
              style={{
                padding: '16px',
                backgroundColor: activeTab === tab ? '#234d4e' : '#e2e8f0',
                color: activeTab === tab ? '#ffffff' : '#0f172a',
                fontFamily: 'serif',
                fontSize: '18px',
                fontWeight: '700',
                textAlign: 'center'
              }}
            >
              {tab === 'login' ? 'Log in' : 'Register'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '36px' }}>

          {errorMsg && (
            <div style={{
              backgroundColor: '#fee2e2', color: '#b91c1c',
              padding: '10px 14px', borderRadius: '4px',
              fontSize: '13px', marginBottom: '16px'
            }}>
              {errorMsg}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Email id</label>
                <input
                  type="email" name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', color: '#475569'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <Link to="/forgot-password" style={{ fontSize: '12px', color: '#ef4444', cursor: 'pointer' }}>
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '20px' }}>
                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    backgroundColor: '#2b5050', color: '#ffffff',
                    padding: '10px 48px', borderRadius: '6px',
                    fontFamily: 'serif', fontSize: '18px', fontWeight: '700',
                    opacity: authLoading ? 0.7 : 1
                  }}
                >
                  {authLoading ? 'Logging in…' : 'Log In'}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#0f172a' }}>
                Don't have an account?{' '}
                <span
                  onClick={() => setActiveTab('register')}
                  style={{ color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}
                >
                  Register
                </span>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister}>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text" name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email id</label>
                <input
                  type="email" name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create password (min 6 chars)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', color: '#475569'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password" name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    backgroundColor: '#2b5050', color: '#ffffff',
                    padding: '10px 48px', borderRadius: '6px',
                    fontFamily: 'serif', fontSize: '18px', fontWeight: '700',
                    opacity: authLoading ? 0.7 : 1
                  }}
                >
                  {authLoading ? 'Creating…' : 'Register'}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#0f172a' }}>
                Already have an account?{' '}
                <span
                  onClick={() => setActiveTab('login')}
                  style={{ color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}
                >
                  Log In
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

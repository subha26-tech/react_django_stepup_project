import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8000/api';

export default function PasswordResetPage() {
  const { uid, token } = useParams();
  const isReset = Boolean(uid && token);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (isReset && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/password-reset${isReset ? '/confirm' : ''}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isReset ? { uid, token, password } : { email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to process your password reset request.');
      }
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message
        : 'Unable to reach the password reset service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '15px',
    marginTop: '6px',
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '520px', marginTop: '48px', marginBottom: '80px' }}>
      <section style={{
        padding: '36px',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      }}>
        <h1 style={{ color: '#1f4747', fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>
          {isReset ? 'Choose a new password' : 'Forgot your password?'}
        </h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          {isReset
            ? 'Enter and confirm a new password for your StepUp account.'
            : 'Enter your account email and we will send password reset instructions.'}
        </p>

        {message && (
          <div role="status" style={{
            padding: '12px 14px', marginBottom: '18px', borderRadius: '6px',
            color: '#166534', backgroundColor: '#f0fdf4', fontSize: '14px',
          }}>
            {message}
            {!isReset && import.meta.env.DEV && (
              <p style={{ marginTop: '10px', fontSize: '13px' }}>
                For local development, check the Django server console for the reset link.
              </p>
            )}
          </div>
        )}

        {error && (
          <div role="alert" style={{
            padding: '12px 14px', marginBottom: '18px', borderRadius: '6px',
            color: '#b91c1c', backgroundColor: '#fef2f2', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {!message ? (
          <form onSubmit={submit}>
            {!isReset ? (
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b' }}>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your account email"
                  style={inputStyle}
                />
              </label>
            ) : (
              <>
                <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>
                  New password
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: 'block', fontWeight: 600, color: '#1e293b' }}>
                  Confirm new password
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    style={inputStyle}
                  />
                </label>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', marginTop: '24px', padding: '12px 18px',
                borderRadius: '6px', backgroundColor: '#1f4747', color: '#ffffff',
                fontWeight: 700, fontSize: '15px', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Please wait…' : isReset ? 'Reset password' : 'Send reset instructions'}
            </button>
          </form>
        ) : null}

        <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '14px', color: '#64748b' }}>
          <Link to="/login" style={{ color: '#1f4747', fontWeight: 600 }}>Back to sign in</Link>
        </p>
      </section>
    </div>
  );
}

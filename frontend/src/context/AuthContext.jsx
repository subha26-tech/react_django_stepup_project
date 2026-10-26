import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('stepup_user');
    const user = saved ? JSON.parse(saved) : null;
    return user?.token ? user : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);
  const [authInitializing, setAuthInitializing] = useState(() => !!getSavedUser()?.token);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!user?.token) {
      return undefined;
    }

    let cancelled = false;
    const validateSavedSession = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me/`, {
          headers: { Authorization: `Token ${user.token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401 && !cancelled) {
            setUser(null);
            setAuthInitializing(false);
            setAuthError('Your session has expired. Please sign in again.');
          } else if (!response.ok) {
            throw new Error(data.error || 'Unable to verify your account access.');
          }
          return;
        }
        if (!data.success || !data.user) {
          throw new Error('The authentication server returned an invalid account.');
        }
        if (!cancelled) {
          setUser(current => current?.token === user.token
            ? { ...current, ...data.user, token: user.token }
            : current
          );
        }
      } catch (error) {
        if (!cancelled) {
          setAuthError(error instanceof Error ? error.message : 'Unable to verify your account access.');
        }
      } finally {
        if (!cancelled) setAuthInitializing(false);
      }
    };

    validateSavedSession();
    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('stepup_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('stepup_user');
    }
  }, [user]);

  const authenticate = async (endpoint, payload) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch(`${API_URL}/auth/${endpoint}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('The authentication server returned an invalid response.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }
      if (!data.success || !data.token || !data.user) {
        throw new Error('The authentication server did not return a valid login.');
      }

      const authenticatedUser = { ...data.user, token: data.token };
      setUser(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to authenticate.';
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setAuthLoading(false);
    }
  };

  const login = (email, password) => authenticate('login', { email, password });
  const register = (name, email, password) =>
    authenticate('register', { name, email, password });

  const logout = () => {
    setUser(null);
    setAuthInitializing(false);
    setAuthError('');
  };

  const isAuthenticated = !!user?.token;

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      register,
      logout,
      isAuthenticated,
      authLoading,
      authInitializing,
      authError,
      setAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

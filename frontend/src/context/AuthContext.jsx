import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  function applyAuth({ user, token }) {
    if (token) {
      localStorage.setItem('token', token);
      setToken(token);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    }
  }

  async function login(email, password) {
    const r = await api.post('/auth/login', { email, password });
    applyAuth({ user: r.data.user, token: r.data.token });
    return r.data.user;
  }

  async function register({ name, email, password, role }) {
    const r = await api.post('/auth/register', { name, email, password, role });
    applyAuth({ user: r.data.user, token: r.data.token });
    return r.data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthMini() {
  const [email, setEmail] = useState('donor@example.com');
  const [password, setPassword] = useState('donor123');
  const { user, login, logout } = useAuth();

  async function doLogin() {
    try {
      await login(email, password);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Ошибка входа');
    }
  }

  // logout берём из контекста

  if (user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-700">{user.name} ({user.role})</span>
  <button className="px-2 py-1 bg-gray-100 rounded" onClick={logout}>Выйти</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <input className="border rounded px-2 py-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      <input className="border rounded px-2 py-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="пароль" />
  <button className="px-2 py-1 bg-emerald-600 text-white rounded" onClick={doLogin}>Войти</button>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const u = await register({ name, email, password, role });
      navigate('/');
    } catch (e) {
      setError(e?.response?.data?.message || 'Ошибка регистрации');
    }
  }

  return (
    <div className="container-page py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label className="block text-sm text-gray-700">Роль</label>
        <select className="w-full border rounded px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="donor">Донатор</option>
          <option value="author">Автор</option>
        </select>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full py-2 bg-emerald-600 text-white rounded">Создать аккаунт</button>
      </form>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/admin/users')
      .then(r => setItems(r.data))
      .catch(e => setError(e?.response?.data?.message || e.message));
  }, []);

  async function updateUser(u, patch) {
    const r = await api.patch(`/admin/users/${u.id}`, patch);
    setItems(items.map(x => (x.id === u.id ? { ...x, ...r.data } : x)));
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-red-600">{error}</div>}
      {items.map(u => (
        <div key={u.id} className="p-3 border rounded flex items-center justify-between">
          <div>
            <div className="font-medium">{u.name} ({u.email})</div>
            <div className="text-sm text-gray-600">Роль: {u.role} • Подписка: {u.activeSubscription ? 'активна' : 'нет'} • Заявка автора: {u.authorRequested ? 'да' : 'нет'}</div>
          </div>
          <div className="flex gap-2">
            <select className="border rounded px-2 py-1 text-sm" value={u.role} onChange={e => updateUser(u, { role: e.target.value })}>
              <option value="donor">donor</option>
              <option value="author">author</option>
              <option value="admin">admin</option>
            </select>
            <button className="px-2 py-1 bg-gray-100 rounded text-sm" onClick={() => updateUser(u, { activeSubscription: !u.activeSubscription })}>
              {u.activeSubscription ? 'Отключить подписку' : 'Включить подписку'}
            </button>
            {u.authorRequested && u.role === 'donor' && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Ожидает повышения</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

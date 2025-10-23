import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function AdminDonations() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/admin/donations', { params: { limit: 100 } })
      .then(r => setItems(r.data))
      .catch(e => setError(e?.response?.data?.message || e.message));
  }, []);

  return (
    <div className="space-y-2">
      {error && <div className="text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Сумма</th>
              <th className="p-2">Статус</th>
              <th className="p-2">Дата</th>
            </tr>
          </thead>
          <tbody>
            {items.map(d => (
              <tr key={d.id} className="border-t">
                <td className="p-2">{d.id}</td>
                <td className="p-2">₽{Number(d.amount).toLocaleString()}</td>
                <td className="p-2">{d.status}</td>
                <td className="p-2">{new Date(d.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function AdminSettings() {
  const [commission, setCommission] = useState('');
  const [subscription, setSubscription] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/config')
      .then(r => {
        setCommission(String(r.data?.commissionPercent?.percent ?? ''));
        setSubscription(String(r.data?.subscriptionMonthly?.rub ?? ''));
      })
      .catch(e => setError(e?.response?.data?.message || e.message));
  }, []);

  async function save() {
    try {
      await api.patch('/admin/config', {
        commissionPercent: { percent: Number(commission) },
        subscriptionMonthly: { rub: Number(subscription) }
      });
      setMsg('Сохранено');
      setTimeout(() => setMsg(''), 1500);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    }
  }

  return (
    <div className="max-w-md space-y-3">
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <label className="block text-sm text-gray-700 mb-1">Комиссия платформы, %</label>
        <input type="number" step="0.1" className="w-full border rounded px-3 py-2" value={commission} onChange={e => setCommission(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Подписка для авторов, ₽/мес</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={subscription} onChange={e => setSubscription(e.target.value)} />
      </div>
      <button className="px-3 py-2 bg-gray-900 text-white rounded" onClick={save}>Сохранить</button>
      {msg && <div className="text-emerald-700">{msg}</div>}
    </div>
  );
}

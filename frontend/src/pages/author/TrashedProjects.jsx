import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function TrashedProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Авторам больше нельзя очищать корзину навсегда

  async function load() {
    setLoading(true);
    try {
      const r = await api.get('/author/projects/trashed/list');
      setItems(r.data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function restore(id) {
    try {
      await api.post(`/author/projects/${id}/restore`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  }

  // purgeAll удалён для авторов

  if (loading) return <div>Загрузка…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-3">
      {/* Очистка корзины доступна только администратору в админ-панели */}
      {items.length === 0 && <div>Корзина пуста.</div>}
      {items.map(p => (
        <div key={p.id} className="p-3 border rounded flex items-center justify-between">
          <div>
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-600">
              Удалён: {new Date(p.deletedAt).toLocaleString()}
              {(() => { const exp = new Date(new Date(p.deletedAt).getTime() + 2*24*60*60*1000); return ` • Будет удалён: ${exp.toLocaleString()}`; })()}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-emerald-600 text-white rounded" onClick={() => restore(p.id)}>Восстановить</button>
          </div>
        </div>
      ))}
    </div>
  );
}

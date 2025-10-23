import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';

export default function MyProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/author/projects')
      .then(r => setItems(r.data))
      .catch(e => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, []);

  async function del(id) {
    try {
      await api.delete(`/author/projects/${id}`);
      setItems(items.filter(p => p.id !== id));
      setConfirmId(null);
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  }

  if (loading) return <div>Загрузка…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-3">
      {items.length === 0 && <div>У вас пока нет проектов.</div>}
      {items.map(p => (
        <div key={p.id} className="p-3 border rounded flex items-center justify-between">
          <div>
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-600">{p.status} • Цель ₽{Number(p.goalAmount).toLocaleString()}</div>
          </div>
          <div className="flex gap-2 items-center">
            <Link className="px-2 py-1 bg-gray-100 rounded" to={`/author/${p.id}/edit`}>Редактировать</Link>
            <Link className="px-2 py-1 bg-gray-100 rounded" to={`/author/${p.id}/stats`}>Статистика</Link>
            {confirmId === p.id ? (
              <div className="flex gap-2 items-center">
                <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => del(p.id)}>Подтвердить удаление</button>
                <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setConfirmId(null)}>Отмена</button>
              </div>
            ) : (
              <button className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded" onClick={() => setConfirmId(p.id)}>Удалить</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

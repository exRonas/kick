import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api.js';

export default function Stats() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/author/projects/${id}/stats`)
      .then(r => setStats(r.data))
      .catch(e => setError(e?.response?.data?.message || e.message));
  }, [id]);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!stats) return <div>Загрузка…</div>;

  return (
    <div className="space-y-3">
      <div className="p-3 border rounded">
        <div className="font-medium">Итого собрано</div>
        <div className="text-2xl">₽{Number(stats.totalAmount).toLocaleString()}</div>
      </div>
      <div className="p-3 border rounded">
        <div className="font-medium">Количество донатов</div>
        <div className="text-2xl">{stats.count}</div>
      </div>
      <div className="p-3 border rounded">
        <div className="font-medium mb-2">Последние донаты</div>
        <div className="space-y-1 text-sm">
          {stats.latest.map((d, i) => (
            <div key={i} className="flex justify-between">
              <span>{new Date(d.createdAt).toLocaleString()}</span>
              <span>₽{Number(d.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

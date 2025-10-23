import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(e => setError(e?.response?.data?.message || e.message));
  }, []);
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div>Загрузка…</div>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Tile title="Пользователи" value={data.usersCount} />
      <Tile title="Проекты" value={data.projectsCount} />
      <Tile title="Ожидают модерации" value={data.pendingCount} />
      <Tile title="Собрано всего" value={'₽' + Number(data.donationsSum).toLocaleString()} />
    </div>
  );
}

function Tile({ title, value }) {
  return (
    <div className="p-4 border rounded">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

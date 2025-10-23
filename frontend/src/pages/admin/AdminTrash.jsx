import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useTranslation } from 'react-i18next';

export default function AdminTrash() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [confirmPurge, setConfirmPurge] = useState(false);

  async function load() {
    const r = await api.get('/admin/projects', { params: { trashed: 'only', q: q || undefined } });
    setItems(r.data);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { load(); }, [q]);

  async function restore(id) {
    await api.post(`/admin/projects/${id}/restore`);
    await load();
  }

  async function purgeAll() {
    await api.post('/admin/projects/purge-trashed', { all: true });
    setConfirmPurge(false);
    await load();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input className="border rounded px-3 py-2" placeholder={t('search')} value={q} onChange={e => setQ(e.target.value)} />
        {confirmPurge ? (
          <>
            <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={purgeAll}>Подтвердить очистку корзины</button>
            <button className="px-3 py-2 bg-gray-100 rounded" onClick={() => setConfirmPurge(false)}>Отмена</button>
          </>
        ) : (
          <button className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded" onClick={() => setConfirmPurge(true)}>Очистить корзину</button>
        )}
      </div>

      <div className="space-y-2">
        {items.map(p => (
          <div key={p.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">Удалён: {new Date(p.deletedAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2 items-center">
              <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => restore(p.id)}>{t('admin.approve') || 'Восстановить'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

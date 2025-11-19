import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { resolveMediaUrl, rewriteUploadsInHtml } from '../../lib/media.js';

export default function AdminProjects() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('pending');
  const [q, setQ] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
  const r = await api.get('/admin/projects', { params: { status, q: q || undefined, trashed: 'exclude' } });
      setItems(r.data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    }
  }

  useEffect(() => { load(); }, [status, q]);

  async function approve(id) {
    await api.patch(`/admin/projects/${id}`, { status: 'approved' });
    await load();
  }
  async function archive(id) {
    await api.patch(`/admin/projects/${id}`, { status: 'archived' });
    await load();
  }
  async function removeProject(id) {
    await api.delete(`/admin/projects/${id}`);
    setConfirmId(null);
    await load();
  }


  const [view, setView] = useState(null); // проект для предпросмотра
  async function openView(id) {
    const r = await api.get(`/admin/projects/${id}`);
    setView(r.data);
  }
  function closeView() { setView(null); }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <select className="border rounded px-3 py-2" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="pending">{t('status.pending')}</option>
          <option value="approved">{t('status.approved')}</option>
          <option value="archived">{t('status.archived')}</option>
        </select>
        <input className="border rounded px-3 py-2" placeholder={t('search')} value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-2">
        {items.map(p => (
          <div key={p.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">{p.category} • {t(`status.${p.status}`)}</div>
            </div>
            <div className="flex gap-2 items-center">
              <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => openView(p.id)}>{t('admin.preview')}</button>
              {p.status !== 'approved' && <button className="px-2 py-1 bg-emerald-600 text-white rounded" onClick={() => approve(p.id)}>{t('admin.approve')}</button>}
              {p.status !== 'archived' && <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => archive(p.id)}>{t('admin.archive')}</button>}
              {confirmId === p.id ? (
                <>
                  <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => removeProject(p.id)}>Подтвердить удаление</button>
                  <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setConfirmId(null)}>Отмена</button>
                </>
              ) : (
                <button className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded" onClick={() => setConfirmId(p.id)}>Удалить</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно предпросмотра */}
      {view && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={closeView}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">{view.title}</div>
              <button className="px-2 py-1 bg-gray-100 rounded" onClick={closeView}>{t('close')}</button>
            </div>
            <div className="p-4 space-y-3">
              {view.coverImageUrl && <img src={resolveMediaUrl(view.coverImageUrl)} alt="cover" className="w-full rounded" />}
              <div className="text-sm text-gray-600">Категория: {view.category} • Статус: {t(`status.${view.status}`)}</div>
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rewriteUploadsInHtml(view.description || '')) }} />
              {Array.isArray(view.mediaUrls) && view.mediaUrls.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Медиа</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {view.mediaUrls.map((u, i) => (
                      <div key={i} className="border rounded p-2">
                        {u.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                          <img src={resolveMediaUrl(u)} className="w-full rounded" />
                        ) : (
                          <a href={resolveMediaUrl(u)} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{u}</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(view.team) && view.team.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Команда</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {view.team.map((m, i) => (
                      <div key={i} className="p-2 border rounded">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-sm text-gray-600">{m.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

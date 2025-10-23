import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import ProjectForm from './ProjectForm.jsx';
import RichTextEditor from '../../components/RichTextEditor.jsx';
import DOMPurify from 'dompurify';
import { rewriteUploadsInHtml } from '../../lib/media.js';

export default function EditProject() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [content, setContent] = useState('');
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(r => setProject(r.data))
      .catch(e => setError(e?.response?.data?.message || e.message));
    api.get(`/author/projects/${id}/updates`)
      .then(r => setUpdates(r.data))
      .catch(() => {});
  }, [id]);

  async function submit(data) {
    try {
      const r = await api.put(`/author/projects/${id}`, data);
      setProject(r.data);
      setMessage('Сохранено');
      setTimeout(() => setMessage(''), 1500);
    } catch (e) {
      setError(e?.response?.data?.message || 'Ошибка сохранения');
    }
  }

  async function addUpdate() {
    try {
      const r = await api.post(`/author/projects/${id}/updates`, { content });
      setUpdates([r.data, ...updates]);
      setContent('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Ошибка добавления обновления');
    }
  }

  if (!project) return <div>Загрузка…</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-3">Редактирование</h2>
        <ProjectForm initial={project} onSubmit={submit} submitLabel="Сохранить" />
        {message && <div className="text-emerald-700 mt-2">{message}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
      <div>
        <h3 className="font-semibold mb-2">Обновления</h3>
        <div className="space-y-2 mb-3">
          <RichTextEditor value={content} onChange={setContent} placeholder="Напишите обновление..." />
          <button className="px-3 py-2 bg-gray-900 text-white rounded" onClick={addUpdate}>Добавить</button>
        </div>
        <div className="space-y-2">
          {updates.map(u => (
            <div key={u.id} className="p-3 border rounded text-sm">
              <div className="text-gray-600">{new Date(u.createdAt).toLocaleString()}</div>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rewriteUploadsInHtml(u.content || '')) }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

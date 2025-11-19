import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { resolveMediaUrl, rewriteUploadsInHtml } from '../lib/media.js';
import DonateModal from '../components/DonateModal.jsx';
import DOMPurify from 'dompurify';

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donateOpen, setDonateOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/projects/${id}`)
      .then((r) => setProject(r.data))
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function submitDonation(amount) {
    try {
      const res = await api.post(`/projects/${id}/donations`, { amount });
      alert('Спасибо!');
      setProject((prev) => ({ ...prev, raisedAmount: Number(prev.raisedAmount) + Number(amount) }));
      setDonateOpen(false);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Ошибка');
    }
  }

  if (loading) return <div className="container-page py-6">Загрузка…</div>;
  if (error) return <div className="container-page py-6 text-red-600">{error}</div>;
  if (!project) return null;

  const goal = Number(project.goalAmount || 0);
  const raised = Number(project.raisedAmount || 0);
  const pct = Math.min(100, Math.round((raised / Math.max(1, goal)) * 100));

  return (
    <div className="container-page py-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {project.coverImageUrl && (
            <img src={resolveMediaUrl(project.coverImageUrl)} className="w-full rounded-lg" />
          )}
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rewriteUploadsInHtml(project.description || '')) }} />

          {Array.isArray(project.team) && (
            <div>
              <h3 className="font-semibold mb-2">Команда</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {project.team.map((m, idx) => (
                  <div key={idx} className="p-3 border rounded">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-sm text-gray-600">{m.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="p-4 border rounded-lg sticky top-6">
            <div className="mb-2">Цель: ₽{goal.toLocaleString()}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: pct + '%' }} />
            </div>
            <div className="text-sm text-gray-500 mt-1">Собрано: ₽{raised.toLocaleString()} ({pct}%)</div>
            <button className="mt-4 w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700" onClick={() => setDonateOpen(true)}>
              Поддержать
            </button>
          </div>
        </div>
      </div>

      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} project={project} onSubmit={submitDonation} />
    </div>
  );
}

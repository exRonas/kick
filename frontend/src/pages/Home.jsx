import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api.js';
import ProjectCard from '../components/ProjectCard.jsx';
import DonateModal from '../components/DonateModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Значения для category во вторых элементах — это реальные значения в БД (на RU),
// метки — через i18n
const CATEGORY_OPTIONS = [
  { labelKey: 'all', value: 'ALL' },
  { labelKey: 'physics', value: 'Физика' },
  { labelKey: 'biology', value: 'Биология' },
  { labelKey: 'it', value: 'ИТ' },
  { labelKey: 'engineering', value: 'Инженерия' }
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState('popular');
  const [donateOpen, setDonateOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api
  .get('/projects', { params: { q: search || undefined, category: category !== 'ALL' ? category : undefined, sort } })
      .then((r) => setProjects(r.data))
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [search, category, sort]);

  // auth state теперь централизован в контексте

  function handleSupport(project) {
    setActiveProject(project);
    setDonateOpen(true);
  }

  async function submitDonation(amount) {
    try {
      const res = await api.post(`/projects/${activeProject.id}/donations`, { amount });
      alert(t('thankYou'));
      // Обновим локально
      setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? { ...p, raisedAmount: Number(p.raisedAmount) + Number(amount) } : p)));
      setDonateOpen(false);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Ошибка');
    }
  }

  return (
    <div className="container-page py-6">
      {/* Hero CTA */}
      {!user && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Станьте автором и публикуйте свои проекты</div>
              <div className="text-sm text-gray-600">Создавайте карточки, загружайте материалы и собирайте поддержку</div>
            </div>
            <div className="flex gap-2">
              <a href="/register" className="px-3 py-2 bg-gray-900 text-white rounded">Зарегистрироваться</a>
              <a href="/author/new" className="px-3 py-2 bg-gray-100 rounded">Создать проект</a>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('appTitle')}</h1>
        <div className="flex items-center gap-2">
          <button className={`px-2 py-1 rounded ${i18n.language==='ru'?'bg-gray-900 text-white':'bg-gray-100'}`} onClick={() => i18n.changeLanguage('ru')}>RU</button>
          <button className={`px-2 py-1 rounded ${i18n.language==='en'?'bg-gray-900 text-white':'bg-gray-100'}`} onClick={() => i18n.changeLanguage('en')}>EN</button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-6">
        <input className="border rounded px-3 py-2 col-span-2" placeholder={t('search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border rounded px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
          ))}
        </select>
        <select className="border rounded px-3 py-2" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="popular">{t('popular')}</option>
          <option value="new">{t('newest')}</option>
          <option value="ending">{t('ending')}</option>
        </select>
      </div>

  {loading && <div>Загрузка…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onSupport={handleSupport} />)
          )}
        </div>
      )}

      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} project={activeProject} onSubmit={submitDonation} />
    </div>
  );
}

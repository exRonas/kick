import React, { useState } from 'react';
import FileUpload from '../../components/FileUpload.jsx';
import RichTextEditor from '../../components/RichTextEditor.jsx';

export default function ProjectForm({ initial = {}, onSubmit, submitLabel = 'Сохранить' }) {
  const [title, setTitle] = useState(initial.title || '');
  const [shortDescription, setShortDescription] = useState(initial.shortDescription || '');
  const [description, setDescription] = useState(initial.description || '');
  const [category, setCategory] = useState(initial.category || 'ИТ');
  const [goalAmount, setGoalAmount] = useState(initial.goalAmount || 100000);
  const [coverImageUrl, setCoverImageUrl] = useState(initial.coverImageUrl || '');
  const [mediaUrls, setMediaUrls] = useState(initial.mediaUrls || []);
  const [team, setTeam] = useState(initial.team || []);
  const [error, setError] = useState('');

  function addMedia(url) { setMediaUrls((prev) => [...prev, url]); }
  function addTeamMember() { setTeam((prev) => [...prev, { name: '', role: '' }]); }
  function updateTeam(i, key, val) {
    setTeam((prev) => prev.map((m, idx) => (idx === i ? { ...m, [key]: val } : m)));
  }

  function submit(e) {
    e.preventDefault();
    setError('');
    if (!title || !shortDescription || !description || !category || !goalAmount) {
      setError('Заполните обязательные поля');
      return;
    }
    onSubmit({ title, shortDescription, description, category, goalAmount, coverImageUrl, mediaUrls, team });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className="w-full border rounded px-3 py-2" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Короткое описание" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
      <div>
        <label className="block text-sm text-gray-700 mb-1">Описание</label>
        <RichTextEditor value={description} onChange={setDescription} placeholder="Опишите проект: заголовки, текст, изображения и видео" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Категория" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input type="number" className="border rounded px-3 py-2" placeholder="Цель" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Обложка</label>
        <div className="flex items-center gap-3">
          <input className="flex-1 border rounded px-3 py-2" placeholder="URL" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
          <FileUpload onUploaded={setCoverImageUrl} />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Медиа</label>
        <div className="space-y-2">
          {mediaUrls.map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="flex-1 border rounded px-3 py-2" value={u} onChange={(e) => setMediaUrls(mediaUrls.map((x, idx) => idx===i? e.target.value : x))} />
            </div>
          ))}
          <FileUpload onUploaded={addMedia} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm text-gray-700 mb-1">Команда</label>
          <button type="button" className="px-2 py-1 bg-gray-100 rounded" onClick={addTeamMember}>Добавить</button>
        </div>
        <div className="space-y-2">
          {team.map((m, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-2">
              <input className="border rounded px-3 py-2" placeholder="Имя" value={m.name} onChange={(e) => updateTeam(i, 'name', e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Роль" value={m.role} onChange={(e) => updateTeam(i, 'role', e.target.value)} />
            </div>
          ))}
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button className="px-4 py-2 bg-emerald-600 text-white rounded">{submitLabel}</button>
    </form>
  );
}

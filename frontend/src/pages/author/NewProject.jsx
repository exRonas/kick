import React, { useState } from 'react';
import { api } from '../../lib/api.js';
import ProjectForm from './ProjectForm.jsx';
import { useNavigate } from 'react-router-dom';

export default function NewProject() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(data) {
    try {
      const r = await api.post('/author/projects', data);
      navigate(`/author/${r.data.id}/edit`);
    } catch (e) {
      setError(e?.response?.data?.message || 'Ошибка создания');
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-3">Новый проект</h2>
      <ProjectForm onSubmit={submit} submitLabel="Создать" />
      {error && <div className="text-red-600 mt-3">{error}</div>}
    </div>
  );
}

import React, { useState } from 'react';
import { api } from '../lib/api.js';

export default function FileUpload({ onUploaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded?.(r.data.url);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input type="file" onChange={onChange} disabled={loading} />
      {loading && <div className="text-sm text-gray-500">Загрузка…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}

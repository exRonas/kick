import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resolveMediaUrl } from '../lib/media.js';

export default function ProjectCard({ project, onSupport }) {
  const { t } = useTranslation();
  const goal = Number(project.goalAmount || 0);
  const raised = Number(project.raisedAmount || 0);
  const pct = Math.min(100, Math.round((raised / Math.max(1, goal)) * 100));

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
      {project.coverImageUrl && (
        <img src={resolveMediaUrl(project.coverImageUrl)} alt={project.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{project.shortDescription}</p>
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: pct + '%' }} />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ₽{raised.toLocaleString()} / ₽{goal.toLocaleString()} ({pct}%)
          </div>
        </div>
        <div className="mt-auto flex gap-2">
          <Link to={`/project/${project.id}`} className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">
            {t('details')}
          </Link>
          <button onClick={() => onSupport(project)} className="px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">
            {t('support')}
          </button>
        </div>
      </div>
    </div>
  );
}

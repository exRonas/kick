import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DonateModal({ open, onClose, onSubmit, project }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('500');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">{t('donate')} — {project?.title}</h3>
        </div>
        <div className="p-4 space-y-3">
          <label className="block text-sm text-gray-700">
            {t('amount')}
            <input
              type="number"
              className="mt-1 w-full border rounded px-3 py-2"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <div className="flex gap-2 justify-end">
            <button className="px-3 py-2 rounded bg-gray-100" onClick={onClose}>{t('close')}</button>
            <button className="px-3 py-2 rounded bg-emerald-600 text-white" onClick={() => onSubmit(Number(amount))}>{t('donate')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

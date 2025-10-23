import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Overview from './Overview.jsx';
import AdminProjects from './AdminProjects.jsx';
import AdminUsers from './AdminUsers.jsx';
import AdminDonations from './AdminDonations.jsx';
import AdminSettings from './AdminSettings.jsx';
import AdminTrash from './AdminTrash.jsx';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { user } = useAuth();
  if (!user) return <div className="container-page py-6">Требуется вход</div>;
  if (user.role !== 'admin') return <div className="container-page py-6">Доступ только для админов</div>;

  const { t } = useTranslation();
  return (
    <div className="container-page py-6">
      <h1 className="text-2xl font-bold mb-4">{t('admin.dashboard')}</h1>
      <div className="flex gap-2 mb-6">
        <NavLink to="/admin" end className={({isActive}) => `px-3 py-2 rounded ${isActive?'bg-gray-900 text-white':'bg-gray-100'}`}>{t('admin.dashboard')}</NavLink>
        <NavLink to="/admin/projects" className={({isActive}) => `px-3 py-2 rounded ${isActive?'bg-gray-900 text-white':'bg-gray-100'}`}>{t('admin.projects')}</NavLink>
        <NavLink to="/admin/trash" className={({isActive}) => `px-3 py-2 rounded ${isActive?'bg-gray-900 text-white':'bg-gray-100'}`}>Корзина</NavLink>
        <NavLink to="/admin/users" className={({isActive}) => `px-3 py-2 rounded ${isActive?'bg-gray-900 text-white':'bg-gray-100'}`}>{t('admin.users')}</NavLink>
        <NavLink to="/admin/donations" className={({isActive}) => `px-3 py-2 rounded ${isActive?'bg-gray-900 text-white':'bg-gray-100'}`}>{t('admin.donations')}</NavLink>
        <NavLink to="/admin/settings" className={({isActive}) => `px-3 py-2 rounded ${isActive?'bg-gray-900 text-white':'bg-gray-100'}`}>{t('admin.settings')}</NavLink>
      </div>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="trash" element={<AdminTrash />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </div>
  );
}

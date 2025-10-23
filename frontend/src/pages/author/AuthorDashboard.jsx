import React from 'react';
import { Link, NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import MyProjects from './MyProjects.jsx';
import NewProject from './NewProject.jsx';
import EditProject from './EditProject.jsx';
import Stats from './Stats.jsx';
import TrashedProjects from './TrashedProjects.jsx';

export default function AuthorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <div className="container-page py-6">Требуется вход</div>;
  if (user.role !== 'author' && user.role !== 'admin') return <div className="container-page py-6">Доступ только для авторов</div>;

  return (
    <div className="container-page py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Кабинет автора</h1>
        <div className="text-sm text-gray-600">{user.activeSubscription ? 'Подписка активна' : 'Нет активной подписки'}</div>
      </div>
      <div className="flex gap-3 mb-6">
        <NavLink to="/author" end className={({isActive}) => `px-3 py-2 rounded ${isActive?'bg-gray-900 text-white':'bg-gray-100'}`}>Мои проекты</NavLink>
        <NavLink to="/author/new" className={({isActive}) => `px-3 py-2 rounded ${isActive?'bg-gray-900 text-white':'bg-gray-100'}`}>Создать проект</NavLink>
        <NavLink to="/author/trash" className={({isActive}) => `px-3 py-2 rounded ${isActive?'bg-gray-900 text-white':'bg-gray-100'}`}>Корзина</NavLink>
      </div>
      <Routes>
        <Route index element={<MyProjects />} />
        <Route path="new" element={<NewProject />} />
        <Route path=":id/edit" element={<EditProject />} />
        <Route path=":id/stats" element={<Stats />} />
        <Route path="trash" element={<TrashedProjects />} />
      </Routes>
    </div>
  );
}

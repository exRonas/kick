import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import Register from './pages/Register.jsx';
import AuthorDashboard from './pages/author/AuthorDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import SubscribeAuthor from './pages/SubscribeAuthor.jsx';
import './i18n.js';
import { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import AuthMini from './components/AuthMini.jsx';

function BecomeAuthorLink() {
  return (
    <Link to="/subscribe-author" className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-sm">Стать автором</Link>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="theme-purple min-h-screen">
      <header className="bg-white border-b">
        <div className="container-page py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">CoEd</Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-600">Demo • Реальные платежи отключены</div>
            {!user && (
              <Link to="/register" className="px-2 py-1 bg-gray-900 text-white rounded text-sm">Зарегистрироваться</Link>
            )}
            {user && user.role === 'author' && (
              <Link to="/author" className="px-2 py-1 bg-gray-100 rounded text-sm">Кабинет автора</Link>
            )}
            {user && user.role === 'donor' && (
              <BecomeAuthorLink />
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-sm">Админ</Link>
            )}
            <AuthMini />
          </div>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/author/*" element={<AuthorDashboard />} />
          <Route path="/subscribe-author" element={<SubscribeAuthor />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

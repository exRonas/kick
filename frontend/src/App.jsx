import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import Register from './pages/Register.jsx';
import AuthorDashboard from './pages/author/AuthorDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import './i18n.js';
import AuthMini from './components/AuthMini.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { user } = useAuth();

  return (
    <div>
      <header className="bg-white border-b">
        <div className="container-page py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">Kick</Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-600">Demo • Реальные платежи отключены</div>
            {!user && (
              <Link to="/register" className="px-2 py-1 bg-gray-900 text-white rounded text-sm">Зарегистрироваться</Link>
            )}
            {user && (user.role === 'author' || user.role === 'admin') && (
              <Link to="/author" className="px-2 py-1 bg-gray-100 rounded text-sm">Кабинет автора</Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" className="px-2 py-1 bg-amber-100 rounded text-sm">Админ</Link>
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
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

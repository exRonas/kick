import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function SubscribeAuthor() {
  const { user, subscribeAuthor } = useAuth();
  const navigate = useNavigate();
  const [price, setPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/subscription/price')
      .then(r => setPrice(r.data.rub))
      .catch(e => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoadingPrice(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'author') navigate('/author');
  }, [user, navigate]);

  async function pay() {
    setPaying(true); setError('');
    try {
      const r = await subscribeAuthor();
      setMessage('Подписка активирована');
      setTimeout(() => navigate('/author'), 1000);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally { setPaying(false); }
  }

  if (!user) return <div className="container-page py-6">Требуется вход</div>;
  if (user.role !== 'donor') return <div className="container-page py-6">Вы уже автор или администратор</div>;

  return (
    <div className="container-page py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Оформление авторской подписки</h1>
      {loadingPrice ? <div>Загрузка цены…</div> : (
        price ? <div className="text-lg mb-3">Стоимость: <span className="font-semibold">₽{price}</span> / месяц</div> : <div className="text-red-600">Цена не настроена, обратитесь к администратору.</div>
      )}
      <p className="text-sm text-gray-600 mb-4">Оплата тестовая, средства не списываются. После оформления вы получите доступ к кабинету автора и сможете создавать проекты.</p>
      <button disabled={paying || !price} onClick={pay} className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded disabled:opacity-50">
        {paying ? 'Обработка...' : 'Оплатить и стать автором'}
      </button>
      {message && <div className="text-emerald-600 mt-3">{message}</div>}
      {error && <div className="text-red-600 mt-3">{error}</div>}
    </div>
  );
}
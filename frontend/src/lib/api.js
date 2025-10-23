import axios from 'axios';

// В dev по умолчанию используем относительный путь '/api' и Vite proxy,
// а при наличии VITE_API_URL — ходим на указанный бэкенд
const ENV_BASE = import.meta.env.VITE_API_URL || '';
export const API_BASE = ENV_BASE || '';

export const api = axios.create({ baseURL: ENV_BASE ? `${ENV_BASE}/api` : '/api' });

// Инициализация авторизации до первых запросов (фикс 401 при первом заходе)
try {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (stored) api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
} catch {}

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

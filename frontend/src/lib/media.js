import { API_BASE } from './api.js';

export function resolveMediaUrl(url) {
  if (!url) return '';
  const u = String(url);
  if (/^(https?:)?\/\//i.test(u) || u.startsWith('data:')) return u;
  if (u.startsWith('/uploads') || u.startsWith('uploads/')) {
    const path = u.startsWith('/') ? u : `/${u}`;
    return `${API_BASE}${path}`;
  }
  return u;
}

export function rewriteUploadsInHtml(html) {
  if (!html) return '';
  const base = API_BASE.replace(/\/$/, '');
  // Заменяем src/href на абсолютные, если они указывают на /uploads
  return String(html).replace(/\b(src|href)=(['"])(\/?uploads\/[^'"\s>]+)\2/gi, (_m, attr, quote, rel) => {
    const normalized = rel.startsWith('/') ? rel : `/${rel}`;
    return `${attr}=${quote}${base}${normalized}${quote}`;
  });
}

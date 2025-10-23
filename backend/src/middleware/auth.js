import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Требуется авторизация' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Невалидный токен' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Требуется авторизация' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Недостаточно прав' });
    next();
  };
}

export function requireActiveSubscription(req, res, next) {
  // Для простоты берём флаг из JWT payload — в реальном приложении лучше читать из БД
  // Здесь же мы подтянем пользователя из БД при необходимости в контроллере
  // но быстрый чек: только для авторов
  if (!req.user) return res.status(401).json({ message: 'Требуется авторизация' });
  if (req.user.role !== 'author' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Недостаточно прав' });
  }
  // Пропускаем, детальная проверка будет в контроллерах по БД
  next();
}

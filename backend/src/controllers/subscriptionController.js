import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Config, User, Subscription } from '../models/index.js';

dotenv.config();

function signToken(user) {
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name, activeSubscription: user.activeSubscription, authorRequested: user.authorRequested };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export async function getPrice(_req, res) {
  const row = await Config.findOne({ where: { key: 'subscriptionMonthly' } });
  const rub = row?.value?.rub ?? null;
  res.json({ rub });
}

export async function subscribeAuthor(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Требуется авторизация' });
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
  } catch {
    return res.status(401).json({ message: 'Невалидный токен' });
  }
  const user = await User.findByPk(payload.id);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  if (user.role !== 'donor') return res.status(400).json({ message: 'Вы уже автор или админ' });
  if (user.activeSubscription) return res.status(400).json({ message: 'Подписка уже активна' });

  const priceRow = await Config.findOne({ where: { key: 'subscriptionMonthly' } });
  const amountRub = priceRow?.value?.rub ?? 0;
  if (!amountRub || amountRub <= 0) return res.status(500).json({ message: 'Стоимость подписки не настроена' });

  // Mock оплата (как донаты) — просто создаём запись подписки
  const expiresAt = new Date(Date.now() + 30*24*60*60*1000);
  await Subscription.create({ userId: user.id, plan: 'monthly', status: 'active', expiresAt });

  user.role = 'author';
  user.activeSubscription = true;
  // больше не требуем отдельной заявки
  if (user.authorRequested) user.authorRequested = false;
  await user.save();
  const newToken = signToken(user);
  res.json({ message: 'Подписка оформлена', token: newToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, activeSubscription: user.activeSubscription, authorRequested: user.authorRequested }, subscription: { plan: 'monthly', amountRub, expiresAt } });
}
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
import { User } from '../models/index.js';

dotenv.config();

function signToken(user) {
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name, activeSubscription: user.activeSubscription, authorRequested: user.authorRequested };
  const secret = process.env.JWT_SECRET || 'dev';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email уже зарегистрирован' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash }); // роль по умолчанию donor из модели
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, activeSubscription: user.activeSubscription, authorRequested: user.authorRequested }
    });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка регистрации', error: e.message });
  }
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Неверные учетные данные' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Неверные учетные данные' });
    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, activeSubscription: user.activeSubscription, authorRequested: user.authorRequested }
    });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка входа', error: e.message });
  }
}

export async function applyAuthor(req, res) {
  // Требуется авторизация
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Требуется авторизация' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    if (user.role === 'author' || user.role === 'admin') return res.status(400).json({ message: 'Вы уже автор' });
    if (user.authorRequested) return res.status(400).json({ message: 'Заявка уже отправлена' });
    user.authorRequested = true;
    await user.save();
    const newToken = signToken(user);
    res.json({
      message: 'Заявка на авторство отправлена',
      token: newToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, activeSubscription: user.activeSubscription, authorRequested: user.authorRequested }
    });
  } catch (e) {
    return res.status(401).json({ message: 'Невалидный токен' });
  }
}

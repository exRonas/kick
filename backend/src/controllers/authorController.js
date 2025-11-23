import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Project, User, Donation, ProjectUpdate } from '../models/index.js';

async function ensureAuthorWithSubscription(userId) {
  const user = await User.findByPk(userId);
  if (!user) return { ok: false, status: 401, message: 'Пользователь не найден' };
  if (!(user.role === 'author' || user.role === 'admin')) return { ok: false, status: 403, message: 'Недостаточно прав' };
  if (user.role === 'author' && !user.activeSubscription) return { ok: false, status: 402, message: 'Требуется активная подписка' };
  return { ok: true, user };
}

export async function myProjects(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  // Только свои проекты
  const where = { ownerId: req.user.id, deletedAt: null };
  const projects = await Project.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json(projects);
}

export async function createProject(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, shortDescription, description, category, goalAmount, coverImageUrl, mediaUrls, team } = req.body;
  try {
    const goal = Number(goalAmount);
    if (!Number.isFinite(goal) || goal <= 0) return res.status(400).json({ message: 'Некорректная сумма цели' });
    const media = Array.isArray(mediaUrls)
      ? mediaUrls
      : (typeof mediaUrls === 'string' && mediaUrls.trim().length > 0 ? mediaUrls.split(',').map((s) => s.trim()) : null);
    const teamArr = Array.isArray(team) ? team : null;

    const project = await Project.create({
      title,
      shortDescription,
      description,
      category: (category || '').trim(),
      goalAmount: goal,
      coverImageUrl: coverImageUrl || null,
      mediaUrls: media,
      team: teamArr,
      status: 'pending',
      ownerId: req.user.id
    });
    res.status(201).json(project);
  } catch (e) {
    console.error('createProject error:', e);
    res.status(500).json({ message: 'Не удалось создать проект', error: e.message });
  }
}

export async function updateProject(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const project = await Project.findByPk(id);
  if (!project) return res.status(404).json({ message: 'Проект не найден' });
  // Разрешено редактировать только владельцу
  if (project.ownerId !== req.user.id) return res.status(403).json({ message: 'Нет прав редактировать' });

  // Разрешаем авторам редактировать только контентные поля, без статуса
  const authorEditable = ['title', 'shortDescription', 'description', 'category', 'goalAmount', 'coverImageUrl', 'mediaUrls', 'team'];
  const adminEditable = [...authorEditable, 'status'];

  const canEdit = check.user.role === 'admin' ? adminEditable : authorEditable;
  for (const f of canEdit) if (typeof req.body[f] !== 'undefined') project[f] = req.body[f];
  // Normalize arrays
  if (typeof req.body.mediaUrls !== 'undefined') {
    project.mediaUrls = Array.isArray(req.body.mediaUrls)
      ? req.body.mediaUrls
      : (typeof req.body.mediaUrls === 'string' && req.body.mediaUrls.trim() ? req.body.mediaUrls.split(',').map(s=>s.trim()) : []);
  }
  if (typeof req.body.team !== 'undefined') {
    project.team = Array.isArray(req.body.team) ? req.body.team : [];
  }

  // Если автор вносит изменения, проект должен снова пройти модерацию
  // Любые правки автора отправляют проект на модерацию
  project.status = 'pending';

  await project.save();
  res.json(project);
}

export async function deleteProject(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  const { id } = req.params;
  const project = await Project.findByPk(id);
  if (!project) return res.status(404).json({ message: 'Проект не найден' });
  if (project.ownerId !== req.user.id) return res.status(403).json({ message: 'Нет прав' });
  project.deletedAt = new Date();
  await project.save();
  res.json({ ok: true, id: project.id });
}

export async function listTrashed(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  // Только своя корзина
  const where = { ownerId: req.user.id, deletedAt: { [Op.ne]: null } };
  const projects = await Project.findAll({ where, order: [['deletedAt', 'DESC']] });
  res.json(projects);
}

export async function restoreProject(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  const { id } = req.params;
  const project = await Project.findByPk(id);
  if (!project) return res.status(404).json({ message: 'Проект не найден' });
  if (project.ownerId !== req.user.id) return res.status(403).json({ message: 'Нет прав' });
  if (!project.deletedAt) return res.status(400).json({ message: 'Проект не в корзине' });
  project.deletedAt = null;
  // после восстановления отправим на модерацию
  project.status = 'pending';
  await project.save();
  res.json(project);
}

export async function purgeMyTrash(req, res) {
  // Авторам запрещено удалять навсегда
  return res.status(403).json({ message: 'Очистка корзины доступна только администратору' });
}

export async function addUpdate(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params; // projectId
  const project = await Project.findByPk(id);
  if (!project) return res.status(404).json({ message: 'Проект не найден' });
  if (check.user.role !== 'admin' && project.ownerId !== req.user.id) return res.status(403).json({ message: 'Нет прав' });
  const { content } = req.body;
  const upd = await ProjectUpdate.create({ content, projectId: project.id });
  res.status(201).json(upd);
}

export async function listUpdates(req, res) {
  const { id } = req.params;
  const project = await Project.findByPk(id);
  if (!project) return res.status(404).json({ message: 'Проект не найден' });
  if (project.ownerId !== req.user.id) return res.status(403).json({ message: 'Нет прав' });
  const updates = await ProjectUpdate.findAll({ where: { projectId: id }, order: [['createdAt', 'DESC']] });
  res.json(updates);
}

export async function projectStats(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });

  const { id } = req.params;
  const project = await Project.findByPk(id);
  if (!project) return res.status(404).json({ message: 'Проект не найден' });
  if (check.user.role !== 'admin' && project.ownerId !== req.user.id) return res.status(403).json({ message: 'Нет прав' });

  const donations = await Donation.findAll({ where: { projectId: id }, attributes: ['amount', 'createdAt'], order: [['createdAt', 'DESC']] });
  const total = donations.reduce((s, d) => s + Number(d.amount), 0);
  res.json({ totalAmount: total, count: donations.length, latest: donations.slice(0, 20) });
}

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
  const ownerId = check.user.role === 'admin' ? undefined : req.user.id;
  const where = ownerId ? { ownerId, deletedAt: null } : { deletedAt: null };
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
  if (check.user.role !== 'admin' && project.ownerId !== req.user.id) return res.status(403).json({ message: 'Нет прав редактировать' });

  // Разрешаем авторам редактировать только контентные поля, без статуса
  const authorEditable = ['title', 'shortDescription', 'description', 'category', 'goalAmount', 'coverImageUrl', 'mediaUrls', 'team'];
  const adminEditable = [...authorEditable, 'status'];

  const canEdit = check.user.role === 'admin' ? adminEditable : authorEditable;
  for (const f of canEdit) if (typeof req.body[f] !== 'undefined') project[f] = req.body[f];

  // Если автор вносит изменения, проект должен снова пройти модерацию
  if (check.user.role !== 'admin') {
    project.status = 'pending';
  }

  await project.save();
  res.json(project);
}

export async function deleteProject(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  const { id } = req.params;
  const project = await Project.findByPk(id);
  if (!project) return res.status(404).json({ message: 'Проект не найден' });
  if (check.user.role !== 'admin' && project.ownerId !== req.user.id) return res.status(403).json({ message: 'Нет прав удалять' });
  project.deletedAt = new Date();
  await project.save();
  res.json({ ok: true, id: project.id });
}

export async function listTrashed(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  const ownerId = check.user.role === 'admin' ? undefined : req.user.id;
  const where = ownerId ? { ownerId, deletedAt: { [Op.ne]: null } } : { deletedAt: { [Op.ne]: null } };
  const projects = await Project.findAll({ where, order: [['deletedAt', 'DESC']] });
  res.json(projects);
}

export async function restoreProject(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  const { id } = req.params;
  const project = await Project.findByPk(id);
  if (!project) return res.status(404).json({ message: 'Проект не найден' });
  if (check.user.role !== 'admin' && project.ownerId !== req.user.id) return res.status(403).json({ message: 'Нет прав' });
  if (!project.deletedAt) return res.status(400).json({ message: 'Проект не в корзине' });
  project.deletedAt = null;
  // после восстановления отправим на модерацию
  project.status = 'pending';
  await project.save();
  res.json(project);
}

export async function purgeMyTrash(req, res) {
  const check = await ensureAuthorWithSubscription(req.user.id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });
  const ownerId = check.user.role === 'admin' ? undefined : req.user.id;
  const where = ownerId ? { ownerId, deletedAt: { [Op.ne]: null } } : { deletedAt: { [Op.ne]: null } };

  const trashed = await Project.findAll({ where });
  const ids = trashed.map(p => p.id);
  if (ids.length === 0) return res.json({ deleted: 0, deletedFilesCount: 0 });

  // Соберём пути на удаление из текстов/полей
  const uploadPaths = new Set();
  const pushFromString = (s) => {
    if (!s || typeof s !== 'string') return;
    const re = /\/(?:uploads)\/[^\s'"<>]+/gi;
    const matches = s.match(re);
    if (matches) for (const m of matches) uploadPaths.add(m);
  };
  for (const p of trashed) {
    if (p.coverImageUrl && /\/uploads\//i.test(p.coverImageUrl)) pushFromString(String(p.coverImageUrl));
    if (Array.isArray(p.mediaUrls)) for (const u of p.mediaUrls) if (u && /\/uploads\//i.test(u)) pushFromString(String(u));
    pushFromString(p.description);
  }

  const updates = await ProjectUpdate.findAll({ where: { projectId: ids } });
  for (const u of updates) pushFromString(u.content);

  // Удаляем файлы
  const { fileURLToPath } = await import('url');
  const path = (await import('path')).default;
  const fs = (await import('fs')).default;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const bases = [path.join(__dirname, '..', '..', 'uploads'), path.resolve('uploads')];
  let deletedFilesCount = 0;
  for (const u of uploadPaths) {
    const idx = u.toLowerCase().lastIndexOf('/uploads/');
    const rel = idx >= 0 ? u.slice(idx + '/uploads/'.length + 1 - 1) : null;
    const filename = rel ? path.basename(rel) : null;
    if (!filename) continue;
    for (const base of bases) {
      const full = path.join(base, filename);
      try {
        if (fs.existsSync(full)) { fs.unlinkSync(full); deletedFilesCount++; }
      } catch {}
    }
  }

  await ProjectUpdate.destroy({ where: { projectId: ids } });
  await Donation.destroy({ where: { projectId: ids } });
  const deleted = await Project.destroy({ where: { id: ids } });
  res.json({ deleted, deletedFilesCount });
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

import { Op, fn, col } from 'sequelize';
import { User, Project, Donation, Config, ProjectUpdate } from '../models/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export async function dashboard(_req, res) {
  const [usersCount, projectsCount, pendingCount, approvedCount, archivedCount, donations] = await Promise.all([
    User.count(),
    Project.count(),
    Project.count({ where: { status: 'pending' } }),
    Project.count({ where: { status: 'approved' } }),
    Project.count({ where: { status: 'archived' } }),
    Donation.findAll({ attributes: ['amount'] })
  ]);
  const donationsSum = donations.reduce((s, d) => s + Number(d.amount), 0);
  res.json({ usersCount, projectsCount, pendingCount, approvedCount, archivedCount, donationsSum });
}

// Projects
export async function listProjects(req, res) {
  const { status, q, trashed } = req.query;
  const where = {};
  if (status) where.status = status;
  if (q) where.title = { [Op.like]: `%${q}%` };
  if (trashed === 'only') where.deletedAt = { [Op.ne]: null };
  else if (trashed === 'exclude' || !trashed) where.deletedAt = null;
  const items = await Project.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json(items);
}

export async function getProject(req, res) {
  const p = await Project.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: 'Проект не найден' });
  res.json(p);
}

export async function updateProject(req, res) {
  const p = await Project.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: 'Проект не найден' });
  // Админ может только модерировать статус проекта
  if (typeof req.body.status !== 'undefined') p.status = req.body.status;
  await p.save();
  res.json(p);
}

export async function deleteProjectAdmin(req, res) {
  const p = await Project.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: 'Проект не найден' });
  p.deletedAt = new Date();
  await p.save();
  res.json({ ok: true });
}

export async function restoreProjectAdmin(req, res) {
  const p = await Project.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: 'Проект не найден' });
  if (!p.deletedAt) return res.status(400).json({ message: 'Проект не в корзине' });
  p.deletedAt = null;
  p.status = 'pending';
  await p.save();
  res.json(p);
}

// Users
export async function listUsers(_req, res) {
  const users = await User.findAll({ order: [['createdAt', 'DESC']], attributes: { exclude: ['passwordHash'] } });
  res.json(users);
}

export async function updateUser(req, res) {
  const u = await User.findByPk(req.params.id);
  if (!u) return res.status(404).json({ message: 'Пользователь не найден' });
  const fields = ['name', 'email', 'role', 'activeSubscription'];
  for (const f of fields) if (typeof req.body[f] !== 'undefined') u[f] = req.body[f];
  await u.save();
  res.json({ id: u.id, name: u.name, email: u.email, role: u.role, activeSubscription: u.activeSubscription });
}

// Donations
export async function listDonations(req, res) {
  const { limit = 50, offset = 0 } = req.query;
  const items = await Donation.findAll({ order: [['createdAt', 'DESC']], limit: Number(limit), offset: Number(offset) });
  res.json(items);
}

// Config
export async function getConfig(_req, res) {
  const keys = ['commissionPercent', 'subscriptionMonthly'];
  const rows = await Config.findAll({ where: { key: keys } });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  for (const k of keys) if (!map[k]) map[k] = null;
  res.json(map);
}

export async function updateConfig(req, res) {
  const entries = Object.entries(req.body || {});
  for (const [key, value] of entries) {
    await Config.upsert({ key, value });
  }
  res.json({ ok: true });
}

export async function purgeOldTrashed(_req, res) {
  // Полная очистка корзины: удаляем проекты из БД и связанные файлы из uploads
  // Если all=true — чистим все из корзины, иначе — только старше 2 дней
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  const uploadsFallback = path.resolve('uploads');

  const threshold = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const where = { deletedAt: { [Op.ne]: null } };
  // body может отсутствовать в GET, но у нас POST — json есть
  // @ts-ignore
  const all = _req.body && (_req.body.all === true || _req.body.all === 'true');
  if (!all) where.deletedAt = { [Op.lt]: threshold };

  const trashed = await Project.findAll({ where });
  const ids = trashed.map(p => p.id);

  // Собираем пути из cover, mediaUrls, description и контента обновлений
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
  const deletedFiles = [];
  for (const u of uploadPaths) {
    // извлекаем имя файла
    const idx = u.toLowerCase().lastIndexOf('/uploads/');
    const rel = idx >= 0 ? u.slice(idx + '/uploads/'.length + 1 - 1) : null; // срез после '/uploads/'
    const filename = rel ? path.basename(rel) : null;
    if (!filename) continue;
    for (const base of [uploadsDir, uploadsFallback]) {
      const full = path.join(base, filename);
      try {
        if (fs.existsSync(full)) {
          fs.unlinkSync(full);
          deletedFiles.push(full);
        }
      } catch {}
    }
  }

  // Чистим связанные записи
  await ProjectUpdate.destroy({ where: { projectId: ids } });
  await Donation.destroy({ where: { projectId: ids } });
  const deleted = await Project.destroy({ where: { id: ids } });

  res.json({ deleted, deletedFilesCount: deletedFiles.length });
}

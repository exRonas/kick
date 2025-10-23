import { Op } from 'sequelize';
import { Project, Donation, User } from '../models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function listProjects(req, res) {
  const { q, category, sort } = req.query;
  try {
  const where = { status: 'approved', deletedAt: null };
    if (category) where.category = category;
    if (q) where[Op.or] = [
      { title: { [Op.like]: `%${q}%` } },
      { shortDescription: { [Op.like]: `%${q}%` } }
    ];

    const order = [];
    if (sort === 'popular') order.push(['raisedAmount', 'DESC']);
    else if (sort === 'new') order.push(['createdAt', 'DESC']);
    else if (sort === 'ending') order.push(['goalAmount', 'ASC']);

    const projects = await Project.findAll({ where, order, include: [{ model: User, as: 'owner', attributes: ['id', 'name'] }] });
    res.json(projects);
  } catch (e) {
    res.status(500).json({ message: 'Не удалось загрузить проекты', error: e.message });
  }
}

export async function getProject(req, res) {
  const { id } = req.params;
  try {
    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name'] },
        { model: Donation, as: 'donations', attributes: ['id', 'amount', 'createdAt'], limit: 10, order: [['createdAt', 'DESC']] }
      ]
    });
    if (!project) return res.status(404).json({ message: 'Проект не найден' });
    if (project.deletedAt) {
      // Скрываем от публики удалённые проекты; владелец/админ могут видеть через защищённые роуты автора/админа
      return res.status(404).json({ message: 'Проект не найден' });
    }
    // Публично доступны только approved. Иначе требуется автор/админ-владелец.
    if (project.status !== 'approved') {
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return res.status(404).json({ message: 'Проект не найден' });
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
        const isOwner = payload?.id === project.ownerId;
        const isAdmin = payload?.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(404).json({ message: 'Проект не найден' });
      } catch {
        return res.status(404).json({ message: 'Проект не найден' });
      }
    }
    res.json(project);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка загрузки проекта', error: e.message });
  }
}

import { validationResult } from 'express-validator';
import { charge } from '../utils/mockStripe.js';
import { Donation, Project } from '../models/index.js';

export async function createDonation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params; // projectId
  const { amount } = req.body;

  try {
  const project = await Project.findByPk(id);
  if (!project || project.deletedAt) return res.status(404).json({ message: 'Проект не найден' });
  if (project.status !== 'approved') return res.status(400).json({ message: 'Проект недоступен для донатов' });
    if (Number(amount) <= 0) return res.status(400).json({ message: 'Некорректная сумма' });

    const result = await charge({ amount, currency: 'RUB', source: 'tok_mock' });
    if (!result.success) return res.status(400).json({ message: 'Платеж отклонён', error: result.error });

    const donation = await Donation.create({
      amount: Number(amount).toFixed(2),
      currency: 'RUB',
      status: 'succeeded',
      paymentId: result.paymentId,
      userId: req.user.id,
      projectId: project.id
    });

    // Обновим сумму проекта
    project.raisedAmount = (Number(project.raisedAmount) + Number(amount)).toFixed(2);
    await project.save();

    res.status(201).json({ message: 'Спасибо за поддержку!', donation, project });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка доната', error: e.message });
  }
}

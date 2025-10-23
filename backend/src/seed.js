import dotenv from 'dotenv';
import { sequelize } from './config/db.js';
import { User, Project, Config, syncModels, migrateSchema } from './models/index.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function seed() {
  await sequelize.authenticate();
  await syncModels(false, false);
  await migrateSchema();

  // Ensure one admin and one author, one donor
  const [admin] = await User.findOrCreate({
    where: { email: 'admin@example.com' },
    defaults: { name: 'Admin', email: 'admin@example.com', passwordHash: await bcrypt.hash('admin123', 10), role: 'admin' }
  });
  const [author] = await User.findOrCreate({
    where: { email: 'author@example.com' },
    defaults: { name: 'Author', email: 'author@example.com', passwordHash: await bcrypt.hash('author123', 10), role: 'author', activeSubscription: true }
  });
  if (!author.activeSubscription) { author.activeSubscription = true; await author.save(); }
  await User.findOrCreate({
    where: { email: 'donor@example.com' },
    defaults: { name: 'Donor', email: 'donor@example.com', passwordHash: await bcrypt.hash('donor123', 10), role: 'donor' }
  });

  const categories = ['Физика', 'Биология', 'ИТ', 'Инженерия'];

  const sample = [
    {
      title: 'Квантовый сенсор следующего поколения',
      shortDescription: 'Прототип датчика для точных измерений.',
      description: 'Подробное описание проекта с этапами, рисками и ожидаемым результатом.',
      category: categories[0],
      goalAmount: 500000,
      raisedAmount: 125000,
      coverImageUrl: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?q=80&w=1200',
      mediaUrls: [],
      team: [
        { name: 'Иван Петров', role: 'PI', photo: '' },
        { name: 'Анна Смирнова', role: 'Инженер', photo: '' }
      ],
      status: 'approved',
      ownerId: author.id
    },
    {
      title: 'Биоинформатический анализ редких заболеваний',
      shortDescription: 'Алгоритмы для диагностики на геномных данных.',
      description: 'Детали проекта, публикации и ожидаемые метрики точности.',
      category: categories[1],
      goalAmount: 350000,
      raisedAmount: 54000,
      coverImageUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=1200',
      mediaUrls: [],
      team: [
        { name: 'Олег Ким', role: 'Data Scientist', photo: '' }
      ],
      status: 'approved',
      ownerId: author.id
    },
    {
      title: 'Образовательная платформа по ИИ',
      shortDescription: 'Курсы и симуляторы по машинному обучению.',
      description: 'Планы по функционалу, команде и интеграциям.',
      category: categories[2],
      goalAmount: 200000,
      raisedAmount: 187000,
      coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200',
      mediaUrls: [],
      team: [
        { name: 'Мария Орлова', role: 'PM', photo: '' },
        { name: 'Сергей Лебедев', role: 'Разработчик', photo: '' }
      ],
      status: 'approved',
      ownerId: author.id
    }
  ];

  for (const p of sample) {
    await Project.findOrCreate({ where: { title: p.title }, defaults: p });
  }

  // Default config values
  await Config.upsert({ key: 'commissionPercent', value: { percent: 5.0 } });
  await Config.upsert({ key: 'subscriptionMonthly', value: { rub: 499 } });

  console.log('✅ Seed completed');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

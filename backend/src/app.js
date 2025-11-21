import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { syncModels, migrateSchema } from './models/index.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import donationsRoutes from './routes/donations.js';
import authorRoutes from './routes/author.js';
import uploadsRoutes from './routes/uploads.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// CORS
const allowed = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowed.length === 0 || allowed.includes(origin)), credentials: true }));

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));
// Fallback: если ранее файлы попадали в uploads относительно CWD (например, корня монорепо)
// попробуем также раздавать и оттуда
app.use('/uploads', express.static(path.resolve('uploads')));

// Optional frontend static (для минимального деплоя без nginx)
const distPath = process.env.FRONTEND_DIST_PATH || path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  app.get(/^(?!\/api\/).*/, (_req, res, next) => {
    const indexFile = path.join(distPath, 'index.html');
    if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
    return next();
  });
}

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:id/donations', donationsRoutes);
app.use('/api/author', authorRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

export async function initApp() {
  await connectDB();
  // избегаем alter-синков, вместо этого применяем маленькие миграции
  await syncModels(false, false);
  await migrateSchema();
  return app;
}

export default app;

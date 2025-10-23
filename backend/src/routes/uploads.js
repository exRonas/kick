import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRequired, requireRole } from '../middleware/auth.js';

// Делаем путь к папке загрузок согласованным с тем, как она раздаётся в app.js
// (backend/uploads относительно текущего файла)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, unique + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    // Примитивный фильтр форматов
    const ok = /(image|video|pdf)/i.test(file.mimetype);
    if (!ok) return cb(new Error('Недопустимый тип файла'));
    cb(null, true);
  }
});

const router = Router();

router.post('/', authRequired, requireRole('author', 'admin'), upload.single('file'), (req, res) => {
  const filename = path.basename(req.file.path);
  const url = `/uploads/${filename}`;
  res.status(201).json({ url, filename });
});

export default router;

import dotenv from 'dotenv';
import { initApp } from './app.js';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

initApp()
  .then((app) => {
    app.listen(PORT, () => console.log(`🚀 API сервер запущен на http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('Failed to start server:', e);
    process.exit(1);
  });

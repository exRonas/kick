import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // Разрешаем любые хосты (подходит для динамических доменов, таких как *.ngrok-free.app)
    allowedHosts: true,
    // HMR через туннель (опционально): если используете HTTPS-туннель, раскомментируйте строки ниже и подставьте свой хост
    // hmr: {
    //   host: 'a76385f41f0e.ngrok-free.app',
    //   protocol: 'wss',
    //   clientPort: 443
    // },
    proxy: {
      // Проксируем статику загрузок с бэкенда, чтобы ссылки вида /uploads/... работали в dev
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      // Проксируем API, чтобы фронт ходил по относительному пути /api и не упирался в CORS/блокировки
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_BACKEND_URL || env.VITE_API_URL || 'http://localhost:4000';
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      // Разрешаем любые хосты (подходит для динамических доменов, таких как *.ngrok-free.app)
      allowedHosts: true,
      // HMR через туннель (опционально): если используете HTTPS-туннель, раскомментируйте строки ниже и подставьте свой хост
      // hmr: {
      //   host: env.VITE_TUNNEL_HOST || undefined,
      //   protocol: env.VITE_TUNNEL_HTTPS ? 'wss' : undefined,
      //   clientPort: env.VITE_TUNNEL_HTTPS ? 443 : undefined
      // },
      proxy: {
        // Проксируем статику загрузок с бэкенда, чтобы ссылки вида /uploads/... работали в dev
        '/uploads': { target, changeOrigin: true },
        // Проксируем API, чтобы фронт ходил по относительному пути /api и не упирался в CORS/блокировки
        '/api': { target, changeOrigin: true }
      }
    }
  };
});

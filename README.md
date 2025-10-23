# Kick — платформа донатов на проекты (мини-Kickstarter)

Монорепозиторий с двумя приложениями:

- `backend` — Node.js (Express) + Sequelize (MySQL) + JWT
- `frontend` — React + Vite + Tailwind CSS

## Быстрый старт

1) Сконфигурируйте базу MySQL (создайте БД, например `kick_dev`).

2) Backend:

- Скопируйте `backend/.env.example` в `backend/.env` и укажите доступ к БД и JWT_SECRET.
- Установите зависимости и запустите сидинг (создание таблиц и стартовых данных):

```
cd backend
npm install
npm run seed
npm run dev
```

Сервер поднимется на `http://localhost:4000`.

3) Frontend:

```
cd frontend
npm install
npm run dev
```

Откройте указанный Vite preview URL (обычно `http://localhost:5173`).

## Маршруты API (минимум)

- POST `/api/auth/register` — регистрация (name, email, password)
- POST `/api/auth/login` — вход (email, password) → JWT
- GET `/api/projects` — список проектов с поиском/фильтрами
- GET `/api/projects/:id` — детальная информация по проекту
- POST `/api/projects/:id/donations` — создать донат (требуется JWT), mock-оплата

## Структура

```
backend/
  src/
    config/db.js
    models/*.js
    routes/*.js
    controllers/*.js
    middleware/auth.js
    utils/mockStripe.js
    app.js
    server.js
    seed.js
  .env.example
  package.json

frontend/
  index.html
  vite.config.js
  postcss.config.js
  tailwind.config.js
  src/
    index.css
    main.jsx
    App.jsx
    i18n.js
    lib/api.js
    components/*.jsx
    pages/*.jsx
  package.json
```

## Заметки

- Платежи эмулируются через `utils/mockStripe.js` без внешних API.
- На продакшене включите HTTPS, CORS-ограничения доменов и храните секреты только в переменных окружения.

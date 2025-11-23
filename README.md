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

### Роли и авторство

По умолчанию новые пользователи регистрируются с ролью `donor` и без активной подписки. Они видят ссылку «Стать автором» ведущую на страницу оплаты. Оплата тестовая (mock), после успешной оплаты:

1. Создаётся запись подписки.
2. Пользователь получает `role=author` и `activeSubscription=true`.
3. Появляется кнопка «Кабинет автора». 

Цена подписки (руб/мес) задаётся админом в разделе настроек: ключ `subscriptionMonthly`.

### Минимальный продакшен (одно приложение + pm2, без nginx)

Для очень быстрого развёртывания (VDS AlmaLinux 4GB RAM) можно не ставить nginx и раздавать собранный фронт через backend. Шаги:

1. Скопируйте `.env.example` → `.env` и при желании используйте SQLite (без установки MySQL):
```
DB_DIALECT=sqlite
SQLITE_FILE=data.sqlite
PORT=4000
JWT_SECRET=СЛОЖНЫЙ_СЕКРЕТ
```
2. Установите Node 20+ и клонируйте репозиторий.
3. Выполните:
```bash
bash deploy/minimal_alma.sh
```
Скрипт: установит зависимости, выполнит сид, соберёт фронт и запустит pm2. Всё доступно на порту `4000` (API + статика).

Обновление кода:
```bash
git pull
cd backend && npm install --production && node src/seed.js
cd ../frontend && npm install && npm run build
pm2 restart kick-backend
```

Если требуется MySQL — оставьте `DB_DIALECT=mysql` и заполните параметры подключения.

### Запуск через PM2 (ecosystem.config.js)

Если вы хотите быстро поднять только backend (который также может раздавать собранный фронт), используйте `backend/ecosystem.config.js`.

1. Установите pm2 глобально (однократно):
```bash
npm install -g pm2
```
2. Скопируйте `backend/.env.example` → `backend/.env` и задайте переменные. Для SQLite минимально:
```
DB_DIALECT=sqlite
SQLITE_FILE=data.sqlite
PORT=4000
JWT_SECRET=СЛОЖНЫЙ_СЕКРЕТ
```
3. Установка зависимостей и подготовка:
```bash
cd backend
npm install --production
node src/seed.js
```
4. (Опционально) Собрать фронтенд и указать путь, если хотите чтобы backend обслуживал статику:
```bash
cd ../frontend
npm install
npm run build
```
Скопируйте/оставьте путь сборки и добавьте переменную в `.env` backend, например:
```
FRONTEND_DIST_PATH=../frontend/dist
```
5. Запуск через pm2 из каталога `backend`:
Переименовать
```bash
pm2 start ecosystem.config.js -> pm2 start ecosystem.config.cjs
```

```bash
pm2 start ecosystem.config.cjs --only kick-backend
```
Проверка:
```bash
pm2 list
pm2 logs kick-backend --lines 50
```
6. Автостарт при перезагрузке сервера:
```bash
pm2 save
pm2 startup systemd
```
Выполните выводимую команду (copy/paste), затем снова `pm2 save`.

#### Обновление кода (pull + rebuild)

Из корня репозитория:
```bash
git pull
cd backend
npm install --production
node src/seed.js
cd ../frontend
npm install
npm run build
cd ../backend
pm2 restart kick-backend
```

#### Просмотр состояния и логов
```bash
pm2 status
pm2 show kick-backend
pm2 logs kick-backend --lines 100
```

#### Перезапуск и остановка
```bash
pm2 restart kick-backend
pm2 stop kick-backend
pm2 delete kick-backend
```

#### Ротация логов (избавиться от роста файлов)
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### Настройка цены подписки вручную (если отсутствует или опечатка)
Одноразово:
```bash
node -e "import('./src/models/index.js').then(async m=>{const {Config}=m; const row=await Config.findOne({where:{key:'subscriptionMonthly'}}); if(row){row.value={rub:499}; await row.save(); console.log('Updated');} else {await Config.create({key:'subscriptionMonthly', value:{rub:499}}); console.log('Created');} process.exit(0);})"
```

После этого эндпоинт `/api/subscription/price` должен вернуть `{"rub":499}`.


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

## Деплой на VDS (пошагово)

Ниже пример для двух основных семейств Linux:

- Ubuntu/Debian (менеджер пакетов `apt`)
- AlmaLinux/Rocky/CentOS/RHEL (менеджер пакетов `dnf`/`yum`)

> Если у вас ошибка `sudo: apt: command not found`, значит это не Debian/Ubuntu — используйте блок для `dnf`.

### 1. Подготовка сервера

Определите дистрибутив:

```bash
cat /etc/*release
```

Обновите пакеты и установите базовые утилиты.

Ubuntu/Debian:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx ufw build-essential
```

Alma/Rocky/CentOS/RHEL:
```bash
sudo dnf update -y
sudo dnf install -y curl wget git nginx
sudo dnf groupinstall -y "Development Tools"
```

Откройте HTTP/HTTPS порт.

Ubuntu (UFW):
```bash
sudo ufw allow OpenSSH
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

RHEL-семейство (firewalld):
```bash
sudo systemctl enable --now firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. Установка Node.js

Рекомендуется Node 20+.

Ubuntu/Debian через NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

RHEL через NodeSource:
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

Проверьте:
```bash
node -v
npm -v
```

Альтернатива: `nvm` (удобно для смены версий):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
```

### 3. Установка MySQL / MariaDB

Ubuntu/Debian (MySQL сервер):
```bash
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

RHEL (MariaDB сервер):
```bash
sudo dnf install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mysql_secure_installation
```

Создайте базу и пользователя:
```sql
CREATE DATABASE kick_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kick_user'@'localhost' IDENTIFIED BY 'СЛОЖНЫЙ_ПАРОЛЬ';
GRANT ALL PRIVILEGES ON kick_prod.* TO 'kick_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Клонирование проекта

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone https://github.com/ВАШ_РЕПО/kick.git
cd kick
```

### 5. Backend настройка

```bash
cd backend
cp .env.example .env
```

Отредактируйте `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kick_prod
DB_USER=kick_user
DB_PASS=СЛОЖНЫЙ_ПАРОЛЬ
PORT=4000
JWT_SECRET=СЛОЖНЫЙ_ДЛИННЫЙ_RANDOM
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://your-domain.ru
```

Установка зависимостей и сид:
```bash
npm install
npm run seed
```

Проверочный запуск (foreground):
```bash
npm run dev
```

### 6. Frontend сборка

```bash
cd ../frontend
npm install
npm run build
```

Получится `frontend/dist` — его отдаст Nginx как статику.

Если бэкенд на том же домене, можно оставить относительные `/api` и `/uploads`. Если другой домен/API, задайте в `.env` фронта:
```
VITE_API_URL=https://api.your-domain.ru
```
и пересоберите.

### 7. Systemd сервис для backend

Создайте юнит:
```bash
sudo nano /etc/systemd/system/kick-backend.service
```
Содержимое:
```
[Unit]
Description=Kick Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/kick/backend
ExecStart=/usr/bin/npm run start
Environment=NODE_ENV=production
Restart=on-failure
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Создайте пользователя, если нужно:
```bash
sudo usermod -a -G www-data $USER
sudo chown -R www-data:www-data /var/www/kick/backend/uploads
```

Активируйте:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now kick-backend
sudo systemctl status kick-backend
```

Альтернатива: PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js --only kick-backend
pm2 save
pm2 startup systemd
```

### 8. Nginx конфигурация

```bash
sudo nano /etc/nginx/sites-available/kick.conf
```
Пример:
```
server {
  server_name your-domain.ru;
  root /var/www/kick/frontend/dist;
  index index.html;

  # Статика фронта
  location / {
    try_files $uri /index.html;
  }

  # API прокси
  location /api/ {
    proxy_pass http://127.0.0.1:4000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Загрузки
  location /uploads/ {
    proxy_pass http://127.0.0.1:4000/uploads/;
    proxy_set_header Host $host;
  }
}
```

Активируйте:
```bash
sudo ln -s /etc/nginx/sites-available/kick.conf /etc/nginx/sites-enabled/kick.conf
sudo nginx -t
sudo systemctl restart nginx
```

### 9. HTTPS (Let’s Encrypt)

Ubuntu:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.ru --email you@domain.ru --agree-tos --redirect
```

RHEL (через snapd или certbot пакет, зависит от репо): установите certbot и используйте аналогичную команду.

### 10. Логи и мониторинг

- Backend stdout: `journalctl -u kick-backend -f`
- Nginx доступ/ошибки: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- PM2 (если используется): `pm2 logs kick-backend`

### 11. Резервное копирование БД

Dump:
```bash
mysqldump -u kick_user -p kick_prod > /root/kick_prod_$(date +%F).sql
```
Автоматизируйте через cron (`crontab -e`).

### 12. Обновления деплоя

```bash
cd /var/www/kick
git pull
cd backend && npm install && npm run migrate || npm run seed
sudo systemctl restart kick-backend
cd ../frontend && npm install && npm run build
sudo systemctl restart nginx
```

### 13. Настройки безопасности

- Смените все дефолтные пароли и `JWT_SECRET`.
- Ограничьте SSH (ключи, порт, Fail2Ban).
- Следите за обновлениями: `apt upgrade` или `dnf update` регулярно.
- Не храните `.env` в репозитории.

### 14. Проверка CORS

`CORS_ORIGINS` в `.env` backend укажите точный протокол и домен: `https://your-domain.ru`.
Разделяйте запятыми, если несколько.

### 15. Тест после деплоя

Откройте `https://your-domain.ru` → зарегистрируйтесь → создайте проект → загрузите обложку → удостоверьтесь, что `/uploads/...` работает.

### 16. Возможные доработки (необязательно)

- Настроить автоматическое удаление старых проектов из корзины (cron/worker).
- Вынести MySQL на отдельный управляемый сервис.
- Добавить централизованный логгер (pino + ротация).
- Включить WAF/Cloudflare перед сервером.

---
Если ваш дистрибутив не совпадает с примерами — адаптируйте пакетные менеджеры и пути, логика остаётся той же.

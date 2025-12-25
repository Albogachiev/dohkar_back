# Инструкция по настройке бэкенда

## Предварительные требования

- Node.js 18+
- PostgreSQL 14+
- npm или yarn

## Шаги установки

### 1. Установка зависимостей

```bash
cd server
npm install
```

### 2. Настройка базы данных

Создайте базу данных PostgreSQL:

```sql
CREATE DATABASE dohkar;
```

### 3. Настройка переменных окружения

Создайте файл `.env` в папке `server/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dohkar?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

Для OAuth (опционально):
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

YANDEX_CLIENT_ID="your-yandex-client-id"
YANDEX_CLIENT_SECRET="your-yandex-client-secret"
YANDEX_CALLBACK_URL="http://localhost:3001/api/auth/yandex/callback"

VK_CLIENT_ID="your-vk-client-id"
VK_CLIENT_SECRET="your-vk-client-secret"
VK_CALLBACK_URL="http://localhost:3001/api/auth/vk/callback"
```

### 4. Запуск миграций Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Запуск сервера

Development режим:
```bash
npm run start:dev
```

Production режим:
```bash
npm run build
npm run start:prod
```

## Проверка работы

1. Сервер должен запуститься на `http://localhost:3001`
2. Swagger документация доступна на `http://localhost:3001/api/docs`
3. Health check: `http://localhost:3001/api/health`

## Настройка OAuth провайдеров

### Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 credentials
5. Добавьте authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
6. Скопируйте Client ID и Client Secret в `.env`

### Yandex OAuth

1. Перейдите в [Yandex OAuth](https://oauth.yandex.ru/)
2. Создайте новое приложение
3. Добавьте redirect URI: `http://localhost:3001/api/auth/yandex/callback`
4. Скопируйте Client ID и Client Secret в `.env`

### VK OAuth

1. Перейдите в [VK Developers](https://vk.com/dev)
2. Создайте новое приложение
3. Добавьте redirect URI: `http://localhost:3001/api/auth/vk/callback`
4. Скопируйте Client ID и Client Secret в `.env`

## Полезные команды

```bash
# Генерация Prisma Client
npm run prisma:generate

# Создание новой миграции
npm run prisma:migrate

# Открыть Prisma Studio (GUI для БД)
npm run prisma:studio

# Проверка типов TypeScript
npm run build

# Линтинг
npm run lint
```

## Структура базы данных

После миграций будут созданы следующие таблицы:
- `users` - пользователи
- `properties` - объявления о недвижимости
- `favorites` - избранное
- `refresh_tokens` - refresh токены

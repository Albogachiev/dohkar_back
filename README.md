# Dohkar Backend API
<!-- при тестировании гугл авторизации в деве, установить заголовок 
Referrer-Policy strict-origin-when-cross-origin -->
Backend API для платформы недвижимости Dohkar, построенный на NestJS, PostgreSQL и Prisma.

## Технологии

- **NestJS** - прогрессивный Node.js фреймворк
- **PostgreSQL** - реляционная база данных
- **Prisma** - современный ORM
- **JWT** - аутентификация через токены
- **Passport** - стратегии аутентификации (Local, Google, Yandex, VK)
- **Swagger** - документация API
- **class-validator** - валидация DTOs
- **class-transformer** - трансформация данных

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Настройте переменные окружения в `.env`:
   - `DATABASE_URL` - строка подключения к PostgreSQL
   - `JWT_SECRET` и `JWT_REFRESH_SECRET` - секретные ключи для JWT
   - OAuth credentials для Google, Yandex, VK (опционально)

4. Запустите миграции Prisma:
```bash
npm run prisma:generate
npm run prisma:migrate
```

## Запуск

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Документация

После запуска сервера, Swagger документация доступна по адресу:
```
http://localhost:3001/api/docs
```

## Структура проекта

```
server/
├── prisma/
│   └── schema.prisma          # Схема базы данных
├── src/
│   ├── auth/                  # Модуль авторизации
│   │   ├── strategies/        # Passport стратегии
│   │   ├── guards/            # Guards для защиты роутов
│   │   ├── decorators/        # Кастомные декораторы
│   │   └── dto/              # Data Transfer Objects
│   ├── users/                 # Модуль пользователей
│   ├── properties/            # Модуль недвижимости
│   ├── favorites/            # Модуль избранного
│   ├── common/                # Общие компоненты
│   │   ├── filters/          # Exception filters
│   │   ├── interceptors/     # Interceptors
│   │   └── pipes/            # Validation pipes
│   ├── config/                # Конфигурация
│   ├── app.module.ts         # Главный модуль
│   └── main.ts               # Точка входа
├── .env.example              # Пример переменных окружения
└── package.json
```

## API Endpoints

### Авторизация (`/api/auth`)
- `POST /api/auth/send-code` - Отправка SMS-кода для входа по номеру
- `POST /api/auth/phone/verify` - Вход/регистрация по SMS-коду
- `POST /api/auth/register/phone-password` - Регистрация по номеру и паролю
- `POST /api/auth/login/phone-password` - Вход по номеру и паролю
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Callback для Google OAuth
- `GET /api/auth/yandex` - Yandex OAuth
- `GET /api/auth/yandex/callback` - Callback для Yandex OAuth
- `GET /api/auth/vk` - VK OAuth
- `POST /api/auth/forgot-password` - Восстановление пароля

### Пользователи (`/api/users`)
- `GET /api/users/me` - Профиль текущего пользователя
- `PATCH /api/users/me` - Обновление профиля
- `GET /api/users/:id` - Получение пользователя по ID

### Недвижимость (`/api/properties`)
- `GET /api/properties` - Список с фильтрами
- `GET /api/properties/search?q=query` - Поиск
- `GET /api/properties/:id` - Детали объявления
- `POST /api/properties` - Создание (требует авторизации)
- `PATCH /api/properties/:id` - Обновление (только владелец)
- `DELETE /api/properties/:id` - Удаление (только владелец)

### Избранное (`/api/favorites`)
- `GET /api/favorites` - Список избранного
- `POST /api/favorites/:propertyId` - Добавить в избранное
- `DELETE /api/favorites/:propertyId` - Удалить из избранного

## Аутентификация

API использует JWT токены. После успешной авторизации, включите токен в заголовок:
```
Authorization: Bearer <access_token>
```

Access token действителен 15 минут, refresh token - 7 дней.

## Prisma Commands

```bash
# Генерация Prisma Client
npm run prisma:generate

# Создание миграции
npm run prisma:migrate

# Открыть Prisma Studio
npm run prisma:studio
```

## Лицензия

Private

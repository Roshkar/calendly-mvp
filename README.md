# 📅 Calendly MVP - Meeting Scheduling App

Современное приложение для планирования встреч, построенное на Next.js 14 и Supabase. Полнофункциональный MVP с поддержкой аутентификации, управления событиями и бронирования встреч.

## 🚀 Ключевые возможности

- **🔐 Аутентификация** - Безопасная регистрация и вход через Supabase Auth
- **📊 Управление событиями** - Создание и настройка типов встреч
- **⏰ Настройка доступности** - Гибкое управление рабочими часами
- **🔗 Простое бронирование** - Персональные ссылки для бронирования
- **📱 Отзывчивый дизайн** - Оптимизирован для всех устройств
- **🌐 Глобальный доступ** - Поддержка временных зон
- **⚡ Высокая производительность** - Оптимизирован для скорости

## 🛠️ Технологический стек

### Frontend
- **Next.js 14** - App Router, Server Components
- **React 18** - Современные React возможности
- **TypeScript** - Полная типизация
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Современные UI компоненты

### Backend & Database
- **Supabase** - PostgreSQL + Auth + Real-time
- **Row Level Security** - Безопасность на уровне базы данных
- **Automatic migrations** - Версионирование схемы БД

### State Management & Forms
- **Zustand** - Легковесное управление состоянием
- **React Hook Form** - Производительные формы
- **Zod** - Валидация схем

### Development & Testing
- **ESLint** - Линтинг кода
- **Prettier** - Форматирование кода
- **Jest** - Unit тестирование
- **Playwright** - E2E тестирование

### Deployment Options
- **Vercel** - Рекомендуемая платформа (полная поддержка Next.js)
- **Cloudflare Pages** - Максимальная производительность (статический экспорт)

## 📦 Установка

### Предварительные требования

- Node.js 18+
- npm/yarn/pnpm
- Supabase аккаунт

### Локальная установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd calendly-mvp
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
```bash
cp .env.example .env.local
```

Заполните следующие переменные:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Настройте базу данных**
```bash
# Установите Supabase CLI
npm install -g supabase

# Инициализируйте проект
supabase init

# Запустите миграции
supabase db reset
```

5. **Запустите проект**
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🗄️ База данных

### Структура таблиц

- `profiles` - Профили пользователей
- `event_types` - Типы событий
- `availabilities` - Доступность пользователей
- `bookings` - Бронирования встреч

### Миграции

Все миграции находятся в папке `supabase/migrations/`.

## 🚀 Деплой

У вас есть **два варианта деплоя** с готовыми конфигурациями:

### 🥇 Vercel (Рекомендуется для начинающих)

**Преимущества**: Полная поддержка Next.js, простая настройка, серверные функции

```bash
# Быстрый деплой
npm install -g vercel
vercel --prod
```

**📖 Подробная инструкция**: [`DEPLOYMENT.md`](./DEPLOYMENT.md)

### ⚡ Cloudflare Pages (Максимальная производительность)

**Преимущества**: Самая быстрая CDN, DDoS защита, отличная производительность

```bash
# Для статического экспорта (рекомендуется)
npm run build:static
```

**📖 Подробная инструкция**: [`CLOUDFLARE_DEPLOYMENT.md`](./CLOUDFLARE_DEPLOYMENT.md)

### 🤔 Какую платформу выбрать?

| Критерий | Vercel | Cloudflare Pages |
|----------|--------|------------------|
| **Простота настройки** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Производительность** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Поддержка Next.js** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Глобальная CDN** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Цена** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**📖 Детальное сравнение**: [`PLATFORM_COMPARISON.md`](./PLATFORM_COMPARISON.md)

### 🔄 Автоматический деплой

Оба варианта поддерживают автоматический деплой через **GitHub Actions**:

- ✅ Деплой в production при пуше в `main`
- ✅ Preview deployments для Pull Requests
- ✅ Автоматические проверки (lint, typecheck, build)
- ✅ Уведомления о статусе деплоя

## 📝 Скрипты

```bash
# Разработка
npm run dev                    # Запуск dev сервера на localhost:3000

# Сборка и деплой
npm run build                  # Обычная сборка для Vercel
npm run build:static          # Статический экспорт для Cloudflare Pages
npm start                     # Запуск продакшн сервера

# Качество кода
npm run lint                   # Проверка ESLint правил
npm run lint:fix              # Автоисправление ESLint ошибок
npm run type-check            # Проверка TypeScript типов
npm run format                # Форматирование кода с Prettier
npm run format:check          # Проверка форматирования

# Тестирование
npm test                      # Unit тесты с Jest
npm run test:watch           # Jest в watch режиме
npm run test:coverage        # Тесты с покрытием кода
npm run test:e2e             # E2E тесты с Playwright
npm run test:e2e:ui          # E2E тесты с UI

# База данных
npm run supabase:gen-types   # Генерация TypeScript типов из БД
npm run db:reset             # Сброс локальной БД
npm run db:migrate           # Применение миграций
```

## 🔧 Настройка

### Supabase

1. Создайте новый проект в [Supabase](https://supabase.com)
2. Скопируйте URL и anon key
3. Выполните миграции из папки `supabase/migrations/`
4. Настройте RLS политики

### Аутентификация

Поддерживается:
- Email/Password
- OAuth провайдеры (Google, GitHub)

## 🎨 UI Components

Используются компоненты из [shadcn/ui](https://ui.shadcn.com/):
- Button
- Input
- Form
- Card
- Calendar
- Select

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Тесты с покрытием
npm run test:coverage
```

## 📊 Мониторинг

Настроен GitHub Actions для:
- Автоматического тестирования
- Деплоя на Vercel
- Проверки безопасности
- Обновления зависимостей

## 📁 Структура проекта

```
calendly-mvp/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Группа маршрутов аутентификации
│   │   ├── (dashboard)/         # Защищенные маршруты
│   │   ├── (public)/            # Публичные страницы бронирования
│   │   ├── api/                 # API маршруты
│   │   ├── globals.css          # Глобальные стили
│   │   ├── layout.tsx           # Корневой layout
│   │   └── page.tsx             # Главная страница
│   ├── components/
│   │   ├── ui/                  # Базовые UI компоненты (shadcn/ui)
│   │   ├── auth/                # Компоненты аутентификации
│   │   ├── event-types/         # Управление типами событий
│   │   ├── availability/        # Настройка доступности
│   │   ├── booking/             # Бронирование встреч
│   │   └── layout/              # Layout компоненты
│   ├── lib/
│   │   ├── supabase/            # Конфигурация Supabase
│   │   ├── utils/               # Вспомогательные функции
│   │   └── validations/         # Схемы валидации
│   ├── hooks/                   # Custom React hooks
│   ├── store/                   # Zustand stores
│   └── types/                   # TypeScript типы
├── supabase/
│   ├── migrations/              # Миграции базы данных
│   └── config.toml              # Конфигурация Supabase
├── .github/workflows/           # GitHub Actions
│   ├── ci-cd.yml               # Деплой на Vercel
│   └── cloudflare-deploy.yml   # Деплой на Cloudflare Pages
├── _headers                     # HTTP заголовки для Cloudflare
├── _redirects                   # Redirects для Cloudflare
├── wrangler.toml               # Конфигурация Cloudflare
├── vercel.json                 # Конфигурация Vercel
└── README.md                   # Этот файл
```

## 🤝 Разработка

### Git Workflow

1. **Форкните репозиторий**
2. **Создайте ветку для функции**:
   ```bash
   git checkout -b feature/awesome-feature
   ```
3. **Внесите изменения и коммиты**:
   ```bash
   git commit -m "Add awesome feature"
   ```
4. **Запушьте ветку**:
   ```bash
   git push origin feature/awesome-feature
   ```
5. **Создайте Pull Request**

### Code Style

- **ESLint** - для проверки качества кода
- **Prettier** - для форматирования
- **TypeScript** - строгая типизация
- **Conventional Commits** - стандарт коммитов

### Ветки

- `main` - стабильная продакшн ветка
- `develop` - ветка разработки
- `feature/*` - новые функции
- `bugfix/*` - исправления багов

## 📄 Лицензия

MIT License

## 📚 Документация

### Основные руководства
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Деплой на Vercel
- **[CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)** - Деплой на Cloudflare Pages
- **[PLATFORM_COMPARISON.md](./PLATFORM_COMPARISON.md)** - Сравнение платформ

### Файлы конфигурации
- `next.config.js` - Конфигурация Next.js
- `tailwind.config.js` - Настройки Tailwind CSS
- `tsconfig.json` - Конфигурация TypeScript
- `supabase/config.toml` - Настройки Supabase
- `.eslintrc.json` - Правила ESLint
- `.prettierrc` - Настройки Prettier

## 🎯 Roadmap

### MVP ✅
- [x] Аутентификация пользователей
- [x] Создание типов событий
- [x] Базовое бронирование
- [x] Responsive дизайн
- [x] Деплой на Vercel/Cloudflare

### V1.0 🚧
- [ ] Календарная интеграция (Google Calendar)
- [ ] Email уведомления
- [ ] Видеоконференции (Zoom/Meet)
- [ ] Настройка профиля
- [ ] Управление доступностью

### V2.0 📋
- [ ] Командные события
- [ ] Платежи (Stripe)
- [ ] Аналитика и отчеты
- [ ] API для интеграций
- [ ] Мобильное приложение

## 🔧 Помощь и поддержка

### Частые проблемы

**❓ Ошибки сборки**
```bash
# Очистите кеш и переустановите зависимости
rm -rf node_modules package-lock.json .next
npm install
```

**❓ Проблемы с TypeScript**
```bash
# Проверьте типы
npm run type-check
```

**❓ Проблемы с Supabase**
- Проверьте переменные окружения
- Убедитесь, что миграции выполнены
- Проверьте RLS политики

### Поддержка

- 🐛 **Баги**: [GitHub Issues](../../issues)
- 💡 **Идеи**: [GitHub Discussions](../../discussions)
- 📧 **Прямая связь**: создайте Issue с меткой `question`

### Лицензия

MIT License - см. [LICENSE](./LICENSE) файл для деталей.

---

<div align="center">

**🚀 Готов к деплою за 5 минут!**

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/your-username/calendly-mvp)

**Сделано с ❤️ для разработчиков**

</div> 
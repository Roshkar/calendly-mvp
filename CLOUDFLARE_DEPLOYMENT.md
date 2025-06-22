# 🌐 Деплой на Cloudflare Pages

## 📖 Обзор

**Cloudflare Pages** - это платформа для хостинга статических сайтов и full-stack приложений с поддержкой serverless функций. Наш Next.js проект можно задеплоить на Cloudflare Pages двумя способами:

1. **Статический экспорт** (только фронтенд)
2. **Full-stack** с Cloudflare Pages Functions

## 🚀 Способы деплоя

### Способ 1: Статический экспорт (Рекомендуется для MVP)

Этот способ создает полностью статический сайт, который работает только на клиентской стороне.

#### ✅ Преимущества:
- Быстрая загрузка
- Глобальная CDN
- Бесплатный SSL
- Хорошая производительность

#### ❌ Ограничения:
- Нет серверных API routes
- Только клиентская аутентификация
- SEO ограничения для динамического контента

#### 🛠️ Настройка статического экспорта:

1. **Обновите `next.config.js`**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // ... остальная конфигурация
}
```

2. **Обновите скрипт сборки в `package.json`**:
```json
{
  "scripts": {
    "build:static": "next build",
    "build": "next build && next export"
  }
}
```

### Способ 2: Full-stack с Pages Functions

Поддерживает серверные функции через Cloudflare Workers.

#### ✅ Преимущества:
- Полная поддержка Next.js функций
- Серверные API routes
- SSR/SSG поддержка

#### ❌ Ограничения:
- Более сложная настройка
- Возможные ограничения по времени выполнения
- Требует адаптер для Next.js

## 📋 Пошаговая инструкция

### 1. Подготовка проекта

```bash
# Клонируйте проект
git clone <your-repo>
cd calendly-mvp

# Установите зависимости
npm install
```

### 2. Настройка Cloudflare

1. **Создайте аккаунт Cloudflare**:
   - Перейдите на [cloudflare.com](https://cloudflare.com)
   - Создайте аккаунт

2. **Получите API токен**:
   - Перейдите в My Profile → API Tokens
   - Создайте Custom token с правами:
     - Zone:Zone:Read
     - Zone:Page Rule:Edit
     - Account:Cloudflare Pages:Edit

3. **Найдите Account ID**:
   - В правой панели дашборда

### 3. Переменные окружения

#### Локальная разработка (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### GitHub Secrets:
```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Cloudflare Pages Environment Variables:
- Добавьте те же переменные в настройках проекта

### 4. Деплой

#### Автоматический деплой (через GitHub Actions):

1. **Загрузите код в GitHub**:
```bash
git add .
git commit -m "Configure for Cloudflare Pages"
git push origin main
```

2. **GitHub Actions автоматически**:
   - Соберет проект
   - Задеплоит на Cloudflare Pages
   - Создаст preview для PR

#### Ручной деплой:

1. **Через Cloudflare Dashboard**:
   - Pages → Create a project
   - Connect to Git → выберите репозиторий
   - Build settings:
     - Build command: `npm run build`
     - Build output directory: `out` (для статики) или `.next`
     - Root directory: `/`

2. **Через Wrangler CLI**:
```bash
# Установите Wrangler
npm install -g wrangler

# Войдите в аккаунт
wrangler login

# Деплой
wrangler pages publish out --project-name=calendly-mvp
```

## ⚙️ Конфигурационные файлы

### `wrangler.toml`
```toml
name = "calendly-mvp"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[pages]
build_output_dir = "out"
```

### `_headers`
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Content-Security-Policy: default-src 'self' https://*.supabase.co
```

### `_redirects`
```
/*    /index.html   200
/dashboard   /dashboard/event-types   302
```

## 🔧 Особенности для Cloudflare

### 1. Статические ресурсы
- Автоматически кешируются
- Доступны через CDN
- Оптимизация изображений (для Pages Functions)

### 2. Аутентификация
- Используйте только клиентскую аутентификацию Supabase
- JWT токены сохраняются в localStorage
- Redirect URLs: `https://your-project.pages.dev`

### 3. База данных
- Supabase работает без изменений
- Все запросы идут напрямую с клиента
- RLS политики обеспечивают безопасность

## 🚀 Производительность

### Cloudflare преимущества:
- **Глобальная CDN** - 200+ точек присутствия
- **HTTP/3 поддержка**
- **Brotli сжатие**
- **Автоматическая оптимизация**
- **DDoS защита**

### Оптимизации:
```javascript
// next.config.js
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  // Webpack оптимизации для Cloudflare
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}
```

## 🔍 Мониторинг

### Analytics:
- Cloudflare Web Analytics (встроенная)
- Real User Monitoring
- Core Web Vitals

### Логи:
```bash
# Просмотр логов Functions
wrangler pages deployment tail
```

## 🚨 Устранение проблем

### Частые ошибки:

1. **Build failures**:
   - Проверьте Node.js версию (18+)
   - Убедитесь в правильности build команды

2. **Environment Variables**:
   - Добавьте в Cloudflare Pages settings
   - Проверьте префикс `NEXT_PUBLIC_` для клиентских переменных

3. **Routing issues**:
   - Убедитесь в правильности `_redirects`
   - Для SPA используйте fallback на `index.html`

4. **Supabase connection**:
   - Проверьте CORS настройки в Supabase
   - Добавьте домен Pages в allowed origins

## 📊 Сравнение с Vercel

| Характеристика | Cloudflare Pages | Vercel |
|----------------|------------------|---------|
| **Цена** | Бесплатно до 500 билдов/месяц | Бесплатно до 100GB |
| **CDN** | 200+ точек | 100+ точек |
| **Build time** | До 20 минут | До 45 минут |
| **Functions** | Cloudflare Workers | Vercel Functions |
| **Cold start** | ~10ms | ~50ms |
| **Next.js support** | Ограниченная | Полная |

## 🎯 Рекомендации

### Для MVP проекта:
1. Используйте **статический экспорт**
2. Настройте автоматический деплой через GitHub Actions
3. Используйте Supabase для backend функций
4. Мониторьте производительность через Cloudflare Analytics

### Для продакшена:
1. Рассмотрите Pages Functions для серверной логики
2. Настройте custom домен
3. Включите DDoS защиту
4. Настройте proper caching headers

---

**Готово! 🎉** Ваш Calendly MVP теперь работает на Cloudflare Pages с глобальной CDN и отличной производительностью! 
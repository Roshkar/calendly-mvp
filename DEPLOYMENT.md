# 🚀 Инструкция по деплою Calendly MVP

## Обзор проекта

Проект представляет собой MVP приложения для планирования встреч, построенного на:
- **Frontend**: Next.js 14 с App Router
- **Backend**: Supabase (PostgreSQL + Auth)
- **Деплой**: Vercel с автоматическим CI/CD

## 📋 Чек-лист перед деплоем

### 1. Подготовка Supabase

1. **Создайте проект в Supabase**:
   - Перейдите на [supabase.com](https://supabase.com)
   - Создайте новый проект
   - Запишите `Project URL` и `anon public key`

2. **Выполните миграции**:
   ```bash
   # Установите Supabase CLI
   npm install -g supabase
   
   # Войдите в аккаунт
   supabase login
   
   # Свяжите с проектом
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Выполните миграции
   supabase db push
   ```

3. **Настройте RLS политики** (они уже включены в миграцию)

### 2. Подготовка Vercel

1. **Создайте аккаунт на Vercel**:
   - Перейдите на [vercel.com](https://vercel.com)
   - Зарегистрируйтесь через GitHub

2. **Получите токены**:
   - Vercel Token: Настройки → Tokens
   - Org ID и Project ID: после создания проекта

### 3. Переменные окружения

Настройте следующие переменные:

**Для локальной разработки (.env.local)**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Для Vercel**:
- Добавьте те же переменные в настройках проекта Vercel

**Для GitHub Actions (GitHub Secrets)**:
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 Способы деплоя

### Способ 1: Автоматический деплой через GitHub Actions (Рекомендуется)

1. **Загрузите код в GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/calendly-mvp.git
   git push -u origin main
   ```

2. **Настройте GitHub Secrets**:
   - Перейдите в Settings → Secrets and variables → Actions
   - Добавьте все необходимые секреты

3. **Создайте проект в Vercel**:
   - Импортируйте репозиторий из GitHub
   - Добавьте переменные окружения
   - Отключите автоматический деплой (будет происходить через Actions)

4. **Деплой произойдет автоматически** при пуше в main ветку

### Способ 2: Деплой через Vercel CLI

1. **Установите Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Войдите в аккаунт**:
   ```bash
   vercel login
   ```

3. **Настройте проект**:
   ```bash
   vercel
   # Следуйте инструкциям на экране
   ```

4. **Деплой в продакшн**:
   ```bash
   vercel --prod
   ```

### Способ 3: Деплой через Vercel Dashboard

1. **Подключите GitHub репозиторий**:
   - Перейдите в Vercel Dashboard
   - Нажмите "Import Project"
   - Выберите GitHub репозиторий

2. **Настройте сборку**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Добавьте переменные окружения**

4. **Деплой произойдет автоматически**

## 🛠️ Настройка CI/CD

### GitHub Actions

CI/CD настроен автоматически через `.github/workflows/ci-cd.yml`:

- **Линтинг и проверка типов** для каждого PR
- **Автоматическая сборка** проекта
- **Preview деплой** для Pull Request'ов
- **Production деплой** при пуше в main

### Ветвление

- `main` - продакшн ветка
- `develop` - ветка разработки
- `feature/*` - ветки для новых функций

## 🔍 Проверка деплоя

После деплоя проверьте:

1. **Доступность сайта** - откройте URL
2. **Регистрация** - создайте тестовый аккаунт
3. **Аутентификация** - войдите в систему
4. **База данных** - проверьте, что данные сохраняются
5. **Responsive design** - протестируйте на разных устройствах

## 🚨 Возможные проблемы

### Ошибки сборки

1. **TypeScript ошибки**:
   ```bash
   npm run type-check
   ```

2. **ESLint ошибки**:
   ```bash
   npm run lint:fix
   ```

3. **Проблемы с зависимостями**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Проблемы с Supabase

1. **Проверьте URL и ключи**
2. **Убедитесь, что миграции выполнены**
3. **Проверьте RLS политики**

### Проблемы с Vercel

1. **Проверьте переменные окружения**
2. **Убедитесь, что все секреты настроены**
3. **Проверьте логи деплоя**

## 📊 Мониторинг

### Vercel Analytics
- Встроена автоматически
- Отслеживает производительность
- Показывает Core Web Vitals

### Supabase Monitoring
- Доступно в Supabase Dashboard
- Мониторинг запросов к БД
- Статистика аутентификации

## 🔄 Обновления

### Автоматические обновления зависимостей
Настроен GitHub Action для еженедельного обновления зависимостей.

### Ручные обновления
```bash
npm update
npm audit fix
```

## 📝 Дополнительные настройки

### Custom Domain (опционально)
1. Купите домен
2. Добавьте в Vercel: Settings → Domains
3. Настройте DNS записи

### SSL Certificate
- Автоматически предоставляется Vercel
- Поддержка HTTPS из коробки

### CDN
- Vercel автоматически использует глобальную CDN
- Кеширование статических файлов

## 🎯 Следующие шаги

После успешного деплоя рассмотрите:

1. **Добавление аналитики** (Google Analytics, Mixpanel)
2. **Настройка мониторинга ошибок** (Sentry)
3. **Добавление тестов** (Jest, Playwright)
4. **Оптимизация производительности**
5. **SEO оптимизация**

---

**Поздравляем! 🎉** Ваш Calendly MVP готов к использованию! 
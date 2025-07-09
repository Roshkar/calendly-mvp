# 🔐 Настройка GitHub Secrets для деплоя

## Проблема с деплоем

Деплой не работает из-за отсутствия необходимых секретов в GitHub репозитории.

## 🚀 Необходимые секреты

Перейдите в **Settings** → **Secrets and variables** → **Actions** вашего GitHub репозитория и добавьте следующие секреты:

### 1. Vercel секреты

#### `VERCEL_TOKEN`
- Перейдите на [vercel.com/account/tokens](https://vercel.com/account/tokens)
- Создайте новый токен с именем "GitHub Deploy"
- Скопируйте токен и добавьте в GitHub Secrets

#### `VERCEL_ORG_ID`
- Перейдите на [vercel.com/account](https://vercel.com/account)
- Найдите "Team ID" (это ваш ORG_ID)
- Скопируйте и добавьте в GitHub Secrets

#### `VERCEL_PROJECT_ID`
- Перейдите к вашему проекту на Vercel
- Перейдите в Settings → General
- Найдите "Project ID"
- Скопируйте и добавьте в GitHub Secrets

### 2. Supabase секреты

#### `NEXT_PUBLIC_SUPABASE_URL`
- Ваш Supabase URL (начинается с `https://`)
- Найдите в Supabase Dashboard → Project Settings → API

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ваш Supabase Anon Key
- Найдите в Supabase Dashboard → Project Settings → API

## 📋 Пошаговая инструкция

### Шаг 1: Создание Vercel проекта
```bash
# Если проект еще не создан на Vercel
npx vercel
# Следуйте инструкциям для создания проекта
```

### Шаг 2: Получение Vercel данных
```bash
# Получить Project ID и Org ID
npx vercel env ls
```

### Шаг 3: Добавление секретов в GitHub
1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. Добавьте каждый секрет из списка выше

### Шаг 4: Проверка деплоя
После добавления всех секретов:
```bash
git add .
git commit -m "fix: добавлены файлы конфигурации для деплоя"
git push origin main
```

## 🔧 Альтернативные способы деплоя

### Вариант 1: Ручной деплой через Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Вариант 2: Деплой через Vercel Dashboard
1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Подключите GitHub репозиторий
4. Настройте переменные окружения
5. Нажмите "Deploy"

### Вариант 3: Netlify (альтернатива)
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=out
```

## 🐛 Отладка проблем

### Проверка локальной сборки
```bash
npm run build
# Должна пройти без ошибок
```

### Проверка переменных окружения
Создайте `.env.local` для локального тестирования:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Проверка GitHub Actions
1. Перейдите в **Actions** на GitHub
2. Найдите последний запуск
3. Проверьте логи ошибок

## 📞 Поддержка

Если проблемы продолжаются:
1. Проверьте логи в GitHub Actions
2. Убедитесь что все секреты добавлены правильно
3. Проверьте что локальная сборка работает

## 🔄 Статус деплоя

После настройки секретов деплой будет происходить автоматически при каждом пуше в `main` ветку. 
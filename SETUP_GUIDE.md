# 🚀 Руководство по настройке Calendly MVP

## ❌ Проблема: События не создаются

### 🔍 Диагностика проблем

Я обнаружил несколько критических проблем в вашей настройке:

1. **❌ Node.js не установлен** - `npm` и `node` команды не работают
2. **❌ Отсутствует .env.local** - нет переменных окружения Supabase
3. **❌ Проект не запускается** - без Node.js невозможно запустить Next.js

## 🛠️ Пошаговое решение

### Шаг 1: Установите Node.js

1. **Скачайте Node.js**: https://nodejs.org/
2. **Выберите версию**: LTS (рекомендуется)
3. **Установите** и перезапустите терминал
4. **Проверьте установку**:
   ```bash
   node --version
   npm --version
   ```

### Шаг 2: Создайте .env.local файл

В корне проекта создайте файл `.env.local` с содержимым:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### Шаг 3: Получите ключи Supabase

1. Перейдите на https://supabase.com/dashboard
2. Выберите/создайте проект
3. Перейдите в **Settings** → **API**
4. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### Шаг 4: Установите зависимости

```bash
npm install
```

### Шаг 5: Настройте базу данных

Если используете локальный Supabase:
```bash
npx supabase start
npx supabase db reset
```

Если используете облачный Supabase:
- Убедитесь, что миграции применены
- Проверьте RLS политики

### Шаг 6: Запустите проект

```bash
npm run dev
```

## 🧪 Тестирование

После настройки:

1. **Откройте**: http://localhost:3000
2. **Войдите в систему**: `/login`
3. **Перейдите к событиям**: `/dashboard/event-types`
4. **Создайте событие**
5. **Проверьте диагностику**: `/dashboard/test-connection`

## 🔧 Альтернативное решение (без Node.js)

Если не можете установить Node.js локально:

### Вариант 1: Используйте Vercel напрямую

1. Загрузите проект на GitHub
2. Подключите к Vercel
3. Добавьте переменные окружения в Vercel Dashboard
4. Тестируйте на production URL

### Вариант 2: Используйте Codespaces/CodeSandbox

1. Откройте проект в GitHub Codespaces
2. Или импортируйте в CodeSandbox
3. Настройте переменные окружения
4. Тестируйте в облачной среде

## 📝 Проверочный список

- [ ] Node.js установлен (`node --version` работает)
- [ ] npm работает (`npm --version` показывает версию)
- [ ] Создан файл `.env.local`
- [ ] Добавлены правильные ключи Supabase
- [ ] Зависимости установлены (`npm install`)
- [ ] Проект запускается (`npm run dev`)
- [ ] Аутентификация работает
- [ ] База данных доступна

## ⚠️ Частые ошибки

### "Module not found: Can't resolve 'react'"
**Причина**: Не установлены зависимости
**Решение**: `npm install`

### "Invalid API key" / "Unauthorized"
**Причина**: Неправильные ключи Supabase
**Решение**: Проверьте `.env.local`

### "Table 'event_types' doesn't exist"
**Причина**: Миграции не применены
**Решение**: Примените миграции в Supabase Dashboard

### "User not authenticated"
**Причина**: Не выполнен вход
**Решение**: Перейдите на `/login`

## 🆘 Если ничего не помогает

1. **Проверьте консоль браузера** на ошибки
2. **Откройте Network tab** и посмотрите неудачные запросы
3. **Используйте диагностику**: `/dashboard/test-connection`
4. **Проверьте Supabase logs** в Dashboard

## 📞 Дополнительная помощь

Если проблемы продолжаются, предоставьте:

1. **Версию Node.js**: `node --version`
2. **Ошибки из консоли браузера**
3. **Скриншот страницы создания событий**
4. **Результат диагностики** с `/dashboard/test-connection`

---

*Создано для решения проблем с созданием событий в Calendly MVP* 
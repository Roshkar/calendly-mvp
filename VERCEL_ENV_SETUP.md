# 🔧 Настройка переменных окружения в Vercel

Полное руководство по настройке всех необходимых переменных окружения для Calendly MVP.

## 📋 Список переменных

### 🗄️ Supabase (обязательно)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 🤖 Telegram Auth (опционально)
```env
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
```

## 🚀 Настройка в Vercel

### 1. Откройте Vercel Dashboard
1. Перейдите к вашему проекту `calendly-mvp`
2. Нажмите **Settings**
3. Выберите **Environment Variables**

### 2. Добавьте переменные Supabase

#### NEXT_PUBLIC_SUPABASE_URL
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://your-project-id.supabase.co`
- **Environment**: Production, Preview, Development

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ваш anon key)
- **Environment**: Production, Preview, Development

#### SUPABASE_SERVICE_ROLE_KEY
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ваш service role key)
- **Environment**: Production, Preview, Development

### 3. Добавьте переменные Telegram (если используете)

#### NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
- **Name**: `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
- **Value**: `calendly_mvp_auth_bot` (имя вашего бота БЕЗ @)
- **Environment**: Production, Preview, Development

#### TELEGRAM_BOT_TOKEN (НОВАЯ!)
- **Name**: `TELEGRAM_BOT_TOKEN`
- **Value**: `7899407653:AAGZYsBYM9ggbIBlH-Y7eUsLu2sv6l8sMDg` (токен от @BotFather)
- **Environment**: Production, Preview, Development

## 🔐 Зачем нужен TELEGRAM_BOT_TOKEN?

### Без токена (текущая реализация):
- ✅ Базовая проверка на клиенте
- ⚠️ Можно подделать данные
- ⚠️ Менее безопасно

### С токеном (улучшенная безопасность):
- ✅ Серверная криптографическая верификация
- ✅ Невозможно подделать данные
- ✅ Полная безопасность

## 🛡️ Как работает верификация с токеном:

1. **Клиент** получает данные от Telegram
2. **Сервер** проверяет подпись с помощью bot token
3. **Криптографическая проверка** HMAC-SHA256
4. **Результат**: 100% достоверность данных

## 📝 Где взять значения:

### Supabase:
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. **Settings** → **API**
4. Скопируйте:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

### Telegram:
1. Откройте @BotFather в Telegram
2. Создайте бота: `/newbot`
3. Получите:
   - Username (без @) → `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
   - Token → `TELEGRAM_BOT_TOKEN`
4. Настройте домен: `/setdomain` → `calendly-mvp.vercel.app`

## 🧪 Тестирование настроек

### Проверка Supabase:
```bash
# Откройте:
https://calendly-mvp.vercel.app/dashboard/test-connection
```

### Проверка Telegram:
```bash
# Откройте:
https://calendly-mvp.vercel.app/test-telegram
# Нажмите: 🔐 Bot Token
```

## ⚡ После добавления переменных:

1. **Сохраните** все переменные
2. **Redeploy** проект в Vercel:
   - Deployments → последний деплой → Redeploy
3. **Подождите** 2-3 минуты
4. **Тестируйте** приложение

## 🚨 Безопасность:

### ✅ Публичные переменные (NEXT_PUBLIC_*):
- Видны в браузере
- Можно использовать на клиенте
- Не содержат секретов

### 🔒 Серверные переменные:
- `SUPABASE_SERVICE_ROLE_KEY` - только на сервере
- `TELEGRAM_BOT_TOKEN` - только на сервере
- Никогда не попадают в браузер

## 🎯 Результат:

После правильной настройки:
- ✅ Supabase подключение работает
- ✅ Telegram авторизация работает
- ✅ Серверная верификация активна
- ✅ Максимальная безопасность

## 💡 Troubleshooting:

### Проблема: "Supabase connection failed"
- Проверьте URL и ключи Supabase
- Убедитесь что проект активен

### Проблема: "Telegram bot not configured"
- Добавьте `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
- Проверьте что бот создан в @BotFather

### Проблема: "Server verification unavailable"
- Добавьте `TELEGRAM_BOT_TOKEN`
- Сделайте редеплой

---

**✅ После настройки всех переменных ваше приложение будет полностью функциональным и безопасным!** 
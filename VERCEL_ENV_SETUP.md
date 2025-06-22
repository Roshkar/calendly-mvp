# 🌐 Настройка переменных окружения в Vercel

## Для Telegram авторизации

### 1. Зайдите в настройки проекта Vercel

1. Откройте https://vercel.com/dashboard
2. Выберите ваш проект `calendly-mvp`
3. Перейдите в **Settings** → **Environment Variables**

### 2. Добавьте переменные

Добавьте следующие переменные:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | `ваш_бот_username` | Production, Preview, Development |
| `TELEGRAM_BOT_TOKEN` | `ваш_бот_токен` | Production, Preview, Development |

**Важно**: 
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` должен быть БЕЗ символа @
- Например: `calendly_mvp_auth_bot`

### 3. Передеплойте проект

После добавления переменных:
1. Перейдите в **Deployments**
2. Нажмите **Redeploy** на последнем деплое
3. Или сделайте новый push в GitHub

### 4. Проверьте работу

1. Откройте `/test-telegram` на вашем сайте
2. Нажмите "Проверить переменные"
3. Убедитесь, что переменная отображается корректно

## Пример настройки бота

### Создание бота через @BotFather:

```
/newbot
Имя: Calendly MVP Auth Bot
Username: calendly_mvp_auth_bot
```

### Настройка домена:

```
/setdomain
Выберите бота: @calendly_mvp_auth_bot
Домен: calendly-mvp.vercel.app
```

## Результат

После правильной настройки:
- ✅ На странице `/login` появится синяя кнопка Telegram
- ✅ На странице `/test-telegram` будет показана переменная
- ✅ Клик по кнопке откроет Telegram для авторизации

## Отладка

Если не работает:
1. Проверьте переменные на `/test-telegram`
2. Откройте консоль браузера (F12)
3. Ищите ошибки JavaScript
4. Убедитесь, что бот создан и домен настроен 
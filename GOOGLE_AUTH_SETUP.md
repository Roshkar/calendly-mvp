# 🔐 Настройка Google авторизации в Supabase

Пошаговое руководство по настройке Google OAuth для вашего Calendly MVP приложения.

## 📋 Обзор

Google авторизация позволяет пользователям входить в ваше приложение используя их Google аккаунт. Это безопасно, удобно и не требует от пользователей создания нового пароля.

## 🚀 Шаг 1: Настройка Google Cloud Console

### 1.1 Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Нажмите **"Select a project"** → **"New Project"**
3. Введите название проекта: `Calendly MVP`
4. Нажмите **"Create"**

### 1.2 Включение Google+ API

1. В боковом меню выберите **"APIs & Services"** → **"Library"**
2. Найдите **"Google+ API"**
3. Нажмите **"Enable"**

### 1.3 Настройка OAuth consent screen

1. Перейдите в **"APIs & Services"** → **"OAuth consent screen"**
2. Выберите **"External"** → **"Create"**
3. Заполните обязательные поля:
   - **App name**: `Calendly MVP`
   - **User support email**: ваш email
   - **Developer contact information**: ваш email
4. Нажмите **"Save and Continue"**
5. На странице **"Scopes"** нажмите **"Save and Continue"**
6. На странице **"Test users"** добавьте ваш email для тестирования
7. Нажмите **"Save and Continue"**

### 1.4 Создание OAuth 2.0 Client ID

1. Перейдите в **"APIs & Services"** → **"Credentials"**
2. Нажмите **"+ Create Credentials"** → **"OAuth client ID"**
3. Выберите **"Web application"**
4. Введите название: `Calendly MVP Web Client`
5. Добавьте **Authorized redirect URIs**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   ⚠️ **Важно**: Замените `your-project-ref` на ваш реальный Supabase project reference
6. Нажмите **"Create"**
7. **Сохраните** Client ID и Client Secret - они понадобятся для Supabase

## 🔧 Шаг 2: Настройка Supabase

### 2.1 Включение Google Provider

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **"Authentication"** → **"Providers"**
4. Найдите **"Google"** и нажмите на него
5. Включите **"Enable sign in with Google"**

### 2.2 Настройка Client ID и Secret

1. Вставьте **Client ID** из Google Cloud Console
2. Вставьте **Client Secret** из Google Cloud Console
3. Нажмите **"Save"**

### 2.3 Получение Redirect URL

1. В настройках Google provider скопируйте **"Redirect URL"**
2. Это будет что-то вроде: `https://your-project-ref.supabase.co/auth/v1/callback`

## 🌐 Шаг 3: Обновление Google Cloud Console

### 3.1 Добавление Redirect URL

1. Вернитесь в Google Cloud Console
2. Перейдите в **"APIs & Services"** → **"Credentials"**
3. Нажмите на ваш OAuth 2.0 Client ID
4. В **"Authorized redirect URIs"** добавьте URL из Supabase:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
5. Нажмите **"Save"**

## 🔄 Шаг 4: Тестирование

### 4.1 Локальное тестирование

1. Добавьте для локального тестирования:
   ```
   http://localhost:3000
   ```
   в **"Authorized JavaScript origins"** в Google Cloud Console

### 4.2 Production тестирование

1. Добавьте ваш production домен:
   ```
   https://calendly-mvp.vercel.app
   ```
   в **"Authorized JavaScript origins"**

## ✅ Шаг 5: Проверка настройки

### 5.1 Проверка в Supabase

1. В Supabase Dashboard → Authentication → Providers
2. Google должен быть **включен** и **настроен**
3. Статус должен показывать ✅

### 5.2 Тестирование авторизации

1. Откройте ваше приложение
2. Перейдите на страницу логина
3. Нажмите **"Войти через Google"**
4. Должно открыться окно Google авторизации
5. После успешной авторизации вы должны попасть в dashboard

## 🛠️ Troubleshooting

### Ошибка: "redirect_uri_mismatch"

**Причина**: Redirect URI в Google Cloud Console не совпадает с Supabase

**Решение**:
1. Проверьте Redirect URL в Supabase Dashboard
2. Убедитесь что он точно добавлен в Google Cloud Console
3. Не должно быть лишних слешей или пробелов

### Ошибка: "invalid_client"

**Причина**: Неправильный Client ID или Secret

**Решение**:
1. Проверьте Client ID и Secret в Google Cloud Console
2. Убедитесь что они правильно скопированы в Supabase
3. Пересоздайте credentials если нужно

### Ошибка: "access_denied"

**Причина**: Пользователь не добавлен в test users или app не опубликован

**Решение**:
1. Добавьте email пользователя в Test users в Google Cloud Console
2. Или опубликуйте приложение (для production)

## 🔒 Безопасность

### Рекомендации

1. **Никогда не коммитьте** Client Secret в git
2. **Используйте HTTPS** для production
3. **Регулярно ротируйте** credentials
4. **Ограничьте scope** до минимально необходимого

### Переменные окружения

Хотя Client ID и Secret настраиваются в Supabase Dashboard, вы можете также использовать переменные окружения:

```env
# Не обязательно, если настроено в Supabase Dashboard
SUPABASE_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📚 Дополнительные ресурсы

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## 🎉 Готово!

После выполнения всех шагов ваши пользователи смогут:

- ✅ Регистрироваться через Google
- ✅ Входить через Google  
- ✅ Автоматически создавать профиль
- ✅ Безопасно использовать приложение

Google авторизация значительно упрощает процесс регистрации и повышает конверсию пользователей! 🚀 
# 🔧 Исправление ошибки базы данных

## ❌ Проблема
Ошибка: `relation "public.event_types" does not exist`

Это означает, что таблицы не были созданы в вашей Supabase базе данных.

## ✅ Решение

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на https://supabase.com
2. Войдите в свой аккаунт
3. Выберите ваш проект

### Шаг 2: Откройте SQL Editor
1. В левом меню нажмите **SQL Editor**
2. Нажмите **New Query**

### Шаг 3: Выполните SQL скрипт
1. Скопируйте весь код из файла `MANUAL_DATABASE_SETUP.sql`
2. Вставьте в SQL Editor
3. Нажмите **Run** (зеленая кнопка)

### Шаг 4: Проверьте результат
После выполнения вы должны увидеть:
- Сообщение "Tables created successfully!"
- Список созданных таблиц

### Шаг 5: Проверьте таблицы
1. В левом меню нажмите **Table Editor**
2. Убедитесь, что созданы таблицы:
   - `profiles`
   - `event_types`
   - `availabilities`
   - `bookings`

## 🚀 После выполнения
Ваше приложение должно заработать! Попробуйте:
1. Зайти в приложение
2. Создать новое событие
3. Проверить список событий

## 🔍 Если проблемы остались
1. Проверьте переменные окружения в Vercel
2. Убедитесь, что используете правильные URL и ключи Supabase
3. Проверьте, что RLS политики настроены правильно

## 📞 Альтернативное решение
Если SQL скрипт не работает, можете создать таблицы вручную:

### Создайте таблицу profiles:
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Создайте таблицу event_types:
```sql
CREATE TABLE public.event_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    color VARCHAR(7) DEFAULT '#3174ad',
    is_active BOOLEAN DEFAULT true,
    location_type VARCHAR(20) DEFAULT 'online',
    location_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, slug)
);
```

### Включите RLS:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
```

### Создайте политики:
```sql
CREATE POLICY "Users can manage own event types" ON public.event_types
    FOR ALL USING (auth.uid() = user_id);
```

## ✅ Готово!
После выполнения всех шагов ваше приложение должно работать корректно. 
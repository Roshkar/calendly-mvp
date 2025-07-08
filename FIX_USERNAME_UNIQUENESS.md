# Fix Username Uniqueness Issue

## Проблема

При регистрации нового пользователя возникала ошибка:

```
duplicate key value violates unique constraint "profiles_username_key"
```

## Причина

Функция `handle_new_user()` генерировала `username` из первой части email (до @), что приводило к конфликтам:
- `john@gmail.com` → `username = "john"`
- `john@yahoo.com` → `username = "john"` ← Конфликт!

## Решение

Создана новая миграция `20240105000000_fix_username_uniqueness.sql` которая:

### 1. Исправляет функцию `handle_new_user()`

```sql
-- Улучшенная логика генерации уникального username:
1. Получает базовое имя из metadata или email
2. Санитизирует username (удаляет спец. символы)
3. Проверяет уникальность в цикле
4. Добавляет счетчик если нужно: john → john_1 → john_2
5. Если все попытки исчерпаны, использует UUID суффикс
```

### 2. Добавляет поле `onboarding_completed`

```sql
-- Добавляет поле для онбординга
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
```

### 3. Обновляет функцию создания профиля

```sql
-- Новые пользователи получают onboarding_completed = FALSE
INSERT INTO public.profiles (id, username, first_name, last_name, avatar_url, onboarding_completed)
VALUES (NEW.id, final_username, ..., FALSE);
```

## Алгоритм генерации уникального username

```
1. Базовое имя: 
   - Из raw_user_meta_data->>'username' ИЛИ
   - Из split_part(email, '@', 1)

2. Санитизация:
   - Удаление спец. символов: только [a-zA-Z0-9_]
   - Обрезание до 40 символов
   - Fallback на 'user' если пусто

3. Проверка уникальности:
   - Попытка 1: "john"
   - Попытка 2: "john_1"  
   - Попытка 3: "john_2"
   - ...
   - Попытка 100: "john_100"
   - Fallback: "john_a1b2c3d4" (UUID суффикс)
```

## Примеры работы

| Email | Существующие username | Результат |
|-------|----------------------|-----------|
| john@gmail.com | - | `john` |
| john@yahoo.com | `john` | `john_1` |
| jane@company.com | `john`, `john_1` | `jane` |
| another@john.com | `john`, `john_1`, `jane` | `another` |

## Применение миграции

### Для локальной разработки:
```bash
supabase db push
```

### Для продакшена:
```bash
supabase db push --link-reference main
```

## Тестирование

После применения миграции попробуйте:

1. **Зарегистрировать нового пользователя** с email `test@gmail.com`
2. **Зарегистрировать еще одного** с email `test@yahoo.com`
3. **Проверить** что username'ы уникальны: `test` и `test_1`

## Rollback (если нужно)

Если возникнут проблемы, можно откатить изменения:

```sql
-- Откат функции к предыдущей версии
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, first_name, last_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Безопасность

- Функция помечена как `SECURITY DEFINER` для безопасного выполнения
- Санитизация входных данных предотвращает SQL injection
- Максимальное количество попыток предотвращает бесконечные циклы
- UUID fallback обеспечивает гарантированную уникальность

## Статус

- ✅ **Миграция создана**: `20240105000000_fix_username_uniqueness.sql`
- ✅ **Функция обновлена**: Уникальная генерация username
- ✅ **Поле добавлено**: `onboarding_completed` в profiles
- ✅ **Rollback готов**: Инструкции по откату
- ⏳ **Нужно применить**: Миграцию в продакшене

Теперь регистрация новых пользователей должна работать без ошибок уникальности username! 
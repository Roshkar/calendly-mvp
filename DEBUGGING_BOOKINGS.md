# 🔍 Диагностика бронирований

## Проблема: Не видны бронирования анонимных пользователей

Если анонимные пользователи создают бронирования, но владелец события их не видит в дашборде, следуйте этому руководству.

## 🚀 Быстрое решение

### 1. Проверьте новую страницу бронирований
- Перейдите в дашборд: `https://calendly-mvp.vercel.app/dashboard`
- Нажмите на **"Бронирования"** в навигации
- Или перейдите напрямую: `https://calendly-mvp.vercel.app/dashboard/bookings`

### 2. Используйте тестовую страницу
- Перейдите: `https://calendly-mvp.vercel.app/dashboard/test-bookings`
- Нажмите **"Создать тестовое бронирование"**
- Затем **"Загрузить бронирования"**

## 🔧 Диагностика проблем

### Шаг 1: Проверка создания бронирований

```bash
# Проверьте в консоли браузера на странице бронирования
# Должны быть логи типа:
✅ Бронирование создано успешно!
📋 Данные: {...}
```

### Шаг 2: Проверка Row Level Security (RLS)

Политики базы данных должны быть:

```sql
-- Анонимные пользователи могут создавать бронирования
CREATE POLICY "Anyone can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Владельцы событий могут видеть бронирования
CREATE POLICY "Users can view bookings for their events" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.event_types 
            WHERE id = bookings.event_type_id 
            AND user_id = auth.uid()
        )
    );

-- Владельцы могут обновлять бронирования (отменять)
CREATE POLICY "Users can update bookings for their events" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.event_types 
            WHERE id = bookings.event_type_id 
            AND user_id = auth.uid()
        )
    );
```

### Шаг 3: Проверка запроса

Запрос для загрузки бронирований:

```javascript
const { data: bookings, error } = await supabase
  .from('bookings')
  .select(`
    *,
    event_types!inner (
      id,
      name,
      duration_minutes,
      location_type,
      location_details,
      user_id
    )
  `)
  .eq('event_types.user_id', user.id)
  .order('start_time', { ascending: false })
```

## 📊 Структура данных

### Таблица bookings
```sql
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type_id UUID REFERENCES public.event_types(id),
    invitee_email VARCHAR(255) NOT NULL,
    invitee_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Пример данных бронирования
```json
{
  "id": "uuid",
  "event_type_id": "uuid",
  "invitee_name": "Иван Иванов",
  "invitee_email": "ivan@example.com",
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": "2024-01-15T10:30:00Z",
  "timezone": "Europe/Moscow",
  "status": "confirmed",
  "event_types": {
    "name": "Консультация",
    "duration_minutes": 30
  }
}
```

## 🎯 Возможные проблемы и решения

### 1. Бронирования не создаются
**Симптомы**: Ошибка при отправке формы бронирования

**Решения**:
- Проверьте политику `"Anyone can create bookings"`
- Убедитесь, что `event_type_id` корректный
- Проверьте формат дат (`ISO 8601`)

### 2. Бронирования создаются, но не видны
**Симптомы**: Форма работает, но в дашборде пусто

**Решения**:
- Проверьте политику `"Users can view bookings for their events"`
- Убедитесь, что пользователь авторизован
- Проверьте JOIN с таблицей `event_types`

### 3. Ошибка доступа к данным
**Симптомы**: `RLS policy violation` или `permission denied`

**Решения**:
- Примените миграцию `20240103000000_add_booking_update_policy.sql`
- Проверьте, что RLS включен: `ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;`

## 🧪 Тестирование

### Создание тестового бронирования
1. Откройте `/dashboard/test-bookings`
2. Нажмите "Создать тестовое бронирование"
3. Проверьте результат в консоли

### Проверка в базе данных
```sql
-- Количество бронирований
SELECT COUNT(*) FROM bookings;

-- Бронирования с деталями событий
SELECT 
    b.invitee_name,
    b.invitee_email,
    b.start_time,
    et.name as event_name,
    p.username as owner
FROM bookings b
JOIN event_types et ON b.event_type_id = et.id
JOIN profiles p ON et.user_id = p.id;
```

## 📋 Чек-лист

- [ ] Страница `/dashboard/bookings` доступна
- [ ] В навигации есть ссылка "Бронирования"
- [ ] Тестовое бронирование создается успешно
- [ ] Бронирования отображаются в списке
- [ ] Можно отменить бронирование
- [ ] RLS политики настроены корректно

## 🔗 Полезные ссылки

- **Страница бронирований**: `/dashboard/bookings`
- **Тест бронирований**: `/dashboard/test-bookings`  
- **Тест подключения**: `/dashboard/test-connection`
- **Создание события**: `/dashboard/event-types/new`

## 💡 Дополнительные возможности

### Фильтрация бронирований
```javascript
// По статусу
.eq('status', 'confirmed')

// За определенный период
.gte('start_time', '2024-01-01')
.lte('start_time', '2024-01-31')
```

### Статистика
```javascript
const stats = {
  total: bookings.length,
  confirmed: bookings.filter(b => b.status === 'confirmed').length,
  pending: bookings.filter(b => b.status === 'pending').length,
  cancelled: bookings.filter(b => b.status === 'cancelled').length
}
```

---

**💡 Если проблема не решена**, создайте Issue в GitHub с подробным описанием и скриншотами консоли браузера. 
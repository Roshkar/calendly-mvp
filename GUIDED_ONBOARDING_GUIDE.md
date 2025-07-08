# Guided Onboarding - Онбординг с подсветкой элементов

## Описание

Система интерактивного онбординга для новых пользователей с подсветкой элементов интерфейса и автоматической навигацией между страницами дашборда.

## Возможности

### 🎯 Основные функции

- **Автоматическое определение первого логина** пользователя
- **Подсветка элементов** с эффектом spotlight
- **Автоматическая навигация** между страницами дашборда
- **Адаптивные тултипы** с умным позиционированием
- **Автовоспроизведение** тура с возможностью паузы
- **Прогресс-бар** и контроль навигации
- **Сохранение состояния** в базе данных и localStorage

### 📱 Интерактивные элементы

- Кнопки навигации (Назад/Далее)
- Кнопка пропуска тура
- Автовоспроизведение с паузой (4 секунды на шаг)
- Кнопка сброса для разработчиков

## Архитектура

### Компоненты

```
src/
├── hooks/
│   └── useFirstLogin.ts          # Хук для определения первого логина
├── components/ui/
│   └── guided-onboarding.tsx     # Главный компонент онбординга
└── app/dashboard/
    └── layout.tsx                # Интеграция в layout дашборда
```

### База данных

```sql
-- Поле в таблице profiles
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
```

## Маршрут тура

Тур включает 12 шагов на 5 страницах:

### 1. Dashboard (`/dashboard`) - 3 шага
- Приветствие и общее описание
- Кнопка создания события
- Карточки статистики

### 2. События (`/dashboard/event-types`) - 2 шага  
- Страница управления событиями
- Кнопка создания нового события

### 3. Бронирования (`/dashboard/bookings`) - 2 шага
- Страница управления встречами
- Область списка бронирований

### 4. Доступность (`/dashboard/availability`) - 2 шага
- Страница настройки доступности
- Настройки рабочих часов

### 5. Настройки (`/dashboard/settings`) - 2 шага
- Страница настроек профиля
- Форма редактирования профиля

### 6. Возврат на Dashboard - 1 шаг
- Завершение тура с призывом к действию

## Использование

### Автоматический запуск

Онбординг автоматически запускается для новых пользователей при первом входе в дашборд:

```tsx
// В layout дашборда
const { isFirstLogin, isLoading, markOnboardingCompleted } = useFirstLogin()

{!isLoading && isFirstLogin && (
  <GuidedOnboarding
    onComplete={markOnboardingCompleted}
    onSkip={markOnboardingCompleted}
  />
)}
```

### Ручной сброс (для разработки)

В режиме разработки доступна кнопка сброса в header:

```tsx
{process.env.NODE_ENV === 'development' && (
  <button onClick={resetOnboarding}>
    🔄 Сброс
  </button>
)}
```

## Конфигурация

### Добавление новых шагов

Редактируйте массив `tourSteps` в `guided-onboarding.tsx`:

```tsx
const tourSteps: TourStep[] = [
  {
    id: 'unique-step-id',
    title: 'Заголовок шага',
    description: 'Описание что делает элемент',
    target: 'CSS-селектор', // например: 'h1', '.class', '#id'
    page: '/dashboard/page',  // путь к странице
    position: 'bottom',       // 'top' | 'bottom' | 'left' | 'right'
    showNavigation: true      // показывать ли переход между страницами
  }
]
```

### Настройка CSS селекторов

Используйте специфичные селекторы для надежного поиска элементов:

```tsx
// Хорошо
target: 'a[href="/dashboard/event-types/new"]'
target: '.grid.grid-cols-1.md\\:grid-cols-3'

// Плохо (слишком общие)
target: 'div'
target: 'button'
```

### Тайминги автовоспроизведения

Измените интервал в `useEffect`:

```tsx
}, 4000) // 4 секунды на шаг - можно изменить
```

## API хука useFirstLogin

### Возвращаемые значения

```tsx
const {
  isFirstLogin,           // boolean | null - первый ли это логин
  isLoading,             // boolean - загружается ли проверка
  markOnboardingCompleted, // () => Promise<void> - отметить как завершенный
  resetOnboarding,       // () => Promise<void> - сбросить онбординг
  checkFirstLogin        // () => Promise<void> - принудительная проверка
} = useFirstLogin()
```

### Логика определения первого логина

1. **Проверка аутентификации** - есть ли пользователь
2. **Быстрая проверка localStorage** - локальный кеш
3. **Проверка базы данных** - поле `onboarding_completed`
4. **Синхронизация** - обновление localStorage из БД

## Стили и анимации

### Эффект подсветки

Использует `radial-gradient` для создания spotlight эффекта:

```tsx
background: `radial-gradient(circle at ${centerX}px ${centerY}px, 
  transparent ${radius + 10}px, 
  rgba(0,0,0,0.7) ${radius + 15}px)`
```

### Анимации

- **Плавные переходы** между элементами (300ms)
- **Прокрутка к элементу** с `scrollIntoView`
- **Адаптивное позиционирование** тултипов
- **Прогресс-бар** с transition эффектами

## Технические особенности

### Поиск элементов

Компонент пытается найти элемент несколько раз с задержкой:

```tsx
const findTargetElement = useCallback((selector: string) => {
  let attempts = 0
  const maxAttempts = 10
  
  const tryFind = () => {
    const element = document.querySelector(selector)
    if (element) {
      setTargetElement(element)
      return true
    }
    
    attempts++
    if (attempts < maxAttempts) {
      setTimeout(tryFind, 200) // повтор через 200мс
    }
    return false
  }
  
  tryFind()
}, [])
```

### Умное позиционирование

Тултипы автоматически корректируют позицию чтобы не выходить за границы экрана:

```tsx
// Проверка границ экрана
if (left < padding) left = padding
if (left + tooltipWidth > window.innerWidth - padding) {
  left = window.innerWidth - tooltipWidth - padding
}
```

## Отладка

### Логи в консоли

```javascript
// Элемент не найден
console.log(`Element not found: ${selector}`)

// Ошибки базы данных
console.error('Error checking first login:', error)
console.error('Error updating onboarding status:', error)
```

### Проверка состояния

В DevTools можно проверить:

```javascript
// localStorage
localStorage.getItem('onboarding_completed_USER_ID')

// Состояние в React DevTools
// Найти компонент DashboardLayout -> hooks -> useFirstLogin
```

## Развертывание

### База данных

Примените миграцию:

```sql
-- supabase/migrations/20240104000000_add_onboarding_completed.sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
```

### Проверка работы

1. **Зарегистрируйте нового пользователя**
2. **Войдите в дашборд** - должен запуститься онбординг
3. **Пройдите тур** или нажмите "Пропустить"
4. **Перезагрузите страницу** - онбординг не должен показаться
5. **В разработке** - используйте кнопку "🔄 Сброс" для тестирования

## Возможные проблемы

### Элемент не найден

**Проблема**: CSS селектор не находит элемент
**Решение**: 
- Проверьте правильность селектора в DevTools
- Убедитесь что элемент загружен к моменту поиска
- Увеличьте задержку поиска элемента

### Онбординг не запускается

**Проблема**: Компонент не отображается для новых пользователей
**Решение**:
- Проверьте миграцию базы данных
- Очистите localStorage: `localStorage.clear()`
- Проверьте логи в консоли

### Неправильное позиционирование

**Проблема**: Тултип отображается в неправильном месте
**Решение**:
- Проверьте CSS свойство `position` элементов
- Убедитесь что страница полностью загружена
- Увеличьте задержку перед поиском элемента

## Customization

### Изменение дизайна

Основные стили находятся в JSX компонента:

```tsx
// Тултип
className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-6"

// Подсветка элемента  
className="absolute border-2 border-blue-500 rounded-lg shadow-lg"

// Кнопки
className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
```

### Добавление новых страниц

1. Добавьте шаги в `tourSteps`
2. Укажите правильный `page` путь
3. Найдите подходящие CSS селекторы
4. Протестируйте переходы между страницами

## Заключение

Guided Onboarding предоставляет полнофункциональную систему интерактивного ознакомления пользователей с интерфейсом. Система автоматически определяет новых пользователей, проводит их по всем основным разделам дашборда с подсветкой элементов и сохраняет прогресс в базе данных.

Для поддержки или улучшений обращайтесь к коду в указанных файлах или создавайте issue в репозитории проекта. 
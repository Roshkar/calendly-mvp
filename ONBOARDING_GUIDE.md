# Руководство по онбордингу

## Описание

Система онбординга создана для знакомства новых пользователей с функционалом веб-приложения Calendly MVP. Она включает интерактивный тур с пошаговыми инструкциями.

## Структура файлов

- `src/components/ui/onboarding.tsx` - Основной компонент онбординга
- `src/app/demo/page.tsx` - Отдельная демо-страница
- `src/app/page.tsx` - Главная страница с интегрированным онбордингом

## Функциональность

### Основные возможности

1. **Интерактивный тур** - 6 шагов знакомства с приложением
2. **Прогресс-бар** - Визуальное отображение прогресса
3. **Навигация** - Переход между шагами вперед/назад
4. **Адаптивный дизайн** - Работает на всех устройствах
5. **Анимации** - Плавные переходы между шагами

### Шаги онбординга

1. **Добро пожаловать** - Приветствие и общее описание
2. **Создание событий** - Объяснение создания типов встреч
3. **Управление временем** - Настройка доступности и временных зон
4. **Бронирование встреч** - Процесс бронирования клиентами
5. **Настройки профиля** - Персонализация профиля
6. **Завершение** - Призыв к действию

## Как использовать

### Запуск онбординга

#### На главной странице
```typescript
// Импортируем компонент
import Onboarding from '@/components/ui/onboarding'

// Добавляем состояние
const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

// Функции управления
const startOnboarding = () => setIsOnboardingOpen(true)
const closeOnboarding = () => setIsOnboardingOpen(false)

// Используем в JSX
<Onboarding 
  isOpen={isOnboardingOpen}
  onClose={closeOnboarding}
/>
```

#### Кнопка запуска
```typescript
<Button onClick={startOnboarding}>
  Посмотреть демо
</Button>
```

### На демо-странице

Перейдите на `/demo` для полноценного просмотра демо-версии с предварительным просмотром интерфейса.

## Кастомизация

### Изменение шагов онбординга

В файле `src/components/ui/onboarding.tsx` найдите массив `onboardingSteps` и модифицируйте его:

```typescript
const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Ваш заголовок",
    description: "Ваше описание",
    icon: <YourIcon className="h-6 w-6" />,
    action: "Текст кнопки"
  },
  // ... другие шаги
]
```

### Настройка целевых элементов

Добавьте ID к элементам на странице для привязки шагов онбординга:

```typescript
<div id="target-element">
  Целевой элемент
</div>
```

### Стилизация

Компонент использует Tailwind CSS классы. Модифицируйте классы в компоненте для изменения внешнего вида:

```typescript
<div className="bg-white rounded-lg shadow-xl max-w-md w-full">
  {/* Содержимое */}
</div>
```

## Интеграция с другими страницами

### Добавление на новую страницу

1. Импортируйте компонент
2. Добавьте состояние для управления
3. Создайте функции открытия/закрытия
4. Добавьте компонент в JSX

### Пример интеграции

```typescript
'use client'

import { useState } from 'react'
import Onboarding from '@/components/ui/onboarding'

export default function YourPage() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOnboardingOpen(true)}>
        Помощь
      </button>
      
      <Onboarding 
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  )
}
```

## Технические детали

### Зависимости

- React (useState, useEffect)
- Lucide React (иконки)
- Tailwind CSS (стили)
- Компоненты UI (Button)

### Пропсы компонента

```typescript
interface OnboardingProps {
  isOpen: boolean      // Состояние видимости
  onClose: () => void  // Функция закрытия
}
```

### Интерфейс шага

```typescript
interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  target?: string      // ID целевого элемента
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: string      // Текст кнопки действия
}
```

## Рекомендации

1. **Краткость** - Делайте описания шагов короткими и понятными
2. **Логичность** - Соблюдайте логическую последовательность шагов
3. **Визуальность** - Используйте понятные иконки
4. **Тестирование** - Проверьте работу на разных устройствах
5. **Обновление** - Регулярно обновляйте содержимое при изменении функционала

## Планы развития

- [ ] Добавить анимации привязки к элементам
- [ ] Создать систему подсказок (tooltips)
- [ ] Добавить возможность пропуска шагов
- [ ] Интегрировать с аналитикой
- [ ] Добавить адаптивные подсказки на основе действий пользователя

## Поддержка

При возникновении проблем или вопросов по интеграции онбординга, обратитесь к документации React и Tailwind CSS или создайте issue в репозитории проекта. 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X, ArrowLeft, ArrowRight, Play, Pause } from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  target: string // CSS селектор
  fallback?: string // Резервный селектор
  page: string // путь к странице
  position: 'top' | 'bottom' | 'left' | 'right'
  showNavigation?: boolean
}

const tourSteps: TourStep[] = [
  // Главная страница дашборда
  {
    id: 'welcome',
    title: 'Добро пожаловать в Calendly MVP!',
    description: 'Давайте проведем быструю экскурсию по всем возможностям системы планирования встреч.',
    target: '[data-onboarding="welcome-title"]',
    fallback: 'h1',
    page: '/dashboard',
    position: 'bottom'
  },
  {
    id: 'create-event',
    title: 'Создание событий',
    description: 'Нажмите здесь, чтобы создать новый тип события для ваших встреч.',
    target: '[data-onboarding="create-event-button"]',
    fallback: 'a[href="/dashboard/event-types/new"]',
    page: '/dashboard',
    position: 'bottom'
  },
  {
    id: 'stats-cards',
    title: 'Статистика',
    description: 'Здесь отображается статистика ваших событий и встреч.',
    target: '[data-onboarding="stats-cards"]',
    fallback: '.grid.grid-cols-1.md\\:grid-cols-3 ',
    page: '/dashboard',
    position: 'bottom'
  },

  // Страница типов событий
  {
    id: 'event-types-page',
    title: 'Управление типами событий',
    description: 'На этой странице вы можете создавать и управлять различными типами ваших встреч.',
    target: '[data-onboarding="event-types-title"]',
    fallback: 'h1',
    page: '/dashboard/event-types',
    position: 'bottom',
    showNavigation: true
  },
  {
    id: 'new-event-btn',
    title: 'Создать новое событие',
    description: 'Нажмите эту кнопку, чтобы создать новый тип события.',
    target: '[data-onboarding="new-event-button"]',
    fallback: 'a[href="/dashboard/event-types/new"]',
    page: '/dashboard/event-types',
    position: 'bottom'
  },

  // Страница бронирований
  {
    id: 'bookings-page',
    title: 'Управление бронированиями',
    description: 'Здесь отображаются все ваши запланированные встречи и бронирования.',
    target: '[data-onboarding="bookings-title"]',
    fallback: 'h1',
    page: '/dashboard/bookings',
    position: 'bottom',
    showNavigation: true
  },
  {
    id: 'bookings-list',
    title: 'Список встреч',
    description: 'В этой области будут отображаться все ваши предстоящие встречи.',
    target: '[data-onboarding="bookings-content"]',
    fallback: '.bg-white.rounded-lg.border',
    page: '/dashboard/bookings',
    position: 'top'
  },

  // Страница доступности
  {
    id: 'availability-page',
    title: 'Настройка доступности',
    description: 'Настройте свои рабочие часы и дни, когда вы доступны для встреч.',
    target: '[data-onboarding="availability-title"]',
    fallback: 'h1',
    page: '/dashboard/availability',
    position: 'bottom',
    showNavigation: true
  },
  {
    id: 'availability-settings',
    title: 'Рабочие часы',
    description: 'Здесь вы можете установить свои рабочие часы для каждого дня недели.',
    target: '[data-onboarding="availability-settings"]',
    fallback: '.bg-white.rounded-lg.border',
    page: '/dashboard/availability',
    position: 'top'
  },

  // Страница настроек
  {
    id: 'settings-page',
    title: 'Настройки профиля',
    description: 'Управляйте настройками своего профиля и аккаунта.',
    target: '[data-onboarding="settings-title"]',
    fallback: 'h1',
    page: '/dashboard/settings',
    position: 'bottom',
    showNavigation: true
  },
  {
    id: 'profile-form',
    title: 'Информация профиля',
    description: 'Здесь вы можете обновить информацию своего профиля.',
    target: '[data-onboarding="profile-form"]',
    fallback: 'form',
    page: '/dashboard/settings',
    position: 'top'
  },

  // Возврат на главную
  {
    id: 'tour-complete',
    title: 'Экскурсия завершена!',
    description: 'Отлично! Теперь вы знаете основные возможности системы. Начните с создания своего первого события.',
    target: '[data-onboarding="create-event-button"]',
    fallback: 'a[href="/dashboard/event-types/new"]',
    page: '/dashboard',
    position: 'bottom',
    showNavigation: true
  }
]

interface GuidedOnboardingProps {
  onComplete: () => void
  onSkip: () => void
}

export default function GuidedOnboarding({ onComplete, onSkip }: GuidedOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [tooltipWidth, setTooltipWidth] = useState(320)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()

  const currentTourStep = tourSteps[currentStep]

  // Улучшенная функция для поиска элемента на странице
  const findTargetElement = useCallback((selector: string, fallback?: string) => {
    let attempts = 0
    const maxAttempts = 15
    
    const tryFind = () => {
      // Сначала пробуем основной селектор
      let element = document.querySelector(selector) as HTMLElement
      
      // Если не найден, пробуем fallback
      if (!element && fallback) {
        element = document.querySelector(fallback) as HTMLElement
      }
      
      if (element) {
        console.log(`✅ Найден элемент: ${selector}${fallback ? ` (fallback: ${fallback})` : ''}`)
        setTargetElement(element)
        return true
      }
      
      attempts++
      if (attempts < maxAttempts) {
        setTimeout(tryFind, 300)
      } else {
        console.log(`❌ Элемент не найден: ${selector}${fallback ? ` (fallback: ${fallback})` : ''}`)
        setTargetElement(null)
      }
      return false
    }
    
    tryFind()
  }, [])

  // Улучшенное вычисление позиции тултипа с адаптивным позиционированием
  const calculateTooltipPosition = useCallback((element: HTMLElement, preferredPosition: string) => {
    const rect = element.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    
    // Адаптивная ширина тултипа
    const maxTooltipWidth = Math.min(320, viewportWidth * 0.9)
    const tooltipHeight = 200 // Примерная высота с запасом
    const padding = 16
    const arrowSize = 10

    // Сохраняем вычисленную ширину в состояние
    setTooltipWidth(maxTooltipWidth)

    let top = 0
    let left = 0
    let actualPosition = preferredPosition

    // Функция для проверки помещается ли тултип в позиции
    const checkFitsInPosition = (pos: string, calcTop: number, calcLeft: number) => {
      switch (pos) {
        case 'top':
          return calcTop >= padding && calcLeft >= padding && calcLeft + maxTooltipWidth <= viewportWidth - padding
        case 'bottom':
          return calcTop + tooltipHeight <= viewportHeight - padding && calcLeft >= padding && calcLeft + maxTooltipWidth <= viewportWidth - padding
        case 'left':
          return calcLeft >= padding && calcTop >= padding && calcTop + tooltipHeight <= viewportHeight - padding
        case 'right':
          return calcLeft + maxTooltipWidth <= viewportWidth - padding && calcTop >= padding && calcTop + tooltipHeight <= viewportHeight - padding
        default:
          return false
      }
    }

    // Функция для вычисления позиции по направлению
    const calculatePosition = (pos: string) => {
      let calcTop = 0
      let calcLeft = 0

      switch (pos) {
        case 'top':
          calcTop = rect.top + scrollY - tooltipHeight - arrowSize
          calcLeft = rect.left + scrollX + (rect.width / 2) - (maxTooltipWidth / 2)
          break
        case 'bottom':
          calcTop = rect.bottom + scrollY + arrowSize
          calcLeft = rect.left + scrollX + (rect.width / 2) - (maxTooltipWidth / 2)
          break
        case 'left':
          calcTop = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2)
          calcLeft = rect.left + scrollX - maxTooltipWidth - arrowSize
          break
        case 'right':
          calcTop = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2)
          calcLeft = rect.right + scrollX + arrowSize
          break
      }

      return { top: calcTop, left: calcLeft }
    }

    // Пробуем предпочтительную позицию
    let position = calculatePosition(preferredPosition)
    
    // Если не помещается, пробуем другие позиции в порядке приоритета
    if (!checkFitsInPosition(preferredPosition, position.top, position.left)) {
      const alternativePositions = ['bottom', 'top', 'right', 'left'].filter(p => p !== preferredPosition)
      
      for (const altPos of alternativePositions) {
        const altPosition = calculatePosition(altPos)
        if (checkFitsInPosition(altPos, altPosition.top, altPosition.left)) {
          position = altPosition
          actualPosition = altPos
          break
        }
      }
    }

    // Финальная корректировка позиции чтобы точно не выйти за границы
    top = Math.max(padding, Math.min(position.top, viewportHeight - tooltipHeight - padding))
    left = Math.max(padding, Math.min(position.left, viewportWidth - maxTooltipWidth - padding))

    // Для мобильных устройств (меньше 768px) центрируем по горизонтали
    if (viewportWidth < 768) {
      left = (viewportWidth - maxTooltipWidth) / 2
      // На мобильных всегда показываем внизу экрана
      if (rect.bottom + tooltipHeight + padding > viewportHeight) {
        top = viewportHeight - tooltipHeight - padding - 20
      }
    }

    console.log(`📍 Позиционирование тултипа: ${preferredPosition} → ${actualPosition}, top: ${top}, left: ${left}, width: ${maxTooltipWidth}`)

    setTooltipPosition({ top, left })
  }, [])

  // Эффект для обновления позиции при изменении элемента
  useEffect(() => {
    if (targetElement) {
      calculateTooltipPosition(targetElement, currentTourStep.position)
      
      // Прокручиваем к элементу
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      })
    }
  }, [targetElement, currentTourStep.position, calculateTooltipPosition])

  // Эффект для обработки изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      if (targetElement) {
        calculateTooltipPosition(targetElement, currentTourStep.position)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [targetElement, currentTourStep.position, calculateTooltipPosition])

  // Проверяем мобильное устройство
  const isMobile = tooltipWidth < 400

  // Эффект для поиска элемента при смене шага или страницы
  useEffect(() => {
    if (currentTourStep && pathname === currentTourStep.page) {
      // Увеличиваем задержку для загрузки страницы
      setTimeout(() => {
        findTargetElement(currentTourStep.target, currentTourStep.fallback)
      }, 800)
    }
  }, [currentStep, pathname, currentTourStep, findTargetElement])

  // Эффект для навигации между страницами
  useEffect(() => {
    if (currentTourStep && pathname !== currentTourStep.page) {
      router.push(currentTourStep.page)
    }
  }, [currentStep, currentTourStep, pathname, router])

  // Обработчики действий
  const handleComplete = useCallback(() => {
    setIsVisible(false)
    onComplete()
  }, [onComplete])

  const handleSkip = useCallback(() => {
    setIsVisible(false)
    onSkip()
  }, [onSkip])

  // Автовоспроизведение
  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        if (currentStep < tourSteps.length - 1) {
          setCurrentStep(prev => prev + 1)
        } else {
          setIsAutoPlay(false)
          handleComplete()
        }
      }, 4000) // 4 секунды на шаг
      
      setAutoPlayInterval(interval)
      return () => clearInterval(interval)
    } else if (autoPlayInterval) {
      clearInterval(autoPlayInterval)
      setAutoPlayInterval(null)
    }
  }, [isAutoPlay, currentStep, autoPlayInterval, handleComplete])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay)
  }

  if (!isVisible || !currentTourStep) return null

  return (
    <>
      {/* Overlay с подсветкой */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Затемненный фон */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          style={{
            background: targetElement ? 
              `radial-gradient(circle at ${targetElement.getBoundingClientRect().left + targetElement.getBoundingClientRect().width/2}px ${targetElement.getBoundingClientRect().top + targetElement.getBoundingClientRect().height/2}px, transparent ${Math.max(targetElement.getBoundingClientRect().width, targetElement.getBoundingClientRect().height)/2 + 10}px, rgba(0,0,0,0.7) ${Math.max(targetElement.getBoundingClientRect().width, targetElement.getBoundingClientRect().height)/2 + 15}px)` :
              'rgba(0,0,0,0.7)'
          }}
        />
        
        {/* Подсветка элемента */}
        {targetElement && (
          <div
            className="absolute border-2 border-blue-500 rounded-lg shadow-lg pointer-events-auto"
            style={{
              top: targetElement.getBoundingClientRect().top - 4,
              left: targetElement.getBoundingClientRect().left - 4,
              width: targetElement.getBoundingClientRect().width + 8,
              height: targetElement.getBoundingClientRect().height + 8,
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
            }}
          />
        )}
      </div>

      {/* Тултип */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 pointer-events-auto"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: tooltipWidth,
          maxWidth: '90vw'
        }}
      >
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
              {currentTourStep.title}
            </h3>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
            >
              <X size={isMobile ? 18 : 20} />
            </button>
          </div>

          {/* Описание */}
          <p className={`text-gray-600 mb-6 leading-relaxed ${isMobile ? 'text-sm' : 'text-sm'}`}>
            {currentTourStep.description}
          </p>

          {/* Прогресс */}
          <div className="flex items-center mb-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
            <span className={`ml-3 text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {currentStep + 1} / {tourSteps.length}
            </span>
          </div>

          {/* Управление */}
          <div className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
            <div className={`flex items-center space-x-2 ${isMobile ? 'order-2' : ''}`}>
              <button
                onClick={toggleAutoPlay}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${isMobile ? 'text-xs' : 'text-sm'} ${
                  isAutoPlay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isAutoPlay ? <Pause size={isMobile ? 12 : 14} /> : <Play size={isMobile ? 12 : 14} />}
                <span>{isAutoPlay ? 'Пауза' : 'Авто'}</span>
              </button>
              
              <button
                onClick={handleSkip}
                className={`text-gray-500 hover:text-gray-700 transition-colors ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                Пропустить
              </button>
            </div>

            <div className={`flex items-center space-x-2 ${isMobile ? 'order-1 w-full justify-between' : ''}`}>
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center space-x-1 px-3 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isMobile ? 'text-xs flex-1 justify-center' : 'text-sm'}`}
              >
                <ArrowLeft size={isMobile ? 12 : 14} />
                <span>Назад</span>
              </button>
              
              <button
                onClick={handleNext}
                className={`flex items-center space-x-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors ${isMobile ? 'text-xs flex-1 justify-center' : 'text-sm'}`}
              >
                <span>{currentStep === tourSteps.length - 1 ? 'Завершить' : 'Далее'}</span>
                {currentStep !== tourSteps.length - 1 && <ArrowRight size={isMobile ? 12 : 14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
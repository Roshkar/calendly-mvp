'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X, ArrowLeft, ArrowRight, Play, Pause } from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  target: string // CSS селектор
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
    target: 'h1',
    page: '/dashboard',
    position: 'bottom'
  },
  {
    id: 'create-event',
    title: 'Создание событий',
    description: 'Нажмите здесь, чтобы создать новый тип события для ваших встреч.',
    target: 'a[href="/dashboard/event-types/new"]',
    page: '/dashboard',
    position: 'bottom'
  },
  {
    id: 'stats-cards',
    title: 'Статистика',
    description: 'Здесь отображается статистика ваших событий и встреч.',
    target: '.grid.grid-cols-1.md\\:grid-cols-3',
    page: '/dashboard',
    position: 'bottom'
  },

  // Страница типов событий
  {
    id: 'event-types-page',
    title: 'Управление типами событий',
    description: 'На этой странице вы можете создавать и управлять различными типами ваших встреч.',
    target: 'h1',
    page: '/dashboard/event-types',
    position: 'bottom',
    showNavigation: true
  },
  {
    id: 'new-event-btn',
    title: 'Создать новое событие',
    description: 'Нажмите эту кнопку, чтобы создать новый тип события.',
    target: 'a[href="/dashboard/event-types/new"]',
    page: '/dashboard/event-types',
    position: 'bottom'
  },

  // Страница бронирований
  {
    id: 'bookings-page',
    title: 'Управление бронированиями',
    description: 'Здесь отображаются все ваши запланированные встречи и бронирования.',
    target: 'h1',
    page: '/dashboard/bookings',
    position: 'bottom',
    showNavigation: true
  },
  {
    id: 'bookings-list',
    title: 'Список встреч',
    description: 'В этой области будут отображаться все ваши предстоящие встречи.',
    target: '.space-y-4, .text-center',
    page: '/dashboard/bookings',
    position: 'top'
  },

  // Страница доступности
  {
    id: 'availability-page',
    title: 'Настройка доступности',
    description: 'Настройте свои рабочие часы и дни, когда вы доступны для встреч.',
    target: 'h1',
    page: '/dashboard/availability',
    position: 'bottom',
    showNavigation: true
  },
  {
    id: 'availability-settings',
    title: 'Рабочие часы',
    description: 'Здесь вы можете установить свои рабочие часы для каждого дня недели.',
    target: '.space-y-4, .grid',
    page: '/dashboard/availability',
    position: 'top'
  },

  // Страница настроек
  {
    id: 'settings-page',
    title: 'Настройки профиля',
    description: 'Управляйте настройками своего профиля и аккаунта.',
    target: 'h1',
    page: '/dashboard/settings',
    position: 'bottom',
    showNavigation: true
  },
  {
    id: 'profile-form',
    title: 'Информация профиля',
    description: 'Здесь вы можете обновить информацию своего профиля.',
    target: 'form, .space-y-4',
    page: '/dashboard/settings',
    position: 'top'
  },

  // Возврат на главную
  {
    id: 'tour-complete',
    title: 'Экскурсия завершена!',
    description: 'Отлично! Теперь вы знаете основные возможности системы. Начните с создания своего первого события.',
    target: 'a[href="/dashboard/event-types/new"]',
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
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()

  const currentTourStep = tourSteps[currentStep]

  // Функция для поиска элемента на странице
  const findTargetElement = useCallback((selector: string) => {
    // Пробуем найти элемент несколько раз с задержкой
    let attempts = 0
    const maxAttempts = 10
    
    const tryFind = () => {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        setTargetElement(element)
        return true
      }
      
      attempts++
      if (attempts < maxAttempts) {
        setTimeout(tryFind, 200)
      } else {
        console.log(`Element not found: ${selector}`)
        setTargetElement(null)
      }
      return false
    }
    
    tryFind()
  }, [])

  // Вычисление позиции тултипа
  const calculateTooltipPosition = useCallback((element: HTMLElement, position: string) => {
    const rect = element.getBoundingClientRect()
    const tooltipWidth = 320
    const tooltipHeight = 150
    const padding = 20

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = rect.top - tooltipHeight - padding
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
        break
      case 'bottom':
        top = rect.bottom + padding
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
        break
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2)
        left = rect.left - tooltipWidth - padding
        break
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2)
        left = rect.right + padding
        break
    }

    // Убеждаемся что тултип не выходит за границы экрана
    if (left < padding) left = padding
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding
    }
    if (top < padding) top = padding
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = window.innerHeight - tooltipHeight - padding
    }

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

  // Эффект для поиска элемента при смене шага или страницы
  useEffect(() => {
    if (currentTourStep && pathname === currentTourStep.page) {
      // Небольшая задержка для загрузки страницы
      setTimeout(() => {
        findTargetElement(currentTourStep.target)
      }, 500)
    }
  }, [currentStep, pathname, currentTourStep, findTargetElement])

  // Эффект для навигации между страницами
  useEffect(() => {
    if (currentTourStep && pathname !== currentTourStep.page) {
      router.push(currentTourStep.page)
    }
  }, [currentStep, currentTourStep, pathname, router])

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
  }, [isAutoPlay, currentStep])

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

  const handleComplete = () => {
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    setIsVisible(false)
    onSkip()
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
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-6 pointer-events-auto"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: '320px',
          maxWidth: '90vw'
        }}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentTourStep.title}
          </h3>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Описание */}
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
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
          <span className="ml-3 text-sm text-gray-500">
            {currentStep + 1} / {tourSteps.length}
          </span>
        </div>

        {/* Управление */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAutoPlay}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                isAutoPlay 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isAutoPlay ? <Pause size={14} /> : <Play size={14} />}
              <span>{isAutoPlay ? 'Пауза' : 'Авто'}</span>
            </button>
            
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Пропустить
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Назад</span>
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center space-x-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>{currentStep === tourSteps.length - 1 ? 'Завершить' : 'Далее'}</span>
              {currentStep !== tourSteps.length - 1 && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 
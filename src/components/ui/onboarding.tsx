'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, ArrowRight, ArrowLeft, Calendar, Clock, Users, Settings, BookOpen, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Добро пожаловать в Calendly MVP!",
    description: "Давайте проведем вас через основные возможности приложения для планирования встреч",
    icon: <Star className="h-6 w-6" />,
    action: "Начать тур"
  },
  {
    id: 2,
    title: "Создание событий",
    description: "Создавайте различные типы событий - встречи, консультации, звонки. Настраивайте длительность и описание",
    icon: <Calendar className="h-6 w-6" />,
    target: "create-event",
    position: "bottom"
  },
  {
    id: 3,
    title: "Управление временем",
    description: "Настройте свою доступность, рабочие часы и временные зоны. Блокируйте время для личных дел",
    icon: <Clock className="h-6 w-6" />,
    target: "availability",
    position: "right"
  },
  {
    id: 4,
    title: "Бронирование встреч",
    description: "Клиенты могут выбирать удобное время из вашего расписания. Автоматические уведомления и напоминания",
    icon: <Users className="h-6 w-6" />,
    target: "bookings",
    position: "left"
  },
  {
    id: 5,
    title: "Настройки профиля",
    description: "Персонализируйте свой профиль, добавьте фото, контакты и предпочтения уведомлений",
    icon: <Settings className="h-6 w-6" />,
    target: "settings",
    position: "top"
  },
  {
    id: 6,
    title: "Готово!",
    description: "Теперь вы знаете основы. Зарегистрируйтесь или войдите, чтобы начать использовать приложение",
    icon: <BookOpen className="h-6 w-6" />,
    action: "Завершить тур"
  }
]

interface OnboardingProps {
  isOpen: boolean
  onClose: () => void
}

export default function Onboarding({ isOpen, onClose }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setCurrentStep(0)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  if (!isOpen) return null

  const currentStepData = onboardingSteps[currentStep]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={cn(
        "bg-white rounded-lg shadow-xl max-w-md w-full transition-all duration-300",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                {currentStepData.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentStepData.title}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Шаг {currentStep + 1} из {onboardingSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  index === currentStep 
                    ? "bg-blue-600" 
                    : index < currentStep 
                      ? "bg-blue-300" 
                      : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Назад</span>
          </Button>
          
          <Button
            onClick={handleNext}
            className="flex items-center space-x-2"
          >
            <span>
              {currentStep === onboardingSteps.length - 1 ? "Завершить" : "Далее"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 
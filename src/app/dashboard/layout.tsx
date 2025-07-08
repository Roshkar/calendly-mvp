// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useFirstLogin } from '@/hooks/useFirstLogin'
import GuidedOnboarding from '@/components/ui/guided-onboarding'

export default function DashboardLayout({
  children,
}: {
  children: any
}) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // Хук для определения первого логина
  const { isFirstLogin, isLoading, markOnboardingCompleted, resetOnboarding } = useFirstLogin()

  // Обработчики онбординга
  const handleOnboardingComplete = async () => {
    await markOnboardingCompleted()
  }

  const handleOnboardingSkip = async () => {
    await markOnboardingCompleted()
  }

  const handleLogout = async () => {
    if (isLoggingOut) return // Предотвращаем двойной клик
    
    setIsLoggingOut(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        alert('Ошибка при выходе: ' + error.message)
        setIsLoggingOut(false)
        return
      }

      // Перенаправляем на главную страницу
      router.push('/')
    } catch (err) {
      console.error('Unexpected error during logout:', err)
      alert('Произошла неожиданная ошибка при выходе')
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">📅</span>
            <h1 className="text-xl font-bold text-gray-900">Calendly MVP</h1>
          </a>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard/event-types" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <span>📅</span>
              <span>События</span>
            </a>
            <a href="/dashboard/bookings" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <span>📋</span>
              <span>Бронирования</span>
            </a>
            <a href="/dashboard/availability" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <span>⏰</span>
              <span>Доступность</span>
            </a>
            <a href="/dashboard/settings" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <span>⚙️</span>
              <span>Настройки</span>
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <a href="/dashboard/event-types/new" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1">
              <span>+</span>
              <span>Создать событие</span>
            </a>
            
            {/* Кнопка сброса онбординга (только для разработки) */}
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={resetOnboarding}
                className="text-orange-600 hover:text-orange-700 flex items-center space-x-1 px-2 py-1 rounded hover:bg-orange-50 transition-colors text-xs"
                title="Сбросить онбординг (только для разработки)"
              >
                <span>🔄</span>
                <span>Сброс</span>
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoggingOut ? '⏳' : '🚪'}</span>
              <span>{isLoggingOut ? 'Выходим...' : 'Выйти'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Guided Onboarding для первого логина */}
      {!isLoading && isFirstLogin && (
        <GuidedOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  )
} 
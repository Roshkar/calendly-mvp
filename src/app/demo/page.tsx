'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, Settings, ArrowLeft, Play } from 'lucide-react'
import Link from 'next/link'
import Onboarding from '@/components/ui/onboarding'

export default function DemoPage() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  const startOnboarding = () => {
    setIsOnboardingOpen(true)
  }

  const closeOnboarding = () => {
    setIsOnboardingOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">Назад</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Calendly MVP - Демо</h1>
            </div>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/register">
              <Button>Регистрация</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Демо-версия 
            <span className="text-blue-600"> Calendly MVP</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Изучите основные возможности приложения с помощью интерактивного тура. 
            Узнайте, как легко планировать встречи и управлять своим временем.
          </p>
          
          <div className="mb-12">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg"
              onClick={startOnboarding}
            >
              <Play className="h-5 w-5 mr-2" />
              Начать демо-тур
            </Button>
          </div>
        </div>

        {/* Demo Interface Preview */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Предварительный просмотр интерфейса
            </h3>
            
            {/* Mock Dashboard */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Create Event Card */}
              <div 
                id="create-event"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg"
              >
                <Calendar className="h-8 w-8 mb-4" />
                <h4 className="text-lg font-semibold mb-2">Создание событий</h4>
                <p className="text-blue-100 text-sm">
                  Создавайте различные типы встреч и настраивайте их параметры
                </p>
              </div>

              {/* Availability Card */}
              <div 
                id="availability"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg"
              >
                <Clock className="h-8 w-8 mb-4" />
                <h4 className="text-lg font-semibold mb-2">Доступность</h4>
                <p className="text-green-100 text-sm">
                  Управляйте своим расписанием и временными зонами
                </p>
              </div>

              {/* Bookings Card */}
              <div 
                id="bookings"
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg"
              >
                <Users className="h-8 w-8 mb-4" />
                <h4 className="text-lg font-semibold mb-2">Бронирования</h4>
                <p className="text-purple-100 text-sm">
                  Просматривайте и управляйте забронированными встречами
                </p>
              </div>
            </div>

            {/* Settings Section */}
            <div className="mt-8 pt-8 border-t">
              <div 
                id="settings"
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg max-w-md mx-auto"
              >
                <Settings className="h-8 w-8 mb-4 mx-auto" />
                <h4 className="text-lg font-semibold mb-2 text-center">Настройки профиля</h4>
                <p className="text-indigo-100 text-sm text-center">
                  Персонализируйте свой профиль и уведомления
                </p>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h4 className="text-xl font-semibold mb-4 text-gray-900">
                Что вы изучите в демо-туре:
              </h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">1.</span>
                  <span>Создание и настройка типов событий</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">2.</span>
                  <span>Управление доступностью и временными зонами</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">3.</span>
                  <span>Просмотр и управление бронированиями</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">4.</span>
                  <span>Настройка профиля и уведомлений</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h4 className="text-xl font-semibold mb-4 text-gray-900">
                После демо-тура вы сможете:
              </h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Эффективно планировать встречи</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Настраивать автоматические уведомления</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Управлять своим временем</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Предоставлять клиентам удобный способ бронирования</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Готовы начать?
              </h3>
              <p className="text-gray-600 mb-6">
                Зарегистрируйтесь бесплатно и создайте свой первый тип события
              </p>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg" className="px-8 py-3">
                    Создать аккаунт
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-3"
                  onClick={startOnboarding}
                >
                  Повторить демо-тур
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Onboarding Component */}
      <Onboarding 
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
      />
    </div>
  )
} 
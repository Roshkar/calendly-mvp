import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Calendly MVP</h1>
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
            Планируйте встречи 
            <span className="text-blue-600"> без хлопот</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Упростите процесс планирования встреч. Позвольте людям бронировать время с вами 
            автоматически, без бесконечной переписки.
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3">
                Начать бесплатно
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Посмотреть демо
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Простое планирование</h3>
            <p className="text-gray-600">
              Создавайте типы событий и делитесь ссылками для бронирования
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Управление временем</h3>
            <p className="text-gray-600">
              Настройте свою доступность и временные зоны
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Удобство для всех</h3>
            <p className="text-gray-600">
              Простой интерфейс как для вас, так и для ваших клиентов
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Calendly MVP</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 Calendly MVP. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
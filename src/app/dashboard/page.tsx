// @ts-nocheck
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать!</h1>
          <p className="text-gray-600 mt-2">Управляйте своими событиями и встречами</p>
        </div>
        <a href="/dashboard/event-types/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <span>+</span>
          <span>Создать событие</span>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Всего событий</span>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-gray-600">Активных типов событий</p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Встреч за месяц</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-gray-600">Запланированных встреч</p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Среднее время</span>
            <span className="text-2xl">⏰</span>
          </div>
          <div className="text-2xl font-bold">30м</div>
          <p className="text-xs text-gray-600">Длительность события</p>
        </div>
      </div>

      {/* Recent Event Types */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Ваши события</h2>
            <p className="text-gray-600">Последние созданные типы событий</p>
          </div>
          <a href="/dashboard/event-types" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-1">
            <span>Все события</span>
            <span>→</span>
          </a>
        </div>
        
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет событий</h3>
          <p className="text-gray-600 mb-4">Создайте свое первое событие для начала работы</p>
          <a href="/dashboard/event-types/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Создать событие
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-purple-600 text-xl">📋</span>
            <h3 className="text-lg font-semibold">Бронирования</h3>
          </div>
          <p className="text-gray-600 mb-4">Просматривайте и управляйте встречами</p>
          <a href="/dashboard/bookings" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 block text-center">
            Открыть
          </a>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-600 text-xl">⏰</span>
            <h3 className="text-lg font-semibold">Настроить доступность</h3>
          </div>
          <p className="text-gray-600 mb-4">Установите свои рабочие часы и доступные дни</p>
          <a href="/dashboard/availability" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 block text-center">
            Настроить
          </a>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-600 text-xl">👤</span>
            <h3 className="text-lg font-semibold">Посмотреть профиль</h3>
          </div>
          <p className="text-gray-600 mb-4">Управляйте информацией профиля и настройками</p>
          <a href="/dashboard/settings" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 block text-center">
            Открыть
          </a>
        </div>
      </div>

      {/* Debug Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-yellow-600 text-xl">🔧</span>
          <h3 className="text-lg font-semibold text-yellow-800">Отладка</h3>
        </div>
        <p className="text-yellow-700 mb-4">Инструменты для тестирования и диагностики</p>
        <div className="flex space-x-4">
          <a href="/dashboard/test-connection" className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-300">
            Тест подключения
          </a>
          <a href="/dashboard/test-bookings" className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-300">
            Тест бронирований
          </a>
          <a href="/test-telegram" className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-300">
            Тест Telegram
          </a>
        </div>
      </div>
    </div>
  )
} 
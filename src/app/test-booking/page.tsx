// @ts-nocheck
'use client'

export default function TestBookingPage() {
  console.log('🧪 Тестовая страница бронирования загружена!')
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 Тест статической страницы
          </h1>
          <p className="text-gray-600 mb-4">
            Если вы видите эту страницу, то Next.js маршрутизация работает.
          </p>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700">
              ✅ Путь: <code>/test-booking</code> работает!
            </p>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-700 text-sm">
              Попробуйте теперь ссылку бронирования из dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
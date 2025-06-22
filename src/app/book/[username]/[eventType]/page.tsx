export default function BookingPage({ params }: { params: { username: string, eventType: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Event Info */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{params.username}</h2>
                <p className="text-gray-600">Консультация</p>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {decodeURIComponent(params.eventType)}
            </h1>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>⏰</span>
                <span>30 минут</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>💻</span>
                <span>Zoom встреча</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🌍</span>
                <span>Московское время (GMT+3)</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Встреча будет проведена в Zoom. Ссылка будет отправлена на ваш email.
              </p>
            </div>
          </div>

          {/* Calendar & Booking Form */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Выберите дату и время</h3>
            
            {/* Simple Calendar */}
            <div className="grid grid-cols-7 gap-1 mb-6">
              <div className="text-center text-sm font-medium text-gray-600 py-2">Пн</div>
              <div className="text-center text-sm font-medium text-gray-600 py-2">Вт</div>
              <div className="text-center text-sm font-medium text-gray-600 py-2">Ср</div>
              <div className="text-center text-sm font-medium text-gray-600 py-2">Чт</div>
              <div className="text-center text-sm font-medium text-gray-600 py-2">Пт</div>
              <div className="text-center text-sm font-medium text-gray-600 py-2">Сб</div>
              <div className="text-center text-sm font-medium text-gray-600 py-2">Вс</div>
              
              {/* Calendar days */}
              {Array.from({ length: 35 }, (_, i) => (
                <button
                  key={i}
                  className={`p-2 text-sm rounded ${
                    i >= 5 && i <= 25 
                      ? 'hover:bg-blue-100 cursor-pointer' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {i >= 5 && i <= 25 ? i - 4 : ''}
                </button>
              ))}
            </div>

            {/* Time Slots */}
            <h4 className="font-medium mb-3">Доступное время</h4>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                <button
                  key={time}
                  className="p-2 text-sm border border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50"
                >
                  {time}
                </button>
              ))}
            </div>

            {/* Booking Form */}
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ваше имя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий (опционально)
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Расскажите о цели встречи..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
              >
                Забронировать встречу
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 
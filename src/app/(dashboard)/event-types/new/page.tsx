export default function NewEventTypePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Создать новое событие</h1>
        <p className="text-gray-600">Настройте параметры вашего события</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <form className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Название события *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Например: Встреча 1-на-1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Опишите цель встречи..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Длительность *
            </label>
            <select
              id="duration"
              name="duration"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Выберите длительность</option>
              <option value="15">15 минут</option>
              <option value="30">30 минут</option>
              <option value="45">45 минут</option>
              <option value="60">1 час</option>
              <option value="90">1.5 часа</option>
              <option value="120">2 часа</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Место проведения
            </label>
            <select
              id="location"
              name="location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите место</option>
              <option value="zoom">Zoom встреча</option>
              <option value="google-meet">Google Meet</option>
              <option value="phone">Телефонный звонок</option>
              <option value="office">В офисе</option>
            </select>
          </div>

          <div className="flex justify-between pt-6">
            <a
              href="/dashboard/event-types"
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Отмена
            </a>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Создать событие
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
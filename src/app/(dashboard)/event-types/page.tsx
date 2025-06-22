export default function EventTypesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Типы событий</h1>
          <p className="text-gray-600">Управляйте своими типами встреч</p>
        </div>
        <a 
          href="/dashboard/event-types/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Создать событие</span>
        </a>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ваши события</h2>
          
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              📅
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет событий</h3>
            <p className="text-gray-600 mb-4">Создайте свое первое событие для начала работы</p>
            <a 
              href="/dashboard/event-types/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Создать событие
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 
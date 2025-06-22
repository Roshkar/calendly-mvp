export default function AvailabilityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Доступность</h1>
        <p className="text-gray-600">Настройте свои рабочие часы и дни</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Рабочие часы</h2>
        
        <div className="space-y-4">
          {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((day, index) => (
            <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id={`day-${index}`}
                  defaultChecked={index < 5} // Пн-Пт по умолчанию включены
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`day-${index}`} className="text-sm font-medium text-gray-900 w-24">
                  {day}
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                </select>
                <span className="text-gray-500">—</span>
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Сохранить изменения
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Временная зона</h2>
        <select className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md">
          <option value="Europe/Moscow">Москва (GMT+3)</option>
          <option value="Europe/Kiev">Киев (GMT+2)</option>
          <option value="Asia/Almaty">Алматы (GMT+6)</option>
        </select>
      </div>
    </div>
  )
} 
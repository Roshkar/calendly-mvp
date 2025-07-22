'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function BookingPage({ params }: { params: { username: string; eventId: string } }) {
  console.log('🔍 BookingPage загружена с параметрами:', params)
  console.log('🔍 URL:', typeof window !== 'undefined' ? window.location.href : 'SSR')
  console.log('🔍 Event ID format check:', params.eventId)
  
  // Simple test to ensure the component is rendering
  console.log('🔍 Component is rendering...')
  
  const [eventData, setEventData] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    note: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  const loadEventData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setDebugInfo('Загружаем данные события...\n')

      setDebugInfo(prev => prev + `Ищем пользователя: ${params.username}\n`)
      setDebugInfo(prev => prev + `Ищем событие по ID: ${params.eventId}\n`)
      
      // Сначала находим пользователя по username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single()

      if (profileError) {
        setDebugInfo(prev => prev + `❌ Пользователь не найден: ${profileError.message}\n`)
        throw new Error(`Пользователь "${params.username}" не найден`)
      }

      setUserProfile(profile)
      setDebugInfo(prev => prev + `✅ Пользователь найден: ${profile.username}\n`)

      // Теперь находим событие по short_id и user_id
      console.log('🔍 Searching for event with short_id:', params.eventId)
      console.log('🔍 User ID:', profile.id)
      
      const { data: event, error: eventError } = await supabase
        .from('event_types')
        .select('*')
        .eq('short_id', params.eventId)
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .single()

      if (eventError) {
        setDebugInfo(prev => prev + `❌ Событие не найдено: ${eventError.message}\n`)
        
        // Debug: показываем все события пользователя
        const { data: allEvents, error: allEventsError } = await supabase
          .from('event_types')
          .select('id, name, short_id, is_active')
          .eq('user_id', profile.id)
        
        if (!allEventsError) {
          setDebugInfo(prev => prev + `🔍 Все события пользователя: ${JSON.stringify(allEvents, null, 2)}\n`)
        }
        
        throw new Error(`Событие не найдено или неактивно`)
      }

      setEventData(event)
      setDebugInfo(prev => prev + `✅ Событие загружено: ${event.name}\n`)

    } catch (err: any) {
      console.error('Error loading event data:', err)
      setError(err.message)
      setDebugInfo(prev => prev + `❌ Ошибка: ${err.message}\n`)
    } finally {
      setIsLoading(false)
    }
  }, [params.username, params.eventId])

  useEffect(() => {
    loadEventData()
  }, [loadEventData])

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBooking = async (e: any) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime) {
      alert('Пожалуйста, выберите дату и время')
      return
    }

    if (!formData.name || !formData.email) {
      alert('Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      setIsSubmitting(true)
      setDebugInfo('Создаем бронирование...\n')

      const bookingData = {
        event_type_id: eventData.id,
        invitee_name: formData.name,
        invitee_email: formData.email,
        start_time: `${selectedDate}T${selectedTime}:00`,
        end_time: `${selectedDate}T${addMinutes(selectedTime, eventData.duration_minutes)}:00`,
        timezone: userProfile.timezone || 'Europe/Moscow',
        status: 'confirmed'
      }

      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()

      if (bookingError) {
        throw new Error('Ошибка при создании бронирования: ' + bookingError.message)
      }

      setSuccess(true)

    } catch (err: any) {
      console.error('Error creating booking:', err)
      alert('Ошибка при бронировании: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addMinutes = (time: string, minutes: number) => {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('ru-RU', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        })
      })
    }
    
    return dates
  }

  const getAvailableTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const getEventTypeIcon = (eventType: any) => {
    if (eventType.event_type_category === 'group') {
      return '👥'
    }
    return '👤'
  }

  const getEventTypeLabel = (eventType: any) => {
    if (eventType.event_type_category === 'group') {
      return `Групповое (до ${eventType.max_participants} чел.)`
    }
    return 'Индивидуальное'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка события...</p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-700 text-sm">
                  🔍 Страница бронирования загружается<br/>
                  Пользователь: {params.username}<br/>
                  Событие ID: {params.eventId}<br/>
                  URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <div className="text-red-600 text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Событие не найдено</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <a 
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                На главную
              </a>
            </div>
            
            {debugInfo && (
              <div className="mt-6 bg-gray-100 p-4 rounded-md">
                <h3 className="font-semibold mb-2">📋 Журнал диагностики:</h3>
                <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">{debugInfo}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Встреча забронирована!</h2>
              <p className="text-gray-600 mb-4">
                Встреча &quot;{eventData.name}&quot; запланирована на {selectedDate} в {selectedTime}
              </p>
              <p className="text-sm text-gray-500">
                Подтверждение отправлено на {formData.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {userProfile?.first_name} {userProfile?.last_name} (@{userProfile?.username})
                </h2>
                <p className="text-gray-600">Организатор встречи</p>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {eventData?.name}
            </h1>

            {eventData?.description && (
              <p className="text-gray-600 mb-4">{eventData.description}</p>
            )}
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2">
                <span>⏰</span>
                <span>{eventData?.duration_minutes} минут</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>
                  {eventData?.location_type === 'online' && '💻'}
                  {eventData?.location_type === 'in_person' && '🏢'}
                  {eventData?.location_type === 'phone' && '📞'}
                </span>
                <span>
                  {eventData?.location_details || 
                   (eventData?.location_type === 'online' ? 'Онлайн встреча' : 
                    eventData?.location_type === 'phone' ? 'Телефонный звонок' : 'Личная встреча')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🌍</span>
                <span>{userProfile?.timezone || 'Europe/Moscow'}</span>
              </div>
              {/* Тип события */}
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getEventTypeIcon(eventData)}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {getEventTypeLabel(eventData)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Выберите время</h3>
            
            <form onSubmit={handleBooking} className="space-y-6">
              {/* Выбор даты */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date.date}
                      type="button"
                      onClick={() => setSelectedDate(date.date)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        selectedDate === date.date
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{date.display}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Выбор времени */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время *
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {getAvailableTimeSlots().map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-center rounded border transition-colors ${
                          selectedTime === time
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Форма данных */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                    Дополнительная информация
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Расскажите о цели встречи..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedDate || !selectedTime}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Бронирование...' : 'Забронировать встречу'}
              </button>
            </form>
          </div>
        </div>

        {/* Диагностическая информация */}
        <div className="mt-6 bg-green-50 p-4 rounded-md">
          <h3 className="font-semibold mb-2">🎉 Диагностическая информация:</h3>
          <div className="text-sm space-y-1">
            <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
            <p><strong>Username:</strong> {params.username}</p>
            <p><strong>Event ID:</strong> {params.eventId}</p>
            <p><strong>Статус:</strong> {isLoading ? 'Загружается...' : 'Загружено'}</p>
            <p><strong>Ошибка:</strong> {error || 'Нет'}</p>
            <p><strong>Маршрут:</strong> Правильная структура /book/[username]/[eventId]</p>
          </div>
        </div>

        {debugInfo && (
          <div className="mt-6 bg-gray-100 p-4 rounded-md">
            <h3 className="font-semibold mb-2">📋 Журнал выполнения:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  )
} 
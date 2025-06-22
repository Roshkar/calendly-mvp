// @ts-nocheck
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function BookingPage({ params }: { params: { slug: string } }) {
  console.log('🔍 BookingPage (single slug) загружена с параметрами:', params)
  
  const [eventData, setEventData] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
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
      setDebugInfo('Загружаем данные события по slug...\n')

      setDebugInfo(prev => prev + `Ищем событие по slug: ${params.slug}\n`)
      
      const { data: event, error: eventError } = await supabase
        .from('event_types')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            first_name,
            last_name,
            timezone
          )
        `)
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single()

      if (eventError) {
        setDebugInfo(prev => prev + `❌ Событие не найдено: ${eventError.message}\n`)
        throw new Error(`Событие "${params.slug}" не найдено или неактивно`)
      }

      setEventData(event)
      setUserProfile(event.profiles)
      setDebugInfo(prev => prev + `✅ Событие загружено: ${event.name}\n`)

    } catch (err) {
      console.error('Error loading event data:', err)
      setError(err.message)
      setDebugInfo(prev => prev + `❌ Ошибка: ${err.message}\n`)
    } finally {
      setIsLoading(false)
    }
  }, [params.slug])

  useEffect(() => {
    loadEventData()
  }, [loadEventData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBooking = async (e) => {
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

    } catch (err) {
      console.error('Error creating booking:', err)
      alert('Ошибка при бронировании: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addMinutes = (time, minutes) => {
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
                  Slug: {params.slug}
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
            
            <div className="space-y-3 text-sm text-gray-600">
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
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Выберите дату и время</h3>
            
            <div className="mb-6">
              <h4 className="font-medium mb-3">Доступные даты</h4>
              <div className="grid grid-cols-2 gap-2">
                {getAvailableDates().map((dateObj) => (
                  <button
                    key={dateObj.date}
                    onClick={() => setSelectedDate(dateObj.date)}
                    className={`p-2 text-sm border rounded text-left ${
                      selectedDate === dateObj.date
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {dateObj.display}
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="mb-6">
                <h4 className="font-medium mb-3">Доступное время</h4>
                <div className="grid grid-cols-3 gap-2">
                  {getAvailableTimeSlots().map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 text-sm border rounded ${
                        selectedTime === time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    <strong>Выбрано:</strong> {selectedDate} в {selectedTime}
                  </p>
                </div>

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
                    value={formData.email}
                    onChange={handleInputChange}
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
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Расскажите о цели встречи..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Бронирование...' : 'Забронировать встречу'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 p-4 rounded-md">
          <h3 className="font-semibold mb-2">🔍 Диагностическая информация:</h3>
          <div className="text-sm space-y-1">
            <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
            <p><strong>Slug:</strong> {params.slug}</p>
            <p><strong>Статус:</strong> {isLoading ? 'Загружается...' : 'Загружено'}</p>
            <p><strong>Ошибка:</strong> {error || 'Нет'}</p>
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
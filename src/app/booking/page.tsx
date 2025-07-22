'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function BookingPage() {
  const searchParams = useSearchParams()
  const eventShortId = searchParams.get('event')
  
  console.log('🔍 BookingPage (query params) загружена')
  console.log('🔍 Event short_id:', eventShortId)
  console.log('🔍 URL:', typeof window !== 'undefined' ? window.location.href : 'SSR')
  
  const [eventData, setEventData] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      setDebugInfo('Загружаем данные события по query параметру...\n')

      if (!eventShortId) {
        throw new Error('Не указан параметр события в URL')
      }

      setDebugInfo(prev => prev + `Ищем событие по short_id: ${eventShortId}\n`)
      
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
        .eq('short_id', eventShortId)
        .eq('is_active', true)
        .single()

      if (eventError) {
        setDebugInfo(prev => prev + `❌ Событие не найдено: ${eventError.message}\n`)
        throw new Error(`Событие "${eventShortId}" не найдено или неактивно`)
      }

      setEventData(event)
      setUserProfile(event.profiles)
      setDebugInfo(prev => prev + `✅ Событие загружено: ${event.name}\n`)

    } catch (err: any) {
      console.error('Error loading event data:', err)
      setError(err.message || 'Произошла ошибка при загрузке события')
      setDebugInfo(prev => prev + `❌ Ошибка: ${err.message || 'Неизвестная ошибка'}\n`)
    } finally {
      setIsLoading(false)
    }
  }, [eventShortId])

  useEffect(() => {
    loadEventData()
  }, [loadEventData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBooking = async (e: React.FormEvent) => {
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
        timezone: userProfile?.timezone || 'Europe/Moscow',
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
      setError(err.message || 'Произошла ошибка при создании бронирования')
      setDebugInfo(prev => prev + `❌ Ошибка бронирования: ${err.message || 'Неизвестная ошибка'}\n`)
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
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  const getAvailableTimeSlots = () => {
    // Простые временные слоты с 9:00 до 18:00
    const slots = []
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
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
    return 'Индивидуальное (1-на-1)'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка события...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border p-8 max-w-md w-full">
          <div className="text-center">
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
              <pre className="whitespace-pre-wrap text-sm">{debugInfo}</pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Бронирование подтверждено!</h2>
            <p className="text-gray-600 mb-4">
              Ваша встреча с {userProfile.first_name} {userProfile.last_name} запланирована на {selectedDate} в {selectedTime}.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Подтверждение отправлено на {formData.email}
            </p>
            <a 
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              На главную
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border p-6">
          {/* Event Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: eventData.color }}
              ></div>
              <h1 className="text-2xl font-bold text-gray-900">{eventData.name}</h1>
              <span className="text-lg" title={getEventTypeLabel(eventData)}>
                {getEventTypeIcon(eventData)}
              </span>
            </div>
            
            {eventData.description && (
              <p className="text-gray-600 mb-4">{eventData.description}</p>
            )}
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>⏰</span>
                <span>{eventData.duration_minutes} минут</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>
                  {eventData.location_type === 'online' && '💻'}
                  {eventData.location_type === 'in_person' && '🏢'}
                  {eventData.location_type === 'phone' && '📞'}
                </span>
                <span>
                  {eventData.location_details || 
                   (eventData.location_type === 'online' ? 'Онлайн встреча' : 
                    eventData.location_type === 'phone' ? 'Телефонный звонок' : 'Личная встреча')}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {getEventTypeLabel(eventData)}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleBooking} className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выберите дату
              </label>
              <select
                value={selectedDate || ''}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите дату...</option>
                {getAvailableDates().map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выберите время
              </label>
              <select
                value={selectedTime || ''}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите время...</option>
                {getAvailableTimeSlots().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дополнительная информация
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Расскажите о цели встречи..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Создание бронирования...' : 'Забронировать встречу'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 
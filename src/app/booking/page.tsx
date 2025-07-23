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
    
    if (!selectedDate || !selectedTime || !selectedSlot) {
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
        availability_slot_id: selectedSlot.slotId,
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

  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<any>(null)

  const loadAvailableSlots = useCallback(async () => {
    if (!eventData) return

    try {
      const { data: slots, error } = await supabase
        .from('availability_slots')
        .select(`
          *,
          event_types!inner(*)
        `)
        .eq('event_type_id', eventData.id)
        .eq('is_active', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      // Filter slots based on availability
      const availableSlots = slots.filter(slot => {
        if (eventData.event_type_category === 'individual') {
          // For individual events, check if slot is not booked
          return !slot.bookings || slot.bookings.length === 0
        } else {
          // For group events, check if there's still space
          return slot.current_participants < eventData.max_participants
        }
      })

      setAvailableSlots(availableSlots)
    } catch (err: any) {
      console.error('Error loading available slots:', err)
    }
  }, [eventData])

  useEffect(() => {
    if (eventData) {
      loadAvailableSlots()
    }
  }, [eventData, loadAvailableSlots])

  const getAvailableDates = () => {
    // Get unique dates from available slots
    const uniqueDates = [...new Set(availableSlots.map(slot => slot.date))]
    
    return uniqueDates.map(date => ({
      date,
      display: new Date(date).toLocaleDateString('ru-RU', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      })
    }))
  }

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return []
    
    // Get slots for the selected date
    const dateSlots = availableSlots.filter(slot => slot.date === selectedDate)
    
    return dateSlots.map(slot => ({
      time: slot.start_time,
      slotId: slot.id,
      currentParticipants: slot.current_participants,
      maxParticipants: eventData.max_participants,
      isAvailable: eventData.event_type_category === 'individual' 
        ? slot.current_participants === 0
        : slot.current_participants < eventData.max_participants
    }))
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
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {getEventTypeLabel(eventData)}
                </span>
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
                  {getAvailableTimeSlots().map((slot) => (
                    <button
                      key={slot.slotId}
                      onClick={() => {
                        setSelectedTime(slot.time)
                        setSelectedSlot(slot)
                      }}
                      disabled={!slot.isAvailable}
                      className={`p-2 text-sm border rounded ${
                        selectedTime === slot.time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : slot.isAvailable
                          ? 'border-gray-300 hover:border-blue-300'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div>{slot.time}</div>
                      {eventData.event_type_category === 'group' && (
                        <div className="text-xs text-gray-500">
                          {slot.currentParticipants}/{slot.maxParticipants}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {getAvailableTimeSlots().length === 0 && (
                  <p className="text-gray-500 text-sm">Нет доступных слотов на эту дату</p>
                )}
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
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface AvailabilitySlot {
  date: string
  startTime: string
  endTime: string
}

export default function EventAvailabilityPage() {
  const router = useRouter()
  const [eventTypeId, setEventTypeId] = useState<string | null>(null)
  const [eventData, setEventData] = useState<any>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get event type ID from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('eventTypeId') || localStorage.getItem('newEventTypeId')
    
    if (id) {
      setEventTypeId(id)
      loadEventType(id)
    } else {
      setError('Event type ID not found')
    }
  }, [])

  const loadEventType = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setEventData(data)
    } catch (err: any) {
      setError('Error loading event type: ' + err.message)
    }
  }

  const addSlot = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const newSlot: AvailabilitySlot = {
      date: tomorrow.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00'
    }
    
    setSlots([...slots, newSlot])
  }

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string) => {
    const updatedSlots = [...slots]
    updatedSlots[index] = { ...updatedSlots[index], [field]: value }
    setSlots(updatedSlots)
  }

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMinutes = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTypeId || slots.length === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Create availability slots
      const slotsToInsert = slots.map(slot => ({
        event_type_id: eventTypeId,
        date: slot.date,
        start_time: slot.startTime,
        end_time: calculateEndTime(slot.startTime, eventData.duration_minutes),
        is_active: true
      }))

      const { error } = await supabase
        .from('availability_slots')
        .insert(slotsToInsert)

      if (error) throw error

      // Clear localStorage
      localStorage.removeItem('newEventTypeId')
      
      // Redirect to event types page
      router.push('/dashboard/event-types')
    } catch (err: any) {
      setError('Error creating availability slots: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <div className="text-red-600 text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/dashboard/event-types')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Вернуться к событиям
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка события...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Настройка доступности для "{eventData.name}"
            </h1>
            <p className="text-gray-600">
              Укажите даты и время, когда вы доступны для встреч
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">Информация о событии:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Длительность:</strong> {eventData.duration_minutes} минут</p>
              <p><strong>Тип:</strong> {eventData.event_type_category === 'individual' ? 'Индивидуальная встреча' : 'Групповая встреча'}</p>
              {eventData.event_type_category === 'group' && (
                <p><strong>Максимум участников:</strong> {eventData.max_participants}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Слоты доступности</h3>
                <button
                  type="button"
                  onClick={addSlot}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + Добавить слот
                </button>
              </div>

              {slots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Нет добавленных слотов</p>
                  <p className="text-sm">Нажмите "Добавить слот" чтобы начать</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {slots.map((slot, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Слот {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeSlot(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Удалить
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Дата
                          </label>
                          <input
                            type="date"
                            value={slot.date}
                            onChange={(e) => updateSlot(index, 'date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Время начала
                          </label>
                          <select
                            value={slot.startTime}
                            onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            {getAvailableTimeSlots().map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Время окончания
                          </label>
                          <input
                            type="text"
                            value={calculateEndTime(slot.startTime, eventData.duration_minutes)}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/dashboard/event-types')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || slots.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Создание слотов...' : 'Создать слоты'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
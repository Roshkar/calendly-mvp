'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface AvailabilitySlot {
  date: string
  startTime: string
  endTime: string
}

interface WorkingHours {
  start: string
  end: string
}

export default function EventAvailabilityPage() {
  const router = useRouter()
  const [eventTypeId, setEventTypeId] = useState<string | null>(null)
  const [eventData, setEventData] = useState<any>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Calendar and time selection
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHours>({ start: '09:00', end: '17:00' })
  const [timeInterval, setTimeInterval] = useState(30) // minutes
  const [selectionMode, setSelectionMode] = useState<'calendar' | 'manual'>('calendar')

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

  const getCalendarDates = () => {
    const dates = []
    const today = new Date()
    
    // Generate next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Convert getDay() (0=Sunday, 1=Monday) to Russian calendar order (0=Monday, 6=Sunday)
      let dayOfWeek = date.getDay()
      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Sunday becomes 6, Monday becomes 0
      
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('ru-RU', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }),
        dayOfWeek: dayOfWeek
      })
    }
    
    return dates
  }

  const getCalendarGrid = () => {
    const dates = getCalendarDates()
    const grid = []
    
    // Get the first date's day of week to calculate padding
    const firstDate = dates[0]
    const firstDayOfWeek = firstDate.dayOfWeek
    
    // Add empty cells for days before the first date
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push({ isEmpty: true })
    }
    
    // Add all the dates
    dates.forEach(dateObj => {
      grid.push({ ...dateObj, isEmpty: false })
    })
    
    return grid
  }

  const toggleDate = (date: string) => {
    setSelectedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    )
  }

  const selectAllWeekdays = () => {
    const calendarDates = getCalendarDates()
    console.log('Calendar dates:', calendarDates.slice(0, 10)) // Debug first 10 dates
    
    const weekdays = calendarDates
      .filter(d => {
        console.log(`Date: ${d.date}, Day: ${d.dayOfWeek}, Display: ${d.display}`) // Debug each date
        return d.dayOfWeek >= 0 && d.dayOfWeek <= 4 // Monday (0) to Friday (4) in Russian calendar
      })
      .map(d => d.date)
    
    console.log('Selected weekdays:', weekdays) // Debug selected dates
    setSelectedDates(weekdays)
  }

  const clearSelection = () => {
    setSelectedDates([])
  }

  const generateTimeSlots = () => {
    const slots = []
    const [startHour, startMin] = workingHours.start.split(':').map(Number)
    const [endHour, endMin] = workingHours.end.split(':').map(Number)
    
    let currentHour = startHour
    let currentMin = startMin
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const time = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
      slots.push(time)
      
      currentMin += timeInterval
      if (currentMin >= 60) {
        currentMin = 0
        currentHour++
      }
    }
    
    return slots
  }

  const generateSlotsFromSelection = () => {
    if (selectedDates.length === 0) return
    
    const timeSlots = generateTimeSlots()
    const newSlots: AvailabilitySlot[] = []
    
    selectedDates.forEach(date => {
      timeSlots.forEach(startTime => {
        newSlots.push({
          date,
          startTime,
          endTime: calculateEndTime(startTime, eventData?.duration_minutes || 30)
        })
      })
    })
    
    setSlots(newSlots)
  }

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMinutes = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
  }

  const addManualSlot = () => {
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
    
    // Recalculate end time if start time changed
    if (field === 'startTime' && eventData) {
      updatedSlots[index].endTime = calculateEndTime(value, eventData.duration_minutes)
    }
    
    setSlots(updatedSlots)
  }

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTypeId || slots.length === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Creating slots:', slots)
      
      // Create availability slots
      const slotsToInsert = slots.map(slot => ({
        event_type_id: eventTypeId,
        date: slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
        is_active: true
      }))

      console.log('Slots to insert:', slotsToInsert)

      const { error } = await supabase
        .from('availability_slots')
        .insert(slotsToInsert)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Clear localStorage
      localStorage.removeItem('newEventTypeId')
      
      // Redirect to event types page
      router.push('/dashboard/event-types')
    } catch (err: any) {
      console.error('Error details:', err)
      setError('Error creating availability slots: ' + (err.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Настройка доступности для "{eventData.name}"
            </h1>
            <p className="text-gray-600">
              Выберите даты и время, когда вы доступны для встреч
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
            {/* Selection Mode Tabs */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectionMode('calendar')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    selectionMode === 'calendar'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📅 Календарь
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('manual')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    selectionMode === 'manual'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ✏️ Ручное добавление
                </button>
              </div>
            </div>

            {selectionMode === 'calendar' ? (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Calendar Selection */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Выберите даты</h3>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={selectAllWeekdays}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Все будни
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                      >
                        Очистить
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 max-h-96 overflow-y-auto">
                    {getCalendarGrid().map((dateObj, index) => (
                      <div
                        key={dateObj.isEmpty ? `empty-${index}` : (dateObj as any).date}
                        className={`p-2 text-sm border rounded text-center ${
                          dateObj.isEmpty 
                            ? 'border-gray-100 bg-gray-50'
                            : selectedDates.includes((dateObj as any).date)
                            ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-pointer'
                            : 'border-gray-300 hover:border-blue-300 cursor-pointer'
                        }`}
                        onClick={() => !dateObj.isEmpty && toggleDate((dateObj as any).date)}
                      >
                        {!dateObj.isEmpty && (
                          <>
                            <div className="font-medium">{(dateObj as any).display.split(' ')[1]}</div>
                            <div className="text-xs text-gray-500">{(dateObj as any).display.split(' ')[0]}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Настройки времени</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Рабочие часы
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Начало</label>
                          <input
                            type="time"
                            value={workingHours.start}
                            onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Конец</label>
                          <input
                            type="time"
                            value={workingHours.end}
                            onChange={(e) => setWorkingHours(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Интервал слотов
                      </label>
                      <select
                        value={timeInterval}
                        onChange={(e) => setTimeInterval(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={15}>15 минут</option>
                        <option value={30}>30 минут</option>
                        <option value={45}>45 минут</option>
                        <option value={60}>1 час</option>
                      </select>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h4 className="font-medium mb-2">Предварительный просмотр</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Выбрано дат: {selectedDates.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        Слотов будет создано: {selectedDates.length * generateTimeSlots().length}
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={generateSlotsFromSelection}
                      disabled={selectedDates.length === 0}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Создать слоты из выбора
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Manual Mode */
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Ручное добавление слотов</h3>
                  <button
                    type="button"
                    onClick={addManualSlot}
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
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Время окончания
                            </label>
                            <input
                              type="text"
                              value={slot.endTime}
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
            )}

            {/* Summary and Submit */}
            {slots.length > 0 && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-900 mb-2">
                  Готово к созданию: {slots.length} слотов
                </h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• {new Set(slots.map(s => s.date)).size} уникальных дат</p>
                  <p>• Временные слоты: {slots[0]?.startTime} - {slots[0]?.endTime}</p>
                  <p>• Длительность события: {eventData.duration_minutes} минут</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
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
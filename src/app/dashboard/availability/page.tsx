// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

const DAYS_OF_WEEK = [
  { name: 'Понедельник', value: 1 },
  { name: 'Вторник', value: 2 },
  { name: 'Среда', value: 3 },
  { name: 'Четверг', value: 4 },
  { name: 'Пятница', value: 5 },
  { name: 'Суббота', value: 6 },
  { name: 'Воскресенье', value: 0 }
]

const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
]

const TIMEZONES = [
  { value: 'Europe/Moscow', label: 'Москва (GMT+3)' },
  { value: 'Europe/Kiev', label: 'Киев (GMT+2)' },
  { value: 'Asia/Almaty', label: 'Алматы (GMT+6)' },
  { value: 'Europe/London', label: 'Лондон (GMT+0)' },
  { value: 'America/New_York', label: 'Нью-Йорк (GMT-5)' }
]

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState({})
  const [timezone, setTimezone] = useState('Europe/Moscow')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setDebugInfo('Загружаем настройки доступности...\n')

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error('Ошибка аутентификации: ' + userError.message)
      }

      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      setDebugInfo(prev => prev + `✅ Пользователь: ${user.email}\n`)

      // Загружаем настройки доступности
      const { data: availabilityData, error: fetchError } = await supabase
        .from('availabilities')
        .select('*')
        .eq('user_id', user.id)

      if (fetchError) {
        setDebugInfo(prev => prev + `❌ Ошибка загрузки: ${fetchError.message}\n`)
        throw new Error('Ошибка загрузки доступности: ' + fetchError.message)
      }

      setDebugInfo(prev => prev + `✅ Загружено записей: ${availabilityData?.length || 0}\n`)

      // Преобразуем данные в удобный формат
      const availabilityMap = {}
      
      if (availabilityData && availabilityData.length > 0) {
        availabilityData.forEach(item => {
          availabilityMap[item.day_of_week] = {
            enabled: item.is_active,
            start_time: item.start_time,
            end_time: item.end_time
          }
        })
      } else {
        // Устанавливаем значения по умолчанию (Пн-Пт 9:00-17:00)
        for (let i = 1; i <= 5; i++) {
          availabilityMap[i] = {
            enabled: true,
            start_time: '09:00',
            end_time: '17:00'
          }
        }
        availabilityMap[0] = { enabled: false, start_time: '09:00', end_time: '17:00' }
        availabilityMap[6] = { enabled: false, start_time: '09:00', end_time: '17:00' }
      }

      setAvailability(availabilityMap)
      setDebugInfo(prev => prev + '✅ Настройки загружены успешно\n')

    } catch (err) {
      console.error('Error loading availability:', err)
      setError(err.message)
      setDebugInfo(prev => prev + `❌ Ошибка: ${err.message}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDayToggle = (dayValue) => {
    setAvailability(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        enabled: !prev[dayValue]?.enabled
      }
    }))
  }

  const handleTimeChange = (dayValue, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        [field]: value
      }
    }))
  }

  const saveAvailability = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(false)
      setDebugInfo('Сохраняем настройки доступности...\n')

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error('Ошибка аутентификации: ' + userError.message)
      }

      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      // Удаляем старые записи
      setDebugInfo(prev => prev + 'Удаляем старые настройки...\n')
      const { error: deleteError } = await supabase
        .from('availabilities')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        setDebugInfo(prev => prev + `❌ Ошибка удаления: ${deleteError.message}\n`)
        throw new Error('Ошибка удаления старых настроек: ' + deleteError.message)
      }

      // Подготавливаем новые записи
      const availabilityRecords = []
      
      Object.entries(availability).forEach(([dayValue, settings]) => {
        if (settings && typeof settings === 'object') {
          availabilityRecords.push({
            user_id: user.id,
            day_of_week: parseInt(dayValue),
            start_time: settings.start_time || '09:00',
            end_time: settings.end_time || '17:00',
            is_active: Boolean(settings.enabled)
          })
        }
      })

      setDebugInfo(prev => prev + `Сохраняем ${availabilityRecords.length} записей...\n`)

      if (availabilityRecords.length > 0) {
        const { data, error: insertError } = await supabase
          .from('availabilities')
          .insert(availabilityRecords)
          .select()

        if (insertError) {
          setDebugInfo(prev => prev + `❌ Ошибка вставки: ${insertError.message}\n`)
          throw new Error('Ошибка сохранения настроек: ' + insertError.message)
        }

        setDebugInfo(prev => prev + `✅ Сохранено записей: ${data?.length || 0}\n`)
      }

      setSuccess(true)
      setDebugInfo(prev => prev + '🎉 Настройки сохранены успешно!\n')

      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      console.error('Error saving availability:', err)
      setError(err.message)
      setDebugInfo(prev => prev + `❌ Ошибка сохранения: ${err.message}\n`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-onboarding="availability-title">Доступность</h1>
          <p className="text-gray-600">Настройте свои рабочие часы</p>
        </div>
        <div className="bg-white rounded-lg border p-6" data-onboarding="availability-settings">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка настроек...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" data-onboarding="availability-title">Доступность</h1>
        <p className="text-gray-600">Настройте свои рабочие часы и дни</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <strong>Успешно!</strong> Настройки доступности сохранены
        </div>
      )}

      <div className="bg-white rounded-lg border p-6" data-onboarding="availability-settings">
        <h2 className="text-lg font-semibold mb-6">Рабочие часы</h2>
        
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const daySettings = availability[day.value] || { enabled: false, start_time: '09:00', end_time: '17:00' }
            
            return (
              <div key={day.value} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    id={`day-${day.value}`}
                    checked={daySettings.enabled}
                    onChange={() => handleDayToggle(day.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`day-${day.value}`} className="text-sm font-medium text-gray-900 w-24">
                    {day.name}
                  </label>
                </div>
                
                {daySettings.enabled && (
                  <div className="flex items-center space-x-2">
                    <select 
                      value={daySettings.start_time}
                      onChange={(e) => handleTimeChange(day.value, 'start_time', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <span className="text-gray-500">—</span>
                    <select 
                      value={daySettings.end_time}
                      onChange={(e) => handleTimeChange(day.value, 'end_time', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t">
          <button 
            onClick={saveAvailability}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Временная зона</h2>
        <select 
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md"
        >
          {TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* Журнал отладки */}
      {debugInfo && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-semibold mb-2">📋 Журнал выполнения:</h3>
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">{debugInfo}</pre>
        </div>
      )}
    </div>
  )
} 
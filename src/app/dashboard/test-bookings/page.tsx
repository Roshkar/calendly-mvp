// @ts-nocheck
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestBookingsPage() {
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const testCreateBooking = async () => {
    setIsLoading(true)
    setResult('Тестируем создание бронирования...\n')
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setResult(prev => prev + '❌ Пользователь не авторизован\n')
        return
      }
      
      setResult(prev => prev + `✅ Пользователь: ${user.email}\n`)
      
      const { data: events, error: eventsError } = await supabase
        .from('event_types')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
      
      if (eventsError) {
        setResult(prev => prev + `❌ Ошибка загрузки событий: ${eventsError.message}\n`)
        return
      }
      
      if (!events || events.length === 0) {
        setResult(prev => prev + '❌ Нет активных событий для тестирования\n')
        return
      }
      
      const event = events[0]
      setResult(prev => prev + `✅ Найдено событие: ${event.name} (ID: ${event.id})\n`)
      
      const bookingData = {
        event_type_id: event.id,
        invitee_name: 'Тестовый Пользователь',
        invitee_email: 'test@example.com',
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + event.duration_minutes * 60 * 1000).toISOString(),
        timezone: 'Europe/Moscow',
        status: 'confirmed'
      }
      
      setResult(prev => prev + `📤 Отправляем данные бронирования:\n${JSON.stringify(bookingData, null, 2)}\n`)
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
      
      if (bookingError) {
        setResult(prev => prev + `❌ Ошибка создания бронирования: ${bookingError.message}\n`)
        return
      }
      
      setResult(prev => prev + `✅ Бронирование создано успешно!\n`)
      setResult(prev => prev + `📋 Данные: ${JSON.stringify(booking, null, 2)}\n`)
      
    } catch (err) {
      setResult(prev => prev + `❌ Неожиданная ошибка: ${err.message}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  const testFetchBookings = async () => {
    setIsLoading(true)
    setResult('Тестируем загрузку бронирований...\n')
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setResult(prev => prev + '❌ Пользователь не авторизован\n')
        return
      }
      
      setResult(prev => prev + `✅ Пользователь: ${user.email}\n`)
      
      const { data: bookings, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          event_types!inner (
            id,
            name,
            duration_minutes,
            location_type,
            location_details,
            user_id
          )
        `)
        .eq('event_types.user_id', user.id)
        .order('start_time', { ascending: false })
      
      if (fetchError) {
        setResult(prev => prev + `❌ Ошибка загрузки бронирований: ${fetchError.message}\n`)
        return
      }
      
      setResult(prev => prev + `✅ Загружено бронирований: ${bookings?.length || 0}\n`)
      
      if (bookings && bookings.length > 0) {
        setResult(prev => prev + `📋 Данные бронирований:\n${JSON.stringify(bookings, null, 2)}\n`)
      } else {
        setResult(prev => prev + '📋 Бронирований не найдено\n')
      }
      
    } catch (err) {
      setResult(prev => prev + `❌ Неожиданная ошибка: ${err.message}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    setIsLoading(true)
    setResult('Тестируем подключение к базе данных...\n')
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setResult(prev => prev + '❌ Пользователь не авторизован\n')
        return
      }
      
      setResult(prev => prev + `✅ Пользователь авторизован: ${user.email}\n`)
      
      // Тест таблицы profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        setResult(prev => prev + `❌ Ошибка загрузки профиля: ${profileError.message}\n`)
      } else {
        setResult(prev => prev + `✅ Профиль загружен: ${profile.username}\n`)
      }
      
      // Тест таблицы event_types
      const { data: events, error: eventsError } = await supabase
        .from('event_types')
        .select('id, name, user_id')
        .eq('user_id', user.id)
      
      if (eventsError) {
        setResult(prev => prev + `❌ Ошибка загрузки событий: ${eventsError.message}\n`)
      } else {
        setResult(prev => prev + `✅ События загружены: ${events?.length || 0}\n`)
      }
      
      // Тест таблицы bookings (прямой запрос)
      const { data: allBookings, error: allBookingsError } = await supabase
        .from('bookings')
        .select('id, invitee_name, event_type_id')
        .limit(5)
      
      if (allBookingsError) {
        setResult(prev => prev + `❌ Ошибка загрузки всех бронирований: ${allBookingsError.message}\n`)
      } else {
        setResult(prev => prev + `✅ Всего бронирований в БД: ${allBookings?.length || 0}\n`)
      }
      
    } catch (err) {
      setResult(prev => prev + `❌ Неожиданная ошибка: ${err.message}\n`)
      console.error('Test error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResult = () => {
    setResult('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Тест бронирований</h1>
        <p className="text-gray-600">Диагностика создания и просмотра бронирований</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button 
            onClick={testDatabaseConnection}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '⏳ Тестируем...' : '🔍 Тест подключения'}
          </button>
          
          <button 
            onClick={testCreateBooking}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? '⏳ Создаем...' : '➕ Создать тестовое бронирование'}
          </button>
          
          <button 
            onClick={testFetchBookings}
            disabled={isLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? '⏳ Загружаем...' : '📋 Загрузить бронирования'}
          </button>
          
          <button 
            onClick={clearResult}
            disabled={isLoading}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            🗑️ Очистить
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-semibold mb-2">📋 Результат тестирования:</h3>
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96 min-h-24">
            {result || 'Нажмите кнопку для запуска теста...'}
          </pre>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Инструкции:</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
          <li>Сначала запустите "Тест подключения" для проверки доступа к БД</li>
          <li>Убедитесь, что у вас есть хотя бы одно активное событие</li>
          <li>Создайте тестовое бронирование</li>
          <li>Загрузите бронирования для проверки</li>
          <li>Перейдите на страницу "Бронирования" в навигации</li>
        </ol>
      </div>
    </div>
  )
} 
// @ts-nocheck
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function NewEventTypePage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    location: '',
    eventTypeCategory: 'individual',
    maxParticipants: 1
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  // Функция для генерации preview slug
  const generateShortId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.duration) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setDebugInfo('Начинаем создание события...\n')

    try {
      // Проверяем подключение к Supabase
      setDebugInfo(prev => prev + 'Проверяем Supabase подключение...\n')
      
      if (!supabase) {
        throw new Error('Supabase клиент не инициализирован')
      }
      
      setDebugInfo(prev => prev + '✅ Supabase клиент инициализирован\n')

      // Проверяем аутентификацию
      setDebugInfo(prev => prev + 'Проверяем аутентификацию...\n')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        setDebugInfo(prev => prev + `❌ Ошибка аутентификации: ${userError.message}\n`)
        throw new Error(`Ошибка аутентификации: ${userError.message}`)
      }

      if (!user) {
        setDebugInfo(prev => prev + '❌ Пользователь не авторизован\n')
        throw new Error('Пожалуйста, войдите в систему')
      }

      setDebugInfo(prev => prev + `✅ Пользователь авторизован: ${user.email}\n`)
      setDebugInfo(prev => prev + `✅ User ID: ${user.id}\n`)

      // Проверяем, есть ли профиль пользователя
      setDebugInfo(prev => prev + 'Проверяем профиль пользователя...\n')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // Профиль не найден - создаем его
        setDebugInfo(prev => prev + 'Профиль не найден, создаем новый...\n')
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            username: user.email?.split('@')[0] || 'user',
            first_name: user.user_metadata?.full_name?.split(' ')[0] || 'User',
            last_name: user.user_metadata?.full_name?.split(' ')[1] || '',
            timezone: 'Europe/Moscow'
          }])

        if (createProfileError) {
          setDebugInfo(prev => prev + `❌ Ошибка создания профиля: ${createProfileError.message}\n`)
          throw new Error(`Ошибка создания профиля: ${createProfileError.message}`)
        }
        setDebugInfo(prev => prev + '✅ Профиль создан\n')
      } else if (profileError) {
        setDebugInfo(prev => prev + `❌ Ошибка проверки профиля: ${profileError.message}\n`)
        throw new Error(`Ошибка проверки профиля: ${profileError.message}`)
      } else {
        setDebugInfo(prev => prev + '✅ Профиль найден\n')
      }

      // Генерируем короткий ID
      setDebugInfo(prev => prev + 'Генерируем короткий ID...\n')
      
      let shortId = generateShortId()
      let isUnique = false
      let attempts = 0
      
      while (!isUnique && attempts < 10) {
        const { data: existingEvent, error: checkError } = await supabase
          .from('event_types')
          .select('id')
          .eq('user_id', user.id)
          .eq('short_id', shortId)
          .single()

        if (checkError && checkError.code === 'PGRST116') {
          // Событие не найдено - ID уникален
          isUnique = true
          setDebugInfo(prev => prev + `✅ Короткий ID уникален: ${shortId}\n`)
        } else if (existingEvent) {
          // ID уже существует - генерируем новый
          shortId = generateShortId()
          attempts++
          setDebugInfo(prev => prev + `ID занят, генерируем новый: ${shortId}\n`)
        } else if (checkError) {
          throw new Error('Ошибка проверки ID: ' + checkError.message)
        }
      }

      if (!isUnique) {
        throw new Error('Не удалось сгенерировать уникальный ID после 10 попыток')
      }

      setDebugInfo(prev => prev + `✅ Финальный короткий ID: ${shortId}\n`)

      // Преобразуем location в нужный формат
      let location_type = 'online'
      let location_details = ''
      
      if (formData.location === 'zoom') {
        location_type = 'online'
        location_details = 'Zoom Meeting'
      } else if (formData.location === 'google-meet') {
        location_type = 'online'
        location_details = 'Google Meet'
      } else if (formData.location === 'phone') {
        location_type = 'phone'
      } else if (formData.location === 'office') {
        location_type = 'in_person'
        location_details = 'Office'
      }

      setDebugInfo(prev => prev + `✅ Настроено место: ${location_type} - ${location_details}\n`)

      // Подготавливаем данные для вставки
      const eventData = {
        user_id: user.id,
        name: formData.name,
        short_id: shortId,
        description: formData.description || null,
        duration_minutes: parseInt(formData.duration),
        location_type,
        location_details: location_details || null,
        event_type_category: formData.eventTypeCategory,
        max_participants: parseInt(formData.maxParticipants),
        color: '#3174ad',
        is_active: true
      }

      setDebugInfo(prev => prev + `✅ Данные подготовлены: ${JSON.stringify(eventData, null, 2)}\n`)

      // Вставляем в базу данных
      setDebugInfo(prev => prev + 'Вставляем в базу данных...\n')
      
      const { data, error: insertError } = await supabase
        .from('event_types')
        .insert([eventData])
        .select()

      if (insertError) {
        setDebugInfo(prev => prev + `❌ Ошибка вставки: ${insertError.message}\n`)
        setDebugInfo(prev => prev + `❌ Детали: ${JSON.stringify(insertError, null, 2)}\n`)
        throw new Error(`Ошибка при создании события: ${insertError.message}`)
      }

      setDebugInfo(prev => prev + `✅ Событие создано: ${JSON.stringify(data, null, 2)}\n`)

      // Store the new event type ID for availability setup
      if (data && data[0]) {
        localStorage.setItem('newEventTypeId', data[0].id)
        setDebugInfo(prev => prev + `✅ ID события сохранен: ${data[0].id}\n`)
      }

      setSuccess(true)
      setFormData({
        name: '',
        description: '',
        duration: '',
        location: '',
        eventTypeCategory: 'individual',
        maxParticipants: 1
      })
      
      // Перенаправляем на настройку доступности
      setTimeout(() => {
        window.location.href = '/dashboard/event-types/new/availability'
      }, 2000)

    } catch (err) {
      console.error('Error creating event:', err)
      setError(err.message || 'Произошла ошибка при создании события')
      setDebugInfo(prev => prev + `❌ Финальная ошибка: ${err.message}\n`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // No longer need slug preview
  }

  const testConnection = async () => {
    setDebugInfo('Тестируем подключение к Supabase...\n')
    
    try {
      if (!supabase) {
        setDebugInfo(prev => prev + '❌ Supabase клиент не найден\n')
        return
      }

      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setDebugInfo(prev => prev + `❌ Ошибка аутентификации: ${error.message}\n`)
        return
      }

      if (!user) {
        setDebugInfo(prev => prev + '❌ Пользователь не авторизован\n')
        return
      }

      setDebugInfo(prev => prev + `✅ Подключение работает\n`)
      setDebugInfo(prev => prev + `✅ Пользователь: ${user.email}\n`)

      // Тестируем доступ к таблице
      const { data, error: tableError } = await supabase
        .from('event_types')
        .select('count')
        .eq('user_id', user.id)

      if (tableError) {
        setDebugInfo(prev => prev + `❌ Ошибка доступа к таблице: ${tableError.message}\n`)
      } else {
        setDebugInfo(prev => prev + `✅ Доступ к таблице event_types работает\n`)
      }

    } catch (err) {
      setDebugInfo(prev => prev + `❌ Ошибка тестирования: ${err.message}\n`)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Событие создано!</h2>
          <p className="text-green-700">Перенаправляем на страницу со списком событий...</p>
        </div>
        
        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Журнал создания:</h3>
            <pre className="whitespace-pre-wrap text-sm">{debugInfo}</pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Создать новое событие</h1>
        <p className="text-gray-600">Настройте параметры вашего события</p>
      </div>

      {/* Кнопка тестирования */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">🔧 Диагностика</h3>
        <button
          type="button"
          onClick={testConnection}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          Проверить подключение к Supabase
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма */}
        <div className="bg-white rounded-lg border p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              <strong>Ошибка:</strong> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Название события *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Например: Встреча 1-на-1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Опишите цель встречи..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Длительность *
              </label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите длительность</option>
                <option value="15">15 минут</option>
                <option value="30">30 минут</option>
                <option value="45">45 минут</option>
                <option value="60">1 час</option>
                <option value="90">1.5 часа</option>
                <option value="120">2 часа</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Место проведения
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите место</option>
                <option value="zoom">Zoom встреча</option>
                <option value="google-meet">Google Meet</option>
                <option value="phone">Телефонный звонок</option>
                <option value="office">В офисе</option>
              </select>
            </div>

            <div>
              <label htmlFor="eventTypeCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Тип события
              </label>
              <select
                id="eventTypeCategory"
                name="eventTypeCategory"
                value={formData.eventTypeCategory}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="individual">👤 Индивидуальное (1-на-1)</option>
                <option value="group">👥 Групповое</option>
              </select>
            </div>

            {formData.eventTypeCategory === 'group' && (
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  Максимальное количество участников
                </label>
                <select
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2">2 участника</option>
                  <option value="3">3 участника</option>
                  <option value="4">4 участника</option>
                  <option value="5">5 участников</option>
                  <option value="6">6 участников</option>
                  <option value="8">8 участников</option>
                  <option value="10">10 участников</option>
                  <option value="15">15 участников</option>
                  <option value="20">20 участников</option>
                </select>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => window.location.href = '/dashboard/event-types'}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Создание...' : 'Создать событие'}
              </button>
            </div>
          </form>
        </div>

        {/* Журнал отладки */}
        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-semibold mb-2">📋 Журнал выполнения:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  )
} 
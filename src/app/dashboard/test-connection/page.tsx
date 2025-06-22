// @ts-nocheck
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestConnectionPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult('')

    try {
      // Проверяем подключение к Supabase
      setResult('Проверяем подключение к Supabase...\n')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        setResult(prev => prev + `❌ Ошибка аутентификации: ${userError.message}\n`)
        return
      }

      if (!user) {
        setResult(prev => prev + '❌ Пользователь не авторизован\n')
        return
      }

      setResult(prev => prev + `✅ Пользователь авторизован: ${user.email}\n`)
      setResult(prev => prev + `✅ User ID: ${user.id}\n`)

      // Проверяем подключение к таблице event_types
      setResult(prev => prev + '\nПроверяем доступ к таблице event_types...\n')
      
      const { data: eventTypes, error: fetchError } = await supabase
        .from('event_types')
        .select('*')
        .eq('user_id', user.id)

      if (fetchError) {
        setResult(prev => prev + `❌ Ошибка загрузки событий: ${fetchError.message}\n`)
        setResult(prev => prev + `❌ Детали ошибки: ${JSON.stringify(fetchError, null, 2)}\n`)
        return
      }

      setResult(prev => prev + `✅ Таблица event_types доступна\n`)
      setResult(prev => prev + `✅ Найдено событий: ${eventTypes?.length || 0}\n`)

      if (eventTypes && eventTypes.length > 0) {
        setResult(prev => prev + `✅ События: ${JSON.stringify(eventTypes, null, 2)}\n`)
      }

      // Тестируем создание события
      setResult(prev => prev + '\nТестируем создание события...\n')
      
      const testEvent = {
        user_id: user.id,
        name: 'Тестовое событие',
        slug: 'test-event-' + Date.now(),
        description: 'Тестовое описание',
        duration_minutes: 30,
        location_type: 'online',
        location_details: 'Zoom Meeting',
        color: '#3174ad',
        is_active: true
      }

      const { data: newEvent, error: createError } = await supabase
        .from('event_types')
        .insert([testEvent])
        .select()

      if (createError) {
        setResult(prev => prev + `❌ Ошибка создания события: ${createError.message}\n`)
        setResult(prev => prev + `❌ Детали ошибки: ${JSON.stringify(createError, null, 2)}\n`)
        return
      }

      setResult(prev => prev + `✅ Событие успешно создано!\n`)
      setResult(prev => prev + `✅ Новое событие: ${JSON.stringify(newEvent, null, 2)}\n`)

      // Удаляем тестовое событие
      if (newEvent && newEvent[0]) {
        const { error: deleteError } = await supabase
          .from('event_types')
          .delete()
          .eq('id', newEvent[0].id)

        if (deleteError) {
          setResult(prev => prev + `❌ Ошибка удаления тестового события: ${deleteError.message}\n`)
        } else {
          setResult(prev => prev + `✅ Тестовое событие удалено\n`)
        }
      }

      setResult(prev => prev + '\n🎉 Все тесты пройдены успешно!\n')

    } catch (error) {
      setResult(prev => prev + `❌ Неожиданная ошибка: ${error.message}\n`)
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkTables = async () => {
    setLoading(true)
    setResult('')

    try {
      setResult('Проверяем структуру таблиц...\n')

      // Проверяем таблицу profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (profilesError) {
        setResult(prev => prev + `❌ Таблица profiles: ${profilesError.message}\n`)
      } else {
        setResult(prev => prev + `✅ Таблица profiles доступна\n`)
      }

      // Проверяем таблицу event_types
      const { data: eventTypes, error: eventTypesError } = await supabase
        .from('event_types')
        .select('*')
        .limit(1)

      if (eventTypesError) {
        setResult(prev => prev + `❌ Таблица event_types: ${eventTypesError.message}\n`)
      } else {
        setResult(prev => prev + `✅ Таблица event_types доступна\n`)
      }

    } catch (error) {
      setResult(prev => prev + `❌ Ошибка проверки таблиц: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Диагностика Supabase</h1>
        <p className="text-gray-600">Проверка подключения и функциональности</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mr-4"
        >
          {loading ? 'Тестирую...' : 'Полный тест подключения'}
        </button>

        <button
          onClick={checkTables}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Проверяю...' : 'Проверить таблицы'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Результат:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
} 
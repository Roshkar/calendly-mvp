'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')

  const runMigration = async () => {
    setIsLoading(true)
    setResult('Выполняется миграция...\n')
    
    try {
      // Проверяем текущий статус RLS
      const { data: currentStatus, error: statusError } = await supabase
        .from('bookings')
        .select('id')
        .limit(1)
      
      setResult(prev => prev + `Тест доступа к bookings: ${statusError ? 'ОШИБКА' : 'ОК'}\n`)
      
      if (statusError) {
        setResult(prev => prev + `Ошибка: ${statusError.message}\n`)
        setResult(prev => prev + `Код ошибки: ${statusError.code}\n`)
        
        if (statusError.code === '42501') {
          setResult(prev => prev + '❌ RLS блокирует доступ - нужно отключить\n')
        }
      } else {
        setResult(prev => prev + '✅ RLS уже отключен или настроен правильно\n')
      }
      
      // Пытаемся создать тестовое бронирование
      const testBooking = {
        event_type_id: 'd4629313-bcd3-4ad9-bf0f-e568201b2331', // Используем реальный ID из логов
        invitee_name: 'Test Migration User',
        invitee_email: 'test-migration@example.com',
        start_time: '2024-12-25T10:00:00',
        end_time: '2024-12-25T10:30:00',
        timezone: 'Europe/Moscow',
        status: 'confirmed'
      }
      
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([testBooking])
        .select()
      
      if (bookingError) {
        setResult(prev => prev + `❌ Тест создания бронирования не удался: ${bookingError.message}\n`)
        setResult(prev => prev + `Код ошибки: ${bookingError.code}\n`)
      } else {
        setResult(prev => prev + `✅ Тест создания бронирования успешен! ID: ${bookingData[0]?.id}\n`)
        
        // Удаляем тестовое бронирование
        await supabase
          .from('bookings')
          .delete()
          .eq('id', bookingData[0].id)
        
        setResult(prev => prev + '🧹 Тестовое бронирование удалено\n')
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Неожиданная ошибка: ${error.message}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🔧 Миграция RLS</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Эта страница поможет диагностировать и исправить проблемы с Row Level Security для таблицы bookings.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Если RLS блокирует доступ:</h3>
              <p className="text-yellow-700 text-sm">
                Перейдите в Supabase Dashboard → SQL Editor и выполните:
              </p>
              <code className="block bg-yellow-100 p-2 mt-2 rounded text-sm">
                ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
              </code>
            </div>
            
            <button
              onClick={runMigration}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Тестируется...' : '🧪 Тест RLS и бронирований'}
            </button>
          </div>
          
          {result && (
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-semibold mb-2">📋 Результат тестирования:</h3>
              <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
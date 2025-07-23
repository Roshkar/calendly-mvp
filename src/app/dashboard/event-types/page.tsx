// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchEventTypes()
  }, [])

  const fetchEventTypes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Пожалуйста, войдите в систему')
        return
      }

      // Загружаем профиль пользователя
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        // Используем fallback username из email
        setUserProfile({ username: user.email.split('@')[0] })
      } else {
        setUserProfile(profile)
      }

      const { data, error: fetchError } = await supabase
        .from('event_types')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching event types:', fetchError)
        setError('Ошибка загрузки событий: ' + fetchError.message)
        return
      }

      console.log('🔍 Loaded event types:', data)
      console.log('🔍 First event type:', data?.[0])
      setEventTypes(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError('Произошла ошибка при загрузке событий')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Вы уверены, что хотите удалить "${name}"?`)) {
      try {
        const { error: deleteError } = await supabase
          .from('event_types')
          .delete()
          .eq('id', id)

        if (deleteError) {
          alert('Ошибка при удалении события: ' + deleteError.message)
          return
        }

        // Обновляем список
        setEventTypes(prev => prev.filter(et => et.id !== id))
        alert('Событие удалено')
      } catch (err) {
        console.error('Error deleting:', err)
        alert('Ошибка при удалении события')
      }
    }
  }

  const testBookingLink = (eventType) => {
    const baseUrl = window.location.origin
    
    // Используем query параметры как в main branch
    const bookingUrl = `${baseUrl}/booking?event=${eventType.short_id}`
    
    console.log('🔗 Тестируем ссылку с query параметрами:', bookingUrl)
    console.log('📊 Данные события:', eventType)
    console.log('👤 Профиль пользователя:', userProfile)
    
    // Открываем ссылку в новой вкладке
    window.open(bookingUrl, '_blank')
  }

  const getEventTypeIcon = (eventType) => {
    if (eventType.event_type_category === 'group') {
      return '👥'
    }
    return '👤'
  }

  const getEventTypeLabel = (eventType) => {
    if (eventType.event_type_category === 'group') {
      return `Групповое (до ${eventType.max_participants} чел.)`
    }
    return 'Индивидуальное'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-onboarding="event-types-title">Типы событий</h1>
            <p className="text-gray-600">Управляйте своими типами встреч</p>
          </div>
          <a 
            href="/dashboard/event-types/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            data-onboarding="new-event-button"
          >
            <span>+</span>
            <span>Создать событие</span>
          </a>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-onboarding="event-types-title">Типы событий</h1>
            <p className="text-gray-600">Управляйте своими типами встреч</p>
          </div>
          <a 
            href="/dashboard/event-types/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            data-onboarding="new-event-button"
          >
            <span>+</span>
            <span>Создать событие</span>
          </a>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-medium">Ошибка загрузки</div>
            <p className="text-gray-600 mt-2">{error}</p>
            <button 
              onClick={fetchEventTypes}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-onboarding="event-types-title">Типы событий</h1>
          <p className="text-gray-600">Управляйте своими типами встреч</p>
        </div>
        <a 
          href="/dashboard/event-types/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          data-onboarding="new-event-button"
        >
          <span>+</span>
          <span>Создать событие</span>
        </a>
      </div>

      {/* Диагностическая информация */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">🔍 Диагностика профиля</h3>
        <div className="text-sm text-blue-800">
          <p><strong>Username:</strong> {userProfile?.username || 'не установлен'}</p>
          <p><strong>Fallback username:</strong> {userProfile?.username || 'из email не найден'}</p>
        </div>
      </div>

      {eventTypes.length === 0 ? (
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет событий</h3>
            <p className="text-gray-600 mb-6">Создайте свое первое событие для начала работы</p>
            <a 
              href="/dashboard/event-types/new"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
            >
              Создать событие
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {eventTypes.map((eventType) => (
            <div key={eventType.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: eventType.color }}
                    ></div>
                    <button
                      onClick={() => {
                        localStorage.setItem('newEventTypeId', eventType.id)
                        window.location.href = '/dashboard/event-types/new/availability'
                      }}
                      className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {eventType.name}
                    </button>
                    {/* Иконка типа события */}
                    <span className="text-lg" title={getEventTypeLabel(eventType)}>
                      {getEventTypeIcon(eventType)}
                    </span>
                  </div>
                  
                  {eventType.description && (
                    <p className="text-gray-600 mt-2">{eventType.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span>📅 {eventType.duration_minutes} мин</span>
                    <span>
                      {eventType.location_type === 'online' && '💻 Онлайн'}
                      {eventType.location_type === 'in_person' && '🏢 Лично'}
                      {eventType.location_type === 'phone' && '📞 Телефон'}
                    </span>
                    {eventType.location_details && (
                      <span>• {eventType.location_details}</span>
                    )}
                    {/* Тип события */}
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {getEventTypeLabel(eventType)}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${eventType.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {eventType.is_active ? 'Активно' : 'Неактивно'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                                        {/* Предварительный просмотр ссылки */}
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded max-w-xs truncate">
                        booking?event={eventType.short_id}
                      </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        localStorage.setItem('newEventTypeId', eventType.id)
                        window.location.href = '/dashboard/event-types/new/availability'
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      📅 Настроить время
                    </button>
                    
                    <button 
                      onClick={() => testBookingLink(eventType)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      🧪 Тест ссылки
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          const baseUrl = window.location.origin
                          // Используем query параметры для обхода проблем с маршрутизацией
                          const bookingUrl = `${baseUrl}/booking?event=${eventType.short_id}`
                          navigator.clipboard.writeText(bookingUrl)
                            
                          // Улучшенное уведомление
                          const button = event.target
                          const originalText = button.textContent
                          button.textContent = '✓ Скопировано!'
                          button.style.color = '#10b981'
                          
                          setTimeout(() => {
                            button.textContent = originalText
                            button.style.color = ''
                          }, 2000)
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        📋 Копировать ссылку
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(eventType.id, eventType.name)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
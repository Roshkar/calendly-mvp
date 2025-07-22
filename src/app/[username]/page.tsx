'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  console.log('🔍 UserProfilePage loaded with params:', params)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [eventTypes, setEventTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadUserProfile()
  }, [params.username])

  const loadUserProfile = async () => {
    console.log('🔍 loadUserProfile called')
    try {
      setIsLoading(true)
      setError(null)

      // Загружаем профиль пользователя по username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single()

      if (profileError) {
        throw new Error('Пользователь не найден')
      }

      setUserProfile(profile)

      // Загружаем активные события пользователя
      console.log('🔍 Loading events for user:', profile.id)
      const { data: events, error: eventsError } = await supabase
        .from('event_types')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (eventsError) {
        console.error('Error loading events:', eventsError)
        setEventTypes([])
      } else {
        console.log('🔍 Loaded events:', events)
        console.log('🔍 First event short_id:', events?.[0]?.short_id)
        console.log('🔍 First event full data:', events?.[0])
        console.log('🔍 All event short_ids:', events?.map(e => ({ id: e.id, name: e.name, short_id: e.short_id })))
        
        // Проверяем, что у всех событий есть short_id
        const eventsWithShortId = events?.filter(e => e.short_id) || []
        const eventsWithoutShortId = events?.filter(e => !e.short_id) || []
        
        console.log('🔍 Events with short_id:', eventsWithShortId.length)
        console.log('🔍 Events without short_id:', eventsWithoutShortId.length)
        
        if (eventsWithoutShortId.length > 0) {
          console.error('❌ Events missing short_id:', eventsWithoutShortId)
        }
        
        setEventTypes(events || [])
      }

    } catch (err: any) {
      console.error('❌ Error loading profile:', err)
      setError(err.message)
    } finally {
      console.log('🔍 loadUserProfile finished, isLoading:', false)
      setIsLoading(false)
    }
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
    return 'Индивидуальное'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка профиля...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <div className="text-red-600 text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Пользователь не найден</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link 
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                На главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userProfile.first_name} {userProfile.last_name}
              </h1>
              <p className="text-gray-600">@{userProfile.username}</p>
              {userProfile.timezone && (
                <p className="text-sm text-gray-500">Часовой пояс: {userProfile.timezone}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {eventTypes.length === 0 ? (
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет доступных событий</h3>
              <p className="text-gray-600">
                У этого пользователя пока нет активных событий для бронирования
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Доступные события для бронирования
              </h2>
              <p className="text-gray-600 mb-6">
                Выберите событие, которое хотите забронировать
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="col-span-2 bg-yellow-100 p-4 rounded-lg">
                <p className="text-sm">Debug: Found {eventTypes.length} events</p>
                <p className="text-sm">First event short_id: {eventTypes[0]?.short_id || 'NOT FOUND'}</p>
              </div>
              {eventTypes.map((eventType) => (
                <div key={eventType.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: eventType.color }}
                      ></div>
                      <h3 className="text-lg font-medium text-gray-900">{eventType.name}</h3>
                      <span className="text-lg" title={getEventTypeLabel(eventType)}>
                        {getEventTypeIcon(eventType)}
                      </span>
                    </div>
                  </div>

                  {eventType.description && (
                    <p className="text-gray-600 mb-4">{eventType.description}</p>
                  )}

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>⏰</span>
                      <span>{eventType.duration_minutes} минут</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>
                        {eventType.location_type === 'online' && '💻'}
                        {eventType.location_type === 'in_person' && '🏢'}
                        {eventType.location_type === 'phone' && '📞'}
                      </span>
                      <span>
                        {eventType.location_details || 
                         (eventType.location_type === 'online' ? 'Онлайн встреча' : 
                          eventType.location_type === 'phone' ? 'Телефонный звонок' : 'Личная встреча')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {getEventTypeLabel(eventType)}
                      </span>
                    </div>
                  </div>

                  {eventType.short_id ? (
                    <>
                      <Link
                        href={`/book/${params.username}/${eventType.short_id}`}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                      >
                        Забронировать время
                      </Link>
                      <div className="mt-2 text-xs text-gray-500">
                        Short ID: {eventType.short_id}<br/>
                        Booking URL: /book/{params.username}/{eventType.short_id}
                      </div>
                    </>
                  ) : (
                    <div className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg text-center block">
                      ❌ Ошибка: отсутствует Short ID
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>Создано с помощью Calendly MVP</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
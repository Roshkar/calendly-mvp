// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
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
        .select('username, first_name, last_name')
        .eq('id', user.id)
        .single()

      if (!profileError) {
        setUserProfile(profile)
      }

      // Загружаем бронирования для событий пользователя
      const { data, error: fetchError } = await (supabase as any)
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
        console.error('Error fetching bookings:', fetchError)
        setError('Ошибка загрузки бронирований: ' + fetchError.message)
        return
      }

      console.log('📅 Загруженные бронирования:', data)
      setBookings(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError('Произошла ошибка при загрузке бронирований')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('ru-RU', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено'
      case 'pending': return 'Ожидает'
      case 'cancelled': return 'Отменено'
      default: return status
    }
  }

  const handleCancelBooking = async (bookingId, inviteeName) => {
    if (window.confirm(`Отменить встречу с ${inviteeName}?`)) {
      try {
        const { error: updateError } = await (supabase as any)
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId)

        if (updateError) {
          alert('Ошибка при отмене бронирования: ' + updateError.message)
          return
        }

        // Обновляем список
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        ))
        
        alert('Встреча отменена')
      } catch (err) {
        console.error('Error cancelling booking:', err)
        alert('Ошибка при отмене встречи')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-onboarding="bookings-title">Бронирования</h1>
          <p className="text-gray-600">Управляйте своими встречами</p>
        </div>
        <div className="bg-white rounded-lg border p-6" data-onboarding="bookings-content">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка бронирований...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-onboarding="bookings-title">Бронирования</h1>
          <p className="text-gray-600">Управляйте своими встречами</p>
        </div>
        <div className="bg-white rounded-lg border p-6" data-onboarding="bookings-content">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-medium">Ошибка загрузки</div>
            <p className="text-gray-600 mt-2">{error}</p>
            <button 
              onClick={fetchBookings}
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900" data-onboarding="bookings-title">Бронирования</h1>
        <p className="text-gray-600">Управляйте своими встречами</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
          <div className="text-sm text-gray-600">Всего встреч</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {bookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-600">Подтверждено</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {bookings.filter(b => b.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Ожидает</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">
            {bookings.filter(b => b.status === 'cancelled').length}
          </div>
          <div className="text-sm text-gray-600">Отменено</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border" data-onboarding="bookings-content">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ваши встречи</h2>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                📅
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет бронирований</h3>
              <p className="text-gray-600 mb-4">Пока никто не забронировал ваши события</p>
              <a 
                href="/dashboard/event-types"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Создать событие
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const dateTime = formatDateTime(booking.start_time)
                return (
                  <div key={booking.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {booking.event_types.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <span>👤</span>
                            <span><strong>{booking.invitee_name}</strong> ({booking.invitee_email})</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span>📅</span>
                            <span>{dateTime.date} в {dateTime.time}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span>⏰</span>
                            <span>{booking.event_types.duration_minutes} минут</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span>
                              {booking.event_types.location_type === 'online' && '💻'}
                              {booking.event_types.location_type === 'in_person' && '🏢'}
                              {booking.event_types.location_type === 'phone' && '📞'}
                            </span>
                            <span>
                              {booking.event_types.location_details || 
                               (booking.event_types.location_type === 'online' ? 'Онлайн встреча' : 
                                booking.event_types.location_type === 'phone' ? 'Телефонный звонок' : 'Личная встреча')}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span>🌍</span>
                            <span>{booking.timezone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-xs text-gray-500">
                          ID: {booking.id.substring(0, 8)}...
                        </div>
                        
                        {booking.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCancelBooking(booking.id, booking.invitee_name)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            ❌ Отменить
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
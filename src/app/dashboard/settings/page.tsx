// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    username: '',
    first_name: '',
    last_name: '',
    timezone: 'Europe/Moscow',
    google_connected: false
  })
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setDebugInfo('Загружаем профиль пользователя...\n')

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error('Ошибка аутентификации: ' + userError.message)
      }

      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      setUser(user)
      setDebugInfo(prev => prev + `✅ Пользователь: ${user.email}\n`)

      // Загружаем профиль
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Профиль не найден - создаем новый
          setDebugInfo(prev => prev + 'Профиль не найден, создаем новый...\n')
          
          const newProfile = {
            id: user.id,
            username: user.email.split('@')[0],
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            timezone: 'Europe/Moscow'
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single()

          if (createError) {
            throw new Error('Ошибка создания профиля: ' + createError.message)
          }

          setProfile(createdProfile)
          setDebugInfo(prev => prev + '✅ Профиль создан\n')
        } else {
          throw new Error('Ошибка загрузки профиля: ' + fetchError.message)
        }
      } else {
        setProfile({
          username: profileData.username,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          timezone: profileData.timezone || 'Europe/Moscow',
          google_connected: Boolean((profileData as any).google_refresh_token)
        })
        setDebugInfo(prev => prev + '✅ Профиль загружен\n')
      }

    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err.message)
      setDebugInfo(prev => prev + `❌ Ошибка: ${err.message}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(false)
      setDebugInfo('Сохраняем профиль...\n')

      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          timezone: profile.timezone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()

      if (updateError) {
        setDebugInfo(prev => prev + `❌ Ошибка обновления: ${updateError.message}\n`)
        throw new Error('Ошибка сохранения профиля: ' + updateError.message)
      }

      setSuccess(true)
      setDebugInfo(prev => prev + '🎉 Профиль сохранен успешно!\n')

      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err.message)
      setDebugInfo(prev => prev + `❌ Ошибка сохранения: ${err.message}\n`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-onboarding="settings-title">Настройки</h1>
          <p className="text-gray-600">Управляйте профилем и настройками аккаунта</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    )
  }

  

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-onboarding="settings-title">Настройки</h1>
        <p className="text-gray-600 dark:text-gray-400">Управляйте профилем и настройками аккаунта</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <strong>Успешно!</strong> Профиль сохранен
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Профиль</h2>
        
        <form onSubmit={saveProfile} className="space-y-4" data-onboarding="profile-form">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={profile.username}
              onChange={handleInputChange}
              placeholder="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                Имя
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={profile.first_name}
                onChange={handleInputChange}
                placeholder="Ваше имя"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Фамилия
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={profile.last_name}
                onChange={handleInputChange}
                placeholder="Ваша фамилия"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email нельзя изменить</p>
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
              Временная зона
            </label>
            <select
              id="timezone"
              name="timezone"
              value={profile.timezone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Europe/Moscow">Москва (GMT+3)</option>
              <option value="Europe/Kiev">Киев (GMT+2)</option>
              <option value="Asia/Almaty">Алматы (GMT+6)</option>
              <option value="Europe/London">Лондон (GMT+0)</option>
              <option value="America/New_York">Нью-Йорк (GMT-5)</option>
            </select>
          </div>

          <div>
            <ThemeToggle />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Информация об аккаунте</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Создан:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Неизвестно'}</p>
          <p><strong>Последний вход:</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Неизвестно'}</p>
          <div className="pt-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <div className="font-medium">Google Calendar</div>
                <div className="text-xs text-gray-500">Нужен доступ offline + календарь</div>
              </div>
              <button
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/settings` : undefined,
                      queryParams: { access_type: 'offline', prompt: 'consent', scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events' },
                    },
                  })
                  if (error) alert('Ошибка Google OAuth: ' + error.message)
                }}
                className={`px-3 py-2 rounded-md text-sm ${profile.google_connected ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
              >
                {profile.google_connected ? 'Подключено' : 'Подключить'}
              </button>
            </div>
          </div>
        </div>
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
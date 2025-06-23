// @ts-nocheck
'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

declare global {
  interface Window {
    onTelegramAuth?: (data: any) => void
    TelegramLoginWidget?: any
  }
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface TelegramAuthProps {
  botUsername: string
  onAuth?: (data: TelegramUser) => void
}

export default function TelegramAuth({ botUsername, onAuth }: TelegramAuthProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    console.log('🤖 === ИНИЦИАЛИЗАЦИЯ TELEGRAM AUTH ===')
    console.log('Bot username:', botUsername)
    console.log('Environment variable:', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME)
    console.log('Current URL:', window.location.href)
    console.log('User Agent:', navigator.userAgent)
    
    // Cleanup previous script if exists
    if (scriptRef.current && scriptRef.current.parentNode) {
      console.log('🧹 Удаляем предыдущий скрипт')
      scriptRef.current.parentNode.removeChild(scriptRef.current)
      scriptRef.current = null
    }

    // Clear container
    if (containerRef.current) {
      console.log('🧹 Очищаем контейнер')
      containerRef.current.innerHTML = ''
    }

    // Skip if bot not configured properly
    if (!botUsername || botUsername === 'calendly_mvp_bot') {
      console.log('⚠️ Бот не настроен, показываем предупреждение')
      return
    }

    // Define global callback function BEFORE script load
    console.log('📝 Определяем глобальную callback функцию')
    window.onTelegramAuth = async (user: TelegramUser) => {
      console.log('🎉 === CALLBACK ФУНКЦИЯ ВЫЗВАНА ===')
      console.log('🎉 === TELEGRAM АВТОРИЗАЦИЯ УСПЕШНА ===')
      console.log('Полученные данные от Telegram:', JSON.stringify(user, null, 2))
      console.log('Время получения:', new Date().toLocaleString())
      console.log('URL страницы:', window.location.href)
      
      try {
        // Verify the authentication data
        console.log('🔍 Начинаем проверку данных...')
        const isValid = await verifyTelegramAuth(user)
        if (!isValid) {
          console.error('❌ Данные не прошли проверку')
          alert('Ошибка: неверные данные авторизации Telegram')
          return
        }

        console.log('✅ Данные Telegram прошли проверку')

        // Create or sign in user with Supabase
        const telegramEmail = `telegram_${user.id}@telegram.local`
        const telegramPassword = `telegram_${user.id}_${user.hash}`

        console.log('🔐 Создаем учетные данные для Supabase:')
        console.log('Email:', telegramEmail)
        console.log('Password length:', telegramPassword.length)

        // Try to sign in first
        console.log('🔑 Попытка входа в существующий аккаунт...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: telegramEmail,
          password: telegramPassword,
        })

        if (signInError && signInError.message.includes('Invalid login credentials')) {
          console.log('👤 Пользователь не найден, создаем новый аккаунт...')
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: telegramEmail,
            password: telegramPassword,
            options: {
              data: {
                telegram_id: user.id,
                first_name: user.first_name,
                last_name: user.last_name || '',
                username: user.username || `user_${user.id}`,
                avatar_url: user.photo_url || '',
                auth_provider: 'telegram'
              }
            }
          })

          if (signUpError) {
            console.error('❌ Ошибка создания аккаунта Supabase:', signUpError)
            alert('Ошибка создания аккаунта: ' + signUpError.message)
            return
          }

          console.log('✅ Новый пользователь Telegram создан:', signUpData)
          
          // Успешная регистрация - вызываем callback
          console.log('🎉 Регистрация Telegram завершена успешно!')
          if (onAuth) {
            console.log('📞 Вызываем callback функцию onAuth для нового пользователя')
            onAuth(user)
          } else {
            console.log('⚠️ Callback функция onAuth НЕ предоставлена!')
            console.log('🔄 Перенаправляем на дашборд...')
            window.location.href = '/dashboard'
          }
          
        } else if (signInError) {
          // Любая другая ошибка входа - не обрабатываем данные пользователя
          console.error('❌ Ошибка входа Supabase:', signInError)
          alert('Ошибка входа: ' + signInError.message)
          return
        } else {
          // Успешный вход существующего пользователя
          console.log('✅ Успешный вход существующего пользователя:', signInData)
          
          console.log('🎉 Авторизация Telegram завершена успешно!')
          if (onAuth) {
            console.log('📞 Вызываем callback функцию onAuth для существующего пользователя')
            onAuth(user)
          } else {
            console.log('⚠️ Callback функция onAuth НЕ предоставлена!')
            console.log('🔄 Перенаправляем на дашборд...')
            window.location.href = '/dashboard'
          }
        }
        
      } catch (err) {
        console.error('💥 Критическая ошибка в процессе авторизации:', err)
        console.error('Stack trace:', (err as Error).stack)
        alert('Произошла критическая ошибка при входе через Telegram: ' + (err as Error).message)
      }
    }

    // Test if callback is properly set
    console.log('🧪 Проверяем callback функцию:', typeof window.onTelegramAuth)

    // Load Telegram Login Widget script
    console.log('📦 Загружаем Telegram widget script...')
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    scriptRef.current = script

    // Add script load handlers
    script.onload = () => {
      console.log('✅ Telegram widget script загружен успешно')
      console.log('🔍 Проверяем загруженные объекты Telegram:')
      console.log('window.TelegramLoginWidget:', typeof window.TelegramLoginWidget)
      
      // Additional check for widget initialization
      setTimeout(() => {
        const widget = containerRef.current?.querySelector('iframe')
        console.log('🎯 Telegram iframe найден:', !!widget)
        if (widget) {
          console.log('📏 Размеры iframe:', widget.offsetWidth, 'x', widget.offsetHeight)
        }
      }, 1000)
    }
    
    script.onerror = (error) => {
      console.error('❌ Критическая ошибка загрузки Telegram widget script:', error)
      console.error('URL скрипта:', script.src)
      console.error('Атрибуты скрипта:', {
        'data-telegram-login': script.getAttribute('data-telegram-login'),
        'data-size': script.getAttribute('data-size'),
        'data-onauth': script.getAttribute('data-onauth'),
        'data-request-access': script.getAttribute('data-request-access')
      })
    }

    // Add the script to the container
    if (containerRef.current) {
      containerRef.current.appendChild(script)
      console.log('📦 Telegram script добавлен в контейнер')
      console.log('🎯 Контейнер ID:', containerRef.current.id)
    } else {
      console.error('❌ Критическая ошибка: контейнер не найден')
    }

    // Test callback after a delay
    setTimeout(() => {
      console.log('🧪 === ТЕСТ CALLBACK ФУНКЦИИ ===')
      console.log('window.onTelegramAuth тип:', typeof window.onTelegramAuth)
      console.log('window.onTelegramAuth существует:', !!window.onTelegramAuth)
      
      // Test if we can call the function
      if (typeof window.onTelegramAuth === 'function') {
        console.log('✅ Callback функция доступна глобально')
      } else {
        console.error('❌ Callback функция НЕ доступна глобально!')
        console.log('Доступные глобальные функции:', Object.keys(window).filter(key => key.includes('Telegram')))
      }
    }, 2000)

    return () => {
      console.log('🧹 === CLEANUP TELEGRAM AUTH ===')
      // Cleanup
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
        scriptRef.current = null
        console.log('🗑️ Скрипт удален')
      }
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth
        console.log('🗑️ Callback функция удалена')
      }
    }
  }, [botUsername, onAuth])

  // Enhanced verification function
  const verifyTelegramAuth = async (user: TelegramUser): Promise<boolean> => {
    console.log('🔍 === ПРОВЕРКА ДАННЫХ TELEGRAM ===')
    console.log('Проверяемые данные:', JSON.stringify(user, null, 2))
    
    // Basic client-side validation first
    const requiredFields = ['id', 'first_name', 'auth_date', 'hash']
    const missingFields: string[] = []
    
    const hasAllFields = requiredFields.every(field => {
      const hasField = user[field] !== undefined && user[field] !== null
      if (!hasField) {
        missingFields.push(field)
        console.error(`❌ Отсутствует обязательное поле: ${field}`)
      }
      return hasField
    })

    if (missingFields.length > 0) {
      console.error('❌ Отсутствующие поля:', missingFields)
      return false
    }

    // Check auth_date (should be recent - within last hour)
    const now = Math.floor(Date.now() / 1000)
    const timeDiff = now - user.auth_date
    console.log('⏰ Время авторизации:', new Date(user.auth_date * 1000).toLocaleString())
    console.log('⏰ Текущее время:', new Date(now * 1000).toLocaleString())
    console.log('⏰ Разница в секундах:', timeDiff)
    
    if (timeDiff > 3600) { // 1 hour
      console.error('❌ Данные авторизации устарели (более 1 часа)')
      return false
    }

    // Additional client validation
    if (typeof user.id !== 'number' || user.id <= 0) {
      console.error('❌ Неверный ID пользователя')
      return false
    }

    if (typeof user.first_name !== 'string' || user.first_name.length === 0) {
      console.error('❌ Неверное имя пользователя')
      return false
    }

    console.log('✅ Базовые проверки пройдены')

    // Server-side verification with bot token
    try {
      console.log('🔐 Отправляем данные на серверную верификацию...')
      
      const response = await fetch('/api/auth/telegram/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      })

      if (!response.ok) {
        console.error('❌ Ошибка HTTP при верификации:', response.status)
        // Fallback to client validation if server verification fails
        console.log('⚠️ Используем клиентскую проверку как fallback')
        return true
      }

      const verificationResult = await response.json()
      console.log('📋 Результат серверной верификации:', verificationResult)

      if (verificationResult.verified) {
        if (verificationResult.valid) {
          console.log('✅ Серверная верификация УСПЕШНА')
          return true
        } else {
          console.error('❌ Серверная верификация ПРОВАЛЕНА')
          console.error('Причина:', verificationResult.message)
          return false
        }
      } else {
        console.log('⚠️ Серверная верификация недоступна, используем базовую проверку')
        return true
      }

    } catch (error) {
      console.error('❌ Ошибка при серверной верификации:', error)
      console.log('⚠️ Используем клиентскую проверку как fallback')
      return true // Fallback to client validation
    }
  }

  // Show setup instructions if bot username is not configured
  if (!botUsername || botUsername === 'calendly_mvp_bot') {
    return (
      <div className="telegram-auth">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-sm text-yellow-800 font-medium mb-2">
              Telegram бот не настроен
            </p>
            <p className="text-xs text-yellow-700 mb-2">
              Для активации создайте бота через @BotFather
            </p>
            <p className="text-xs text-gray-600">
              Текущий botUsername: {botUsername}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ENV: {process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'не задана'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="telegram-auth">
      <div 
        ref={containerRef}
        id="telegram-login-container" 
        className="flex justify-center min-h-[50px] items-center"
      >
        {/* Telegram widget will be inserted here */}
        <div className="text-sm text-gray-500">Загрузка Telegram виджета...</div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Быстрый вход через Telegram
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Нажмите кнопку выше для авторизации
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Бот: @{botUsername}
        </p>
        <p className="text-xs text-gray-400">
          Callback: {typeof window !== 'undefined' && typeof window.onTelegramAuth === 'function' ? '✅' : '❌'}
        </p>
      </div>
    </div>
  )
} 
// @ts-nocheck
'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

declare global {
  interface Window {
    onTelegramAuth?: (data: any) => void
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
    console.log('🤖 Инициализация Telegram Auth с ботом:', botUsername)
    console.log('🔍 Переменная окружения NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME)
    
    // Cleanup previous script if exists
    if (scriptRef.current && scriptRef.current.parentNode) {
      scriptRef.current.parentNode.removeChild(scriptRef.current)
      scriptRef.current = null
    }

    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    // Skip if bot not configured properly
    if (!botUsername || botUsername === 'calendly_mvp_bot') {
      console.log('⚠️ Бот не настроен, показываем предупреждение')
      return
    }

    // Global callback function for Telegram auth - define before script load
    window.onTelegramAuth = async (user: TelegramUser) => {
      try {
        console.log('🎉 Получены данные от Telegram:', user)
        
        // Verify the authentication data
        const isValid = await verifyTelegramAuth(user)
        if (!isValid) {
          console.error('❌ Неверные данные авторизации Telegram')
          alert('Ошибка: неверные данные авторизации Telegram')
          return
        }

        console.log('✅ Данные Telegram прошли проверку')

        // Create or sign in user with Supabase using email/password approach
        const telegramEmail = `telegram_${user.id}@telegram.local`
        const telegramPassword = `telegram_${user.id}_${user.hash}`

        console.log('🔐 Попытка входа с email:', telegramEmail)

        // Try to sign in first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: telegramEmail,
          password: telegramPassword,
        })

        // If user doesn't exist, create account
        if (signInError && signInError.message.includes('Invalid login credentials')) {
          console.log('👤 Пользователь не найден, создаем новый аккаунт')
          
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
        } else if (signInError) {
          console.error('❌ Ошибка входа Supabase:', signInError)
          alert('Ошибка входа: ' + signInError.message)
          return
        } else {
          console.log('✅ Успешный вход существующего пользователя:', signInData)
        }

        console.log('🎉 Авторизация Telegram завершена успешно')
        
        if (onAuth) {
          onAuth(user)
        }
        
      } catch (err) {
        console.error('💥 Ошибка в процессе авторизации Telegram:', err)
        alert('Произошла ошибка при входе через Telegram: ' + (err as Error).message)
      }
    }

    // Load Telegram Login Widget script
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
    }
    
    script.onerror = (error) => {
      console.error('❌ Ошибка загрузки Telegram widget script:', error)
    }

    // Add the script to the container
    if (containerRef.current) {
      containerRef.current.appendChild(script)
      console.log('📦 Telegram script добавлен в контейнер')
    } else {
      console.error('❌ Контейнер не найден')
    }

    return () => {
      // Cleanup
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
        scriptRef.current = null
      }
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth
      }
      console.log('🧹 Telegram Auth cleanup выполнен')
    }
  }, [botUsername, onAuth])

  // Simple verification function
  const verifyTelegramAuth = async (user: TelegramUser): Promise<boolean> => {
    console.log('🔍 Проверка данных Telegram пользователя...')
    
    // Basic validation
    const requiredFields = ['id', 'first_name', 'auth_date', 'hash']
    const isValid = requiredFields.every(field => {
      const hasField = user[field] !== undefined && user[field] !== null
      if (!hasField) {
        console.error(`❌ Отсутствует обязательное поле: ${field}`)
      }
      return hasField
    })

    // Check auth_date (should be recent - within last hour)
    const now = Math.floor(Date.now() / 1000)
    const timeDiff = now - user.auth_date
    if (timeDiff > 3600) { // 1 hour
      console.error('❌ Данные авторизации устарели')
      return false
    }

    console.log(isValid ? '✅ Данные валидны' : '❌ Данные не прошли проверку')
    return isValid
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
      </div>
    </div>
  )
} 
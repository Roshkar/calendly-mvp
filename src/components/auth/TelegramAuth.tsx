// @ts-nocheck
'use client'

import { useEffect } from 'react'
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
  useEffect(() => {
    // Load Telegram Login Widget script
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true

    // Add the script to the page
    const container = document.getElementById('telegram-login-container')
    if (container) {
      container.appendChild(script)
    }

    // Global callback function for Telegram auth
    window.onTelegramAuth = async (user: TelegramUser) => {
      try {
        console.log('Telegram auth data:', user)
        
        // Verify the authentication data (optional but recommended)
        const isValid = await verifyTelegramAuth(user)
        if (!isValid) {
          alert('Ошибка: неверные данные авторизации Telegram')
          return
        }

        // Create or sign in user with Supabase using email/password approach
        // Since Telegram doesn't provide email, we'll use Telegram ID as identifier
        const telegramEmail = `telegram_${user.id}@telegram.local`
        const telegramPassword = `telegram_${user.id}_${user.hash}`

        // Try to sign in first
        let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: telegramEmail,
          password: telegramPassword,
        })

        // If user doesn't exist, create account
        if (signInError && signInError.message.includes('Invalid login credentials')) {
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
            console.error('Supabase signup error:', signUpError)
            alert('Ошибка создания аккаунта: ' + signUpError.message)
            return
          }

          console.log('New Telegram user created:', signUpData)
        } else if (signInError) {
          console.error('Supabase signin error:', signInError)
          alert('Ошибка входа: ' + signInError.message)
          return
        }

        console.log('Telegram auth successful')
        
        if (onAuth) {
          onAuth(user)
        }
        
      } catch (err) {
        console.error('Telegram auth error:', err)
        alert('Произошла ошибка при входе через Telegram')
      }
    }

    return () => {
      // Cleanup
      if (container && script.parentNode) {
        script.parentNode.removeChild(script)
      }
      delete window.onTelegramAuth
    }
  }, [botUsername, onAuth])

  // Simple verification function (you should implement proper hash verification in production)
  const verifyTelegramAuth = async (user: TelegramUser): Promise<boolean> => {
    // In production, you should verify the hash using your bot token
    // For now, we'll do basic validation
    const requiredFields = ['id', 'first_name', 'auth_date', 'hash']
    return requiredFields.every(field => user[field] !== undefined)
  }

  return (
    <div className="telegram-auth">
      <div id="telegram-login-container" className="flex justify-center">
        {/* Telegram widget will be inserted here */}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Быстрый вход через Telegram
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Нажмите кнопку выше для авторизации
        </p>
      </div>
    </div>
  )
} 
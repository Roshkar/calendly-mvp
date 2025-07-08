'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useFirstLogin() {
  const [isFirstLogin, setIsFirstLogin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkFirstLogin()
  }, [])

  const checkFirstLogin = async () => {
    try {
      // Проверяем аутентификацию
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsFirstLogin(false)
        setIsLoading(false)
        return
      }

      // Проверяем localStorage первым (быстрее)
      const hasSeenOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`)
      if (hasSeenOnboarding === 'true') {
        setIsFirstLogin(false)
        setIsLoading(false)
        return
      }

      // Проверяем в базе данных поле onboarding_completed
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (error) {
        console.log('Profile not found or error:', error.message)
        // Если ошибка - считаем что первый логин
        setIsFirstLogin(true)
      } else {
        const isCompleted = profile?.onboarding_completed === true
        setIsFirstLogin(!isCompleted)
        
        // Синхронизируем с localStorage
        if (isCompleted) {
          localStorage.setItem(`onboarding_completed_${user.id}`, 'true')
        }
      }
    } catch (error) {
      console.error('Error checking first login:', error)
      setIsFirstLogin(true) // По умолчанию показываем онбординг
    } finally {
      setIsLoading(false)
    }
  }

  const markOnboardingCompleted = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Обновляем в базе данных
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating onboarding status:', error)
      }

      // Обновляем localStorage
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true')
      setIsFirstLogin(false)
    } catch (error) {
      console.error('Error marking onboarding completed:', error)
    }
  }

  const resetOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Обновляем в базе данных
      await supabase
        .from('profiles')
        .update({ onboarding_completed: false })
        .eq('id', user.id)

      // Удаляем из localStorage
      localStorage.removeItem(`onboarding_completed_${user.id}`)
      setIsFirstLogin(true)
    } catch (error) {
      console.error('Error resetting onboarding:', error)
    }
  }

  return {
    isFirstLogin,
    isLoading,
    markOnboardingCompleted,
    resetOnboarding,
    checkFirstLogin
  }
} 
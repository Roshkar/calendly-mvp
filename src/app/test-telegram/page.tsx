// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import TelegramAuth from '@/components/auth/TelegramAuth'

export default function TestTelegramPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [botUsername, setBotUsername] = useState('')
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    // Check environment variables
    const env = {
      NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    }
    setEnvVars(env)
    
    // Set initial bot username
    setBotUsername(env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'calendly_mvp_bot')
    
    addLog('📋 Страница тестирования Telegram загружена')
    addLog(`🔍 Переменные окружения: ${JSON.stringify(env, null, 2)}`)
  }, [])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const handleTelegramAuth = (user: any) => {
    addLog(`✅ Telegram auth успешен!`)
    addLog(`👤 Пользователь: ${user.first_name} ${user.last_name || ''}`)
    addLog(`🆔 ID: ${user.id}`)
    addLog(`👤 Username: ${user.username || 'не указан'}`)
    addLog(`📸 Фото: ${user.photo_url || 'нет'}`)
    addLog(`📅 Дата авторизации: ${new Date(user.auth_date * 1000).toLocaleString()}`)
    addLog(`🔐 Хеш: ${user.hash.substring(0, 10)}...`)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testEnvironmentVars = () => {
    addLog('🔍 === ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ===')
    Object.entries(envVars).forEach(([key, value]) => {
      addLog(`${key}: ${value || 'НЕ ЗАДАНА'}`)
    })
    addLog(`Текущий botUsername: ${botUsername}`)
    addLog('=======================================')
  }

  const testTelegramScript = () => {
    addLog('🔍 === ТЕСТ ЗАГРУЗКИ TELEGRAM SCRIPT ===')
    
    // Check if Telegram script is loaded
    const existingScript = document.querySelector('script[src*="telegram-widget.js"]')
    addLog(`Telegram script в DOM: ${existingScript ? 'НАЙДЕН' : 'НЕ НАЙДЕН'}`)
    
    // Check if container exists
    const container = document.getElementById('telegram-login-container')
    addLog(`Контейнер telegram-login-container: ${container ? 'НАЙДЕН' : 'НЕ НАЙДЕН'}`)
    
    // Check global function
    addLog(`window.onTelegramAuth: ${typeof window.onTelegramAuth}`)
    
    addLog('=====================================')
  }

  const testBotConnection = async () => {
    addLog('🔍 === ТЕСТ ПОДКЛЮЧЕНИЯ К БОТУ ===')
    
    if (!botUsername || botUsername === 'calendly_mvp_bot') {
      addLog('❌ Бот не настроен!')
      return
    }
    
    try {
      // Try to fetch bot info (this will fail due to CORS, but we can see the attempt)
      addLog(`🤖 Проверяем бота: @${botUsername}`)
      addLog('ℹ️ Примечание: Прямая проверка бота невозможна из браузера')
      addLog('✅ Если виджет появляется ниже - бот настроен правильно')
    } catch (error) {
      addLog(`❌ Ошибка: ${error}`)
    }
    
    addLog('===============================')
  }

  const isConfigured = botUsername && botUsername !== 'calendly_mvp_bot'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🤖 Диагностика Telegram Авторизации
          </h1>

          {/* Статус конфигурации */}
          <div className={`mb-6 p-4 border rounded ${isConfigured ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h3 className={`font-semibold mb-2 ${isConfigured ? 'text-green-800' : 'text-red-800'}`}>
              {isConfigured ? '✅ Статус: Настроено' : '❌ Статус: Не настроено'}
            </h3>
            <div className="text-sm space-y-1">
              <p><strong>Переменная окружения:</strong> {envVars.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'НЕ ЗАДАНА'}</p>
              <p><strong>Текущий бот:</strong> @{botUsername}</p>
              <p><strong>Окружение:</strong> {envVars.NODE_ENV}</p>
            </div>
          </div>

          {/* Настройки */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800 mb-3">⚙️ Настройки тестирования</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Имя бота (без @):
                </label>
                <input
                  type="text"
                  value={botUsername}
                  onChange={(e) => setBotUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="calendly_mvp_bot"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={testEnvironmentVars}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  🔍 Проверить переменные
                </button>
                <button
                  onClick={testTelegramScript}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                >
                  📜 Проверить скрипт
                </button>
                <button
                  onClick={testBotConnection}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                >
                  🤖 Проверить бота
                </button>
              </div>
            </div>
          </div>

          {/* Telegram Widget */}
          <div className="mb-6 p-4 bg-gray-50 border rounded">
            <h3 className="font-semibold text-gray-800 mb-3">📱 Telegram Widget</h3>
            <div className="bg-white p-4 rounded border">
              <TelegramAuth 
                botUsername={botUsername}
                onAuth={handleTelegramAuth}
              />
            </div>
          </div>

          {/* Логи */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">📋 Логи диагностики</h3>
              <button
                onClick={clearLogs}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                🗑️ Очистить
              </button>
            </div>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">Логи появятся здесь...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Пошаговые инструкции */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-3">📋 Пошаговая настройка</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-2 text-sm">
              <li><strong>Создайте бота:</strong> Откройте @BotFather в Telegram → /newbot</li>
              <li><strong>Получите имя бота:</strong> Скопируйте имя без @ (например: calendly_mvp_bot)</li>
              <li><strong>Настройте домен:</strong> /setdomain → calendly-mvp.vercel.app</li>
              <li><strong>Добавьте переменную:</strong> В Vercel → Settings → Environment Variables</li>
              <li><strong>Переменная:</strong> NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = имя_бота</li>
              <li><strong>Редеплой:</strong> Перезапустите деплой в Vercel</li>
              <li><strong>Тестирование:</strong> Обновите эту страницу и нажмите &quot;Проверить переменные&quot;</li>
            </ol>
          </div>

          {/* Возможные ошибки */}
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h3 className="font-semibold text-red-800 mb-3">🚨 Диагностика проблем</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-red-700">Виджет не появляется:</p>
                <ul className="list-disc list-inside text-red-600 ml-4 space-y-1">
                  <li>Проверьте консоль браузера (F12)</li>
                  <li>Убедитесь что переменная NEXT_PUBLIC_TELEGRAM_BOT_USERNAME задана</li>
                  <li>Проверьте что имя бота правильное</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-red-700">Ошибка &quot;Username invalid&quot;:</p>
                <ul className="list-disc list-inside text-red-600 ml-4 space-y-1">
                  <li>Бот не создан или имя неправильное</li>
                  <li>Проверьте имя бота в @BotFather</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-red-700">Ошибка &quot;Bot domain invalid&quot;:</p>
                <ul className="list-disc list-inside text-red-600 ml-4 space-y-1">
                  <li>Домен не настроен через /setdomain</li>
                  <li>Убедитесь что указали правильный домен</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
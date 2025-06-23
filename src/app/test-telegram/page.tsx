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
    addLog(`🌐 Текущий URL: ${window.location.href}`)
    addLog(`🖥️ User Agent: ${navigator.userAgent}`)
  }, [])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const handleTelegramAuth = (user: any) => {
    addLog(`✅ === TELEGRAM AUTH УСПЕШЕН ===`)
    addLog(`👤 Пользователь: ${user.first_name} ${user.last_name || ''}`)
    addLog(`🆔 ID: ${user.id}`)
    addLog(`👤 Username: ${user.username || 'не указан'}`)
    addLog(`📸 Фото: ${user.photo_url || 'нет'}`)
    addLog(`📅 Дата авторизации: ${new Date(user.auth_date * 1000).toLocaleString()}`)
    addLog(`🔐 Хеш: ${user.hash.substring(0, 10)}...`)
    addLog(`🎉 АВТОРИЗАЦИЯ ЗАВЕРШЕНА УСПЕШНО!`)
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
    
    if (existingScript) {
      const attrs = existingScript.attributes
      addLog(`Атрибуты скрипта:`)
      for (let i = 0; i < attrs.length; i++) {
        addLog(`  ${attrs[i].name}: ${attrs[i].value}`)
      }
    }
    
    // Check if container exists
    const container = document.getElementById('telegram-login-container')
    addLog(`Контейнер telegram-login-container: ${container ? 'НАЙДЕН' : 'НЕ НАЙДЕН'}`)
    
    if (container) {
      addLog(`Содержимое контейнера: ${container.innerHTML.length > 0 ? 'ЕСТЬ' : 'ПУСТО'}`)
      const iframe = container.querySelector('iframe')
      addLog(`Telegram iframe: ${iframe ? 'НАЙДЕН' : 'НЕ НАЙДЕН'}`)
      
      if (iframe) {
        addLog(`Размеры iframe: ${iframe.offsetWidth}x${iframe.offsetHeight}`)
        addLog(`Src iframe: ${iframe.src || 'НЕ ЗАДАН'}`)
      }
    }
    
    // Check global function
    addLog(`window.onTelegramAuth: ${typeof window.onTelegramAuth}`)
    addLog(`window.TelegramLoginWidget: ${typeof window.TelegramLoginWidget}`)
    
    // Check for other Telegram objects
    const telegramKeys = Object.keys(window).filter(key => key.toLowerCase().includes('telegram'))
    addLog(`Глобальные объекты Telegram: ${telegramKeys.length > 0 ? telegramKeys.join(', ') : 'НЕ НАЙДЕНЫ'}`)
    
    addLog('=====================================')
  }

  const testCallbackFunction = () => {
    addLog('🧪 === ТЕСТ CALLBACK ФУНКЦИИ ===')
    
    if (typeof window.onTelegramAuth === 'function') {
      addLog('✅ Callback функция доступна')
      
      // Test with mock data
      const mockUser = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        photo_url: '',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'test_hash_123'
      }
      
      addLog('🎭 Тестируем с mock данными...')
      addLog('⚠️ ВНИМАНИЕ: Это тестовый вызов, реальная авторизация НЕ произойдет')
      
      try {
        // Don't actually call it as it will try to create a real user
        addLog('✅ Callback функция готова к вызову')
        addLog('📝 Mock данные подготовлены')
      } catch (error) {
        addLog(`❌ Ошибка при тестировании callback: ${error}`)
      }
    } else {
      addLog('❌ Callback функция НЕ доступна!')
      addLog(`Тип window.onTelegramAuth: ${typeof window.onTelegramAuth}`)
    }
    
    addLog('===============================')
  }

  const testBotConnection = async () => {
    addLog('🔍 === ТЕСТ ПОДКЛЮЧЕНИЯ К БОТУ ===')
    
    if (!botUsername || botUsername === 'calendly_mvp_bot') {
      addLog('❌ Бот не настроен!')
      return
    }
    
    try {
      addLog(`🤖 Проверяем бота: @${botUsername}`)
      addLog('ℹ️ Примечание: Прямая проверка бота невозможна из браузера')
      
      // Check if widget loads
      const widget = document.querySelector('#telegram-login-container iframe')
      if (widget) {
        addLog('✅ Telegram виджет найден в DOM')
        addLog(`📏 Размеры виджета: ${widget.offsetWidth}x${widget.offsetHeight}`)
      } else {
        addLog('❌ Telegram виджет НЕ найден в DOM')
        addLog('💡 Возможные причины:')
        addLog('  - Неправильное имя бота')
        addLog('  - Бот не создан в @BotFather')
        addLog('  - Домен не настроен')
        addLog('  - Скрипт не загрузился')
      }
      
    } catch (error) {
      addLog(`❌ Ошибка: ${error}`)
    }
    
    addLog('===============================')
  }

  const testDomainSettings = () => {
    addLog('🔍 === ПРОВЕРКА НАСТРОЕК ДОМЕНА ===')
    
    const currentDomain = window.location.hostname
    const currentProtocol = window.location.protocol
    const fullUrl = window.location.href
    
    addLog(`🌐 Текущий домен: ${currentDomain}`)
    addLog(`🔒 Протокол: ${currentProtocol}`)
    addLog(`📍 Полный URL: ${fullUrl}`)
    
    if (currentDomain === 'localhost') {
      addLog('⚠️ Вы на localhost - убедитесь что домен localhost:3000 настроен в @BotFather')
    } else if (currentDomain.includes('vercel.app')) {
      addLog(`✅ Вы на Vercel - домен ${currentDomain} должен быть настроен в @BotFather`)
    } else {
      addLog(`ℹ️ Кастомный домен - убедитесь что ${currentDomain} настроен в @BotFather`)
    }
    
    addLog('💡 Для настройки домена:')
    addLog('  1. Откройте @BotFather в Telegram')
    addLog('  2. Отправьте /setdomain')
    addLog('  3. Выберите вашего бота')
    addLog(`  4. Введите: ${currentDomain}`)
    
    addLog('=====================================')
  }

  const testBotToken = async () => {
    addLog('🔐 === ТЕСТ BOT TOKEN ===')
    
    // Test with mock data
    const mockUser = {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      photo_url: '',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'test_hash_123'
    }
    
    try {
      addLog('📤 Отправляем тестовые данные на верификацию...')
      
      const response = await fetch('/api/auth/telegram/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockUser)
      })
      
      if (!response.ok) {
        addLog(`❌ HTTP ошибка: ${response.status}`)
        addLog(`Текст ошибки: ${response.statusText}`)
        return
      }
      
      const result = await response.json()
      addLog('📋 Результат верификации:')
      addLog(`  verified: ${result.verified}`)
      addLog(`  valid: ${result.valid}`)
      addLog(`  message: ${result.message}`)
      
      if (result.verified) {
        if (result.hashValid !== undefined) {
          addLog(`  hashValid: ${result.hashValid}`)
          addLog(`  timeValid: ${result.timeValid}`)
          addLog(`  timeDiff: ${result.timeDiff} сек`)
        }
        
        if (result.verified && !result.valid) {
          addLog('⚠️ Это нормально для тестовых данных - хеш не совпадает')
        }
        
        addLog('✅ API верификации работает!')
        addLog('💡 TELEGRAM_BOT_TOKEN настроен правильно')
      } else {
        addLog('⚠️ Серверная верификация недоступна')
        addLog('💡 Возможно TELEGRAM_BOT_TOKEN не задан')
      }
      
    } catch (error) {
      addLog(`❌ Ошибка при тестировании: ${error}`)
      addLog('💡 Проверьте что API маршрут создан')
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
              <p><strong>Домен:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'неизвестно'}</p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  onClick={testEnvironmentVars}
                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  🔍 Переменные
                </button>
                <button
                  onClick={testTelegramScript}
                  className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
                >
                  📜 Скрипт
                </button>
                <button
                  onClick={testCallbackFunction}
                  className="bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 text-sm"
                >
                  🧪 Callback
                </button>
                <button
                  onClick={testBotConnection}
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                >
                  🤖 Бот
                </button>
                <button
                  onClick={testDomainSettings}
                  className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 text-sm"
                >
                  🌐 Домен
                </button>
                <button
                  onClick={testBotToken}
                  className="bg-pink-600 text-white px-3 py-2 rounded hover:bg-pink-700 text-sm"
                >
                  🔐 Bot Token
                </button>
                <button
                  onClick={clearLogs}
                  className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 text-sm"
                >
                  🗑️ Очистить
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
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Инструкция:</strong></p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Нажмите кнопку Telegram выше</li>
                <li>Введите ваш номер телефона</li>
                <li>Введите код из SMS</li>
                <li>Проверьте логи ниже на наличие ошибок</li>
              </ol>
            </div>
          </div>

          {/* Логи */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">📋 Логи диагностики</h3>
              <div className="text-sm text-gray-500">
                Всего записей: {logs.length}
              </div>
            </div>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">
                  Логи появятся здесь...
                  <br />
                  Нажмите любую диагностическую кнопку выше
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1 break-words">
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
              <li><strong>Настройте домен:</strong> /setdomain → {typeof window !== 'undefined' ? window.location.hostname : 'ваш-домен'}</li>
              <li><strong>Добавьте переменную:</strong> В Vercel → Settings → Environment Variables</li>
              <li><strong>Переменная:</strong> NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = имя_бота</li>
              <li><strong>Редеплой:</strong> Перезапустите деплой в Vercel</li>
              <li><strong>Тестирование:</strong> Обновите эту страницу и нажмите диагностические кнопки</li>
            </ol>
          </div>

          {/* Диагностика проблем */}
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h3 className="font-semibold text-red-800 mb-3">🚨 Диагностика проблем</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-red-700">После ввода номера ничего не происходит:</p>
                <ul className="list-disc list-inside text-red-600 ml-4 space-y-1">
                  <li>Проверьте консоль браузера (F12 → Console)</li>
                  <li>Нажмите кнопку &quot;🧪 Callback&quot; - функция должна быть доступна</li>
                  <li>Убедитесь что домен настроен в @BotFather через /setdomain</li>
                  <li>Проверьте что бот активен и правильно создан</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-red-700">Виджет не появляется:</p>
                <ul className="list-disc list-inside text-red-600 ml-4 space-y-1">
                  <li>Проверьте переменную NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</li>
                  <li>Убедитесь что имя бота правильное (без @)</li>
                  <li>Нажмите &quot;📜 Скрипт&quot; для проверки загрузки</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-red-700">Ошибки в консоли:</p>
                <ul className="list-disc list-inside text-red-600 ml-4 space-y-1">
                  <li>CORS ошибки - проверьте настройки домена</li>
                  <li>JavaScript ошибки - проверьте callback функцию</li>
                  <li>Network ошибки - проверьте интернет соединение</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
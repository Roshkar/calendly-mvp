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
        const text = await response.text()
        addLog(`Ответ сервера: ${text}`)
        return
      }
      
      const result = await response.json()
      addLog(`📋 Результат верификации: ${JSON.stringify(result, null, 2)}`)
      
      if (result.verified) {
        if (result.botTokenConfigured) {
          addLog('✅ Bot token настроен и работает')
        } else {
          addLog('⚠️ Bot token не настроен, используется базовая проверка')
        }
      }
      
    } catch (error) {
      addLog(`❌ Ошибка при тестировании bot token: ${error}`)
    }
    
    addLog('=============================')
  }

  const diagnoseTelegramWidget = () => {
    addLog('🔍 === ДИАГНОСТИКА TELEGRAM ВИДЖЕТА ===')
    
    // 1. Проверяем переменные окружения
    addLog('1️⃣ Проверка переменных:')
    addLog(`   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: ${envVars.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'НЕ ЗАДАНА'}`)
    
    if (!envVars.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || envVars.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME === 'calendly_mvp_bot') {
      addLog('   ❌ Переменная не настроена или содержит дефолтное значение')
      addLog('   💡 Решение: Настройте NEXT_PUBLIC_TELEGRAM_BOT_USERNAME в Vercel')
      return
    }
    
    // 2. Проверяем загрузку скрипта
    addLog('2️⃣ Проверка скрипта Telegram:')
    const scripts = document.querySelectorAll('script[src*="telegram-widget.js"]')
    addLog(`   Количество Telegram скриптов: ${scripts.length}`)
    
    if (scripts.length === 0) {
      addLog('   ❌ Telegram скрипт не найден')
      addLog('   💡 Возможная причина: Ошибка загрузки компонента TelegramAuth')
    } else {
      scripts.forEach((script, index) => {
        addLog(`   Скрипт ${index + 1}:`)
        addLog(`     src: ${script.src}`)
        addLog(`     data-telegram-login: ${script.getAttribute('data-telegram-login')}`)
        addLog(`     data-onauth: ${script.getAttribute('data-onauth')}`)
      })
    }
    
    // 3. Проверяем контейнер и iframe
    addLog('3️⃣ Проверка виджета в DOM:')
    const container = document.getElementById('telegram-login-container')
    if (!container) {
      addLog('   ❌ Контейнер telegram-login-container не найден')
    } else {
      addLog('   ✅ Контейнер найден')
      const iframe = container.querySelector('iframe')
      if (!iframe) {
        addLog('   ❌ Telegram iframe не создан')
        addLog('   💡 Возможные причины:')
        addLog('     - Неправильное имя бота')
        addLog('     - Бот не существует')
        addLog('     - Домен не настроен в @BotFather')
      } else {
        addLog('   ✅ Telegram iframe найден')
        addLog(`     Размеры: ${iframe.offsetWidth}x${iframe.offsetHeight}`)
        addLog(`     Видимость: ${iframe.style.display !== 'none' ? 'видимый' : 'скрытый'}`)
        
        // Проверяем содержимое iframe (если возможно)
        try {
          addLog(`     src: ${iframe.src}`)
          if (iframe.src.includes('oauth.telegram.org')) {
            addLog('   ✅ iframe указывает на правильный URL Telegram')
          }
        } catch (e) {
          addLog('     src: недоступен (CORS)')
        }
      }
    }
    
    // 4. Проверяем callback функцию
    addLog('4️⃣ Проверка callback функции:')
    if (typeof window.onTelegramAuth === 'function') {
      addLog('   ✅ window.onTelegramAuth определена')
    } else {
      addLog('   ❌ window.onTelegramAuth не определена')
      addLog('   💡 Это может означать что TelegramAuth компонент не загрузился')
    }
    
    // 5. Проверяем текущий домен
    addLog('5️⃣ Проверка домена:')
    const domain = window.location.hostname
    addLog(`   Текущий домен: ${domain}`)
    
    if (domain === 'localhost') {
      addLog('   ⚠️ Localhost - убедитесь что localhost:3000 настроен в @BotFather')
    } else if (domain.includes('vercel.app')) {
      addLog('   ✅ Vercel домен')
      addLog(`   💡 Убедитесь что ${domain} настроен в @BotFather командой /setdomain`)
    }
    
    // 6. Итоговые рекомендации
    addLog('6️⃣ Рекомендации для решения проблемы:')
    addLog('   📱 Откройте @BotFather в Telegram')
    addLog('   🤖 Убедитесь что бот создан и активен')
    addLog(`   🌐 Выполните /setdomain и укажите: ${domain}`)
    addLog('   🔄 Перезагрузите страницу после настройки домена')
    
    addLog('=====================================')
  }

  const diagnoseNetworkIssue = () => {
    addLog('🚨 === ДИАГНОСТИКА ПРОБЛЕМЫ С NETWORK ===')
    addLog('Проблема: При нажатии "Отправить" номер телефона нет активности в Network')
    addLog('')
    
    // 1. Проверяем iframe и его содержимое
    addLog('1️⃣ Анализ Telegram iframe:')
    const iframe = document.querySelector('#telegram-login-container iframe')
    
    if (!iframe) {
      addLog('   ❌ КРИТИЧЕСКАЯ ОШИБКА: Telegram iframe не найден!')
      addLog('   💡 Это означает что виджет вообще не загрузился')
      addLog('   🔧 Решение: Проверьте настройки бота и переменные окружения')
      return
    }
    
    addLog('   ✅ Telegram iframe найден')
    addLog(`   📏 Размеры: ${iframe.offsetWidth}x${iframe.offsetHeight}`)
    
    // Проверяем размеры - если слишком маленькие, виджет может не работать
    if (iframe.offsetWidth < 200 || iframe.offsetHeight < 30) {
      addLog('   ⚠️ ВНИМАНИЕ: Размеры iframe подозрительно малы')
      addLog('   💡 Возможно виджет не загрузился полностью')
    } else {
      addLog('   ✅ Размеры iframe нормальные')
    }
    
    // 2. Проверяем URL iframe
    addLog('2️⃣ Анализ URL iframe:')
    try {
      const iframeSrc = iframe.src
      addLog(`   URL: ${iframeSrc}`)
      
      if (!iframeSrc.includes('oauth.telegram.org')) {
        addLog('   ❌ ОШИБКА: iframe НЕ указывает на oauth.telegram.org')
        addLog('   💡 Это означает что виджет не подключен к Telegram')
      } else {
        addLog('   ✅ iframe правильно указывает на oauth.telegram.org')
        
        // Проверяем параметры в URL
        const url = new URL(iframeSrc)
        const botParam = url.searchParams.get('bot_id') || url.pathname.split('/').pop()
        addLog(`   🤖 Бот в URL: ${botParam}`)
        
        if (botParam !== botUsername) {
          addLog('   ⚠️ ВНИМАНИЕ: Бот в URL не совпадает с настройками')
          addLog(`   Ожидается: ${botUsername}`)
          addLog(`   В URL: ${botParam}`)
        }
      }
    } catch (e) {
      addLog('   ❌ Не удалось получить URL iframe (CORS)')
    }
    
    // 3. Проверяем события iframe
    addLog('3️⃣ Проверка взаимодействия с iframe:')
    
    // Добавляем обработчик событий для iframe
    const checkIframeEvents = () => {
      addLog('   🔍 Устанавливаем мониторинг событий iframe...')
      
      // Слушаем postMessage события от iframe
      const messageHandler = (event) => {
        if (event.origin.includes('telegram.org')) {
          addLog(`   📨 Получено сообщение от Telegram: ${JSON.stringify(event.data)}`)
        }
      }
      
      window.addEventListener('message', messageHandler)
      
      // Убираем обработчик через 30 секунд
      setTimeout(() => {
        window.removeEventListener('message', messageHandler)
        addLog('   ⏰ Мониторинг событий iframe завершен')
      }, 30000)
      
      addLog('   ✅ Мониторинг событий установлен на 30 секунд')
      addLog('   💡 Теперь попробуйте ввести номер телефона - события появятся здесь')
    }
    
    checkIframeEvents()
    
    // 4. Проверяем домен и настройки
    addLog('4️⃣ Проверка настроек домена:')
    const currentDomain = window.location.hostname
    addLog(`   🌐 Текущий домен: ${currentDomain}`)
    
    // 5. Возможные причины отсутствия network активности
    addLog('5️⃣ Возможные причины отсутствия Network активности:')
    addLog('   🔹 Домен не настроен в @BotFather (/setdomain)')
    addLog('   🔹 Бот заблокирован или неактивен')
    addLog('   🔹 Неправильное имя бота в настройках')
    addLog('   🔹 Telegram блокирует запросы с вашего IP')
    addLog('   🔹 Проблемы с CORS политикой')
    addLog('   🔹 Iframe не может связаться с Telegram серверами')
    
    // 6. Пошаговое решение
    addLog('6️⃣ Пошаговое решение:')
    addLog('   1️⃣ Откройте @BotFather в Telegram')
    addLog('   2️⃣ Отправьте /mybots и найдите своего бота')
    addLog('   3️⃣ Убедитесь что бот активен (не показывает "Bot disabled")')
    addLog('   4️⃣ Отправьте /setdomain')
    addLog('   5️⃣ Выберите вашего бота')
    addLog(`   6️⃣ Введите точно: ${currentDomain}`)
    addLog('   7️⃣ Дождитесь подтверждения от BotFather')
    addLog('   8️⃣ Перезагрузите эту страницу')
    addLog('   9️⃣ Попробуйте авторизацию снова')
    
    // 7. Дополнительная проверка
    addLog('7️⃣ Дополнительная проверка через 10 секунд:')
    setTimeout(() => {
      const newIframe = document.querySelector('#telegram-login-container iframe')
      if (newIframe && newIframe.src) {
        addLog('   ✅ iframe все еще присутствует')
        addLog(`   📏 Актуальные размеры: ${newIframe.offsetWidth}x${newIframe.offsetHeight}`)
      } else {
        addLog('   ❌ iframe исчез или изменился')
      }
    }, 10000)
    
    addLog('')
    addLog('🎯 ГЛАВНОЕ: Если нет Network активности, проблема в настройках @BotFather!')
    addLog('===============================================')
  }

  const deepIframeAnalysis = () => {
    addLog('🔬 === ГЛУБОКИЙ АНАЛИЗ IFRAME ===')
    
    const iframe = document.querySelector('#telegram-login-container iframe')
    if (!iframe) {
      addLog('❌ iframe не найден')
      return
    }
    
    addLog('📊 Детальная информация об iframe:')
    addLog(`   🔗 src: ${iframe.src}`)
    addLog(`   📏 clientWidth: ${iframe.clientWidth}`)
    addLog(`   📏 clientHeight: ${iframe.clientHeight}`)
    addLog(`   📏 offsetWidth: ${iframe.offsetWidth}`)
    addLog(`   📏 offsetHeight: ${iframe.offsetHeight}`)
    addLog(`   👁️ style.display: ${iframe.style.display || 'default'}`)
    addLog(`   👁️ style.visibility: ${iframe.style.visibility || 'default'}`)
    addLog(`   🎯 id: ${iframe.id || 'нет'}`)
    addLog(`   🏷️ className: ${iframe.className || 'нет'}`)
    
    // Проверяем родительские элементы
    addLog('📦 Родительские элементы:')
    let parent = iframe.parentElement
    let level = 1
    while (parent && level <= 3) {
      addLog(`   Уровень ${level}: ${parent.tagName} (id: ${parent.id || 'нет'}, class: ${parent.className || 'нет'})`)
      parent = parent.parentElement
      level++
    }
    
    // Проверяем атрибуты iframe
    addLog('🏷️ Все атрибуты iframe:')
    for (let i = 0; i < iframe.attributes.length; i++) {
      const attr = iframe.attributes[i]
      addLog(`   ${attr.name}: ${attr.value}`)
    }
    
    // Мониторинг изменений iframe
    addLog('👀 Устанавливаем наблюдение за изменениями iframe...')
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          addLog(`   🔄 Изменен атрибут iframe: ${mutation.attributeName}`)
        }
      })
    })
    
    observer.observe(iframe, { attributes: true, attributeOldValue: true })
    
    // Останавливаем наблюдение через 60 секунд
    setTimeout(() => {
      observer.disconnect()
      addLog('   ⏰ Наблюдение за iframe завершено')
    }, 60000)
    
    // Пытаемся получить доступ к содержимому iframe (если возможно)
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
      if (iframeDoc) {
        addLog('   ✅ Доступ к содержимому iframe получен')
        addLog(`   📄 title: ${iframeDoc.title}`)
        addLog(`   🌐 URL: ${iframeDoc.URL}`)
      }
    } catch (e) {
      addLog('   ❌ Доступ к содержимому iframe заблокирован (CORS)')
      addLog(`   Ошибка: ${e.message}`)
    }
    
    addLog('=====================================')
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
                  onClick={diagnoseTelegramWidget}
                  className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                >
                  🚨 Полная диагностика
                </button>
                <button
                  onClick={diagnoseNetworkIssue}
                  className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 text-sm"
                >
                  🚨 Диагностика Network
                </button>
                <button
                  onClick={deepIframeAnalysis}
                  className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
                >
                  🔬 Глубокий анализ iframe
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
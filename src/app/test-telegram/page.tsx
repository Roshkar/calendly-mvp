// @ts-nocheck
'use client'

import { useState } from 'react'
import TelegramAuth from '@/components/auth/TelegramAuth'

export default function TestTelegramPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [botUsername, setBotUsername] = useState('calendly_mvp_bot')

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const handleTelegramAuth = (user: any) => {
    addLog(`✅ Telegram auth успешен: ${JSON.stringify(user, null, 2)}`)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testEnvironmentVars = () => {
    addLog('🔍 Проверка переменных окружения:')
    addLog(`NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: ${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'НЕ ЗАДАНА'}`)
    addLog(`Текущий botUsername: ${botUsername}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🤖 Тест Telegram Авторизации
          </h1>

          {/* Настройки */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800 mb-3">⚙️ Настройки</h3>
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
              <button
                onClick={testEnvironmentVars}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                🔍 Проверить переменные
              </button>
            </div>
          </div>

          {/* Telegram Widget */}
          <div className="mb-6 p-4 bg-gray-50 border rounded">
            <h3 className="font-semibold text-gray-800 mb-3">📱 Telegram Widget</h3>
            <TelegramAuth 
              botUsername={botUsername}
              onAuth={handleTelegramAuth}
            />
          </div>

          {/* Логи */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">📋 Логи отладки</h3>
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

          {/* Инструкции */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="font-semibold text-yellow-800 mb-3">💡 Инструкции для тестирования</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-2 text-sm">
              <li>Создайте бота через @BotFather в Telegram</li>
              <li>Выполните команду /setdomain и укажите ваш домен</li>
              <li>Введите имя бота в поле выше (без @)</li>
              <li>Нажмите &quot;Проверить переменные&quot; для диагностики</li>
              <li>Если виджет не загружается - проверьте консоль браузера</li>
              <li>Если виджет есть, но кнопка не работает - проверьте настройки бота</li>
            </ol>
          </div>

          {/* Возможные ошибки */}
          <div className="mt-6 bg-red-50 border border-red-200 rounded p-4">
            <h3 className="font-semibold text-red-800 mb-3">🚨 Возможные ошибки</h3>
            <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
              <li><strong>&quot;Username invalid&quot;</strong> - неправильное имя бота или бот не создан</li>
              <li><strong>&quot;Bot domain invalid&quot;</strong> - домен не настроен через /setdomain</li>
              <li><strong>Виджет не загружается</strong> - проблема с интернетом или блокировка скрипта</li>
              <li><strong>Кнопка не появляется</strong> - проверьте консоль браузера на ошибки JavaScript</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 
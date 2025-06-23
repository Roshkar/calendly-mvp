import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export async function POST(request: NextRequest) {
  try {
    const userData: TelegramUser = await request.json()
    
    // Получаем токен бота из переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    if (!botToken) {
      console.log('⚠️ TELEGRAM_BOT_TOKEN не задан, используем базовую проверку')
      return NextResponse.json({ 
        valid: true, 
        verified: false,
        message: 'Basic validation only - no bot token provided' 
      })
    }

    console.log('🔐 Начинаем серверную верификацию Telegram данных')
    console.log('👤 Пользователь ID:', userData.id)
    
    // Создаем строку для проверки хеша
    const dataCheckString = Object.keys(userData)
      .filter(key => key !== 'hash')
      .sort()
      .map(key => `${key}=${userData[key as keyof TelegramUser]}`)
      .join('\n')
    
    console.log('📝 Строка для проверки:', dataCheckString)
    
    // Создаем секретный ключ из токена бота
    const secretKey = crypto.createHash('sha256').update(botToken).digest()
    
    // Создаем хеш для сравнения
    const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
    
    console.log('🔐 Ожидаемый хеш:', hash.substring(0, 10) + '...')
    console.log('🔐 Полученный хеш:', userData.hash.substring(0, 10) + '...')
    
    const isValid = hash === userData.hash
    
    // Дополнительные проверки
    const now = Math.floor(Date.now() / 1000)
    const timeDiff = now - userData.auth_date
    const isRecent = timeDiff < 3600 // 1 час
    
    console.log('⏰ Время авторизации:', new Date(userData.auth_date * 1000).toLocaleString())
    console.log('⏰ Разница времени:', timeDiff, 'секунд')
    console.log('✅ Хеш валиден:', isValid)
    console.log('✅ Время актуально:', isRecent)
    
    const result = {
      valid: isValid && isRecent,
      verified: true,
      hashValid: isValid,
      timeValid: isRecent,
      timeDiff: timeDiff,
      message: isValid && isRecent ? 'Telegram data verified successfully' : 'Invalid Telegram data'
    }
    
    console.log('🎯 Результат верификации:', result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Ошибка верификации Telegram:', error)
    return NextResponse.json({ 
      valid: false, 
      verified: false,
      error: 'Verification failed',
      message: (error as Error).message 
    }, { status: 500 })
  }
} 
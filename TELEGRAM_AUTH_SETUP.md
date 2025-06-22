# 🤖 Telegram Authentication Setup Guide

## Overview

This guide will help you set up Telegram authentication for your Calendly MVP app using Telegram's Login Widget.

## 📋 Prerequisites

- Telegram account
- Access to your Supabase project
- Your app deployed (for domain verification)

## 🔧 Step-by-Step Setup

### Step 1: Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a conversation** with BotFather
3. **Create a new bot**:
   ```
   /newbot
   ```
4. **Follow the prompts**:
   - Bot name: `Calendly MVP Auth Bot` (or any name you prefer)
   - Bot username: `calendly_mvp_auth_bot` (must end with 'bot' and be unique)

5. **Save the Bot Token** - you'll receive something like:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### Step 2: Configure Bot for Web Login

1. **Set the domain** for your bot:
   ```
   /setdomain
   ```
2. **Select your bot** from the list
3. **Enter your domain**:
   ```
   calendly-mvp.vercel.app
   ```
   Or for local development:
   ```
   localhost:3000
   ```

### Step 3: Update Environment Variables

Add these to your `.env.local` file:

```env
# Telegram Bot Configuration
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=calendly_mvp_auth_bot
TELEGRAM_BOT_TOKEN=7899407653:AAGZYsBYM9ggbIBlH-Y7eUsLu2sv6l8sMDg
```

**Important**: 
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` should be your bot's username WITHOUT the @ symbol
- `TELEGRAM_BOT_TOKEN` is used for server-side verification (optional)

### Step 4: Update Supabase (Optional)

If you want to use Supabase's built-in OAuth (currently limited support for Telegram):

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Look for **Telegram** (if available)
3. Add your Bot Token

**Note**: Our implementation uses a custom approach that works with any Supabase setup.

### Step 5: Test the Integration

1. **Deploy your changes** to Vercel
2. **Visit the login page**: `https://your-app.vercel.app/login`
3. **Look for the Telegram login button**
4. **Click it** and authorize with your Telegram account

## 🔒 How It Works

### Authentication Flow

1. **User clicks** Telegram login button
2. **Telegram widget** opens authorization popup
3. **User authorizes** the app in Telegram
4. **Telegram returns** user data (id, name, username, photo)
5. **App creates** a Supabase account using:
   - Email: `telegram_{user_id}@telegram.local`
   - Password: `telegram_{user_id}_{hash}`
   - Metadata: Telegram user info

### User Profile Creation

The system automatically creates a profile with:
```javascript
{
  telegram_id: user.id,
  first_name: user.first_name,
  last_name: user.last_name || '',
  username: user.username || `user_${user.id}`,
  avatar_url: user.photo_url || '',
  auth_provider: 'telegram'
}
```

## 🎨 Customization

### Styling the Button

The Telegram widget supports these sizes:
- `small` - Compact button
- `medium` - Standard size
- `large` - Large button (default)

Чтобы изменить размер, обновите компонент:
```javascript
script.setAttribute('data-size', 'medium') // или 'small'
```

### Настройка обработчика

Вы можете настроить что происходит после успешной авторизации:

```javascript
<TelegramAuth 
  botUsername="your_bot_username"
  onAuth={(user) => {
    console.log('Пользователь Telegram:', user)
    // Ваша логика здесь
    router.push('/dashboard')
  }}
/>
```

## 🛡️ Security Considerations

### Hash Verification (Recommended for Production)

For production apps, you should verify the Telegram auth hash:

1. **Создайте API маршрут** (`/api/auth/telegram/verify`):

```javascript
import crypto from 'crypto'

export async function POST(request) {
  const userData = await request.json()
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  
  // Создаем хеш для проверки
  const dataCheckString = Object.keys(userData)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${userData[key]}`)
    .join('\n')
  
  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  
  return Response.json({ 
    valid: hash === userData.hash 
  })
}
```

2. **Обновите компонент** для использования проверки:

```javascript
const verifyTelegramAuth = async (user) => {
  const response = await fetch('/api/auth/telegram/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  })
  const { valid } = await response.json()
  return valid
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"Bot domain invalid"**
   - Make sure you set the correct domain with `/setdomain`
   - Domain should match exactly (no http/https prefix)

2. **"Widget not loading"**
   - Check if the bot username is correct
   - Ensure the script is loaded properly
   - Check browser console for errors

3. **"Auth fails silently"**
   - Check browser console for JavaScript errors
   - Verify the callback function is defined globally
   - Ensure Supabase client is properly initialized

4. **"User creation fails"**
   - Check Supabase logs in the dashboard
   - Verify email/password requirements
   - Check if the user already exists

### Debug Mode

Добавьте это для детальных логов:

```javascript
// В компоненте TelegramAuth
console.log('Авторизация Telegram запущена')
console.log('Имя бота:', botUsername)
console.log('Контейнер виджета:', document.getElementById('telegram-login-container'))
```

## 📱 Mobile Considerations

The Telegram widget works on mobile devices, but:
- Users need the Telegram app installed
- The widget will open the Telegram app for authorization
- Consider adding a fallback for users without Telegram

## 🚀 Production Deployment

### Environment Variables for Vercel

Add these in your Vercel dashboard:
```
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=calendly_mvp_auth_bot
TELEGRAM_BOT_TOKEN=ваш_токен_бота
```

### Domain Configuration

Make sure your production domain is set in:
1. **BotFather** (`/setdomain`)
2. **Vercel** environment variables
3. **Supabase** redirect URLs (if using OAuth)

## 🔄 Migration from Email Auth

If you have existing users, they can:
1. **Link Telegram** to existing accounts (requires custom implementation)
2. **Use both** email and Telegram login methods
3. **Merge accounts** based on email matching (advanced)

## 📊 Analytics

Отслеживайте использование Telegram авторизации:
```javascript
// В обработчике onAuth
gtag('event', 'login', {
  method: 'telegram'
})

// Или с вашим провайдером аналитики
analytics.track('User Logged In', {
  method: 'telegram',
  telegram_id: user.id
})
```

---

## 🎯 Next Steps

After setting up Telegram auth:
1. **Test thoroughly** on different devices
2. **Add error handling** for edge cases
3. **Implement hash verification** for security
4. **Add user profile management** for Telegram users
5. **Consider social features** (since users have Telegram handles)

## 💡 Pro Tips

- **Telegram usernames** are great for creating user-friendly booking URLs
- **Profile photos** from Telegram enhance the user experience
- **Telegram IDs** are permanent and can be used for user identification
- **Consider bot notifications** for booking confirmations (separate feature)

---

**Need help?** Check the [Telegram Bot API documentation](https://core.telegram.org/bots/webapps) or create an issue in the repository. 
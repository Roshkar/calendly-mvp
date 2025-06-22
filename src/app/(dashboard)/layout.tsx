'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, Settings, LogOut, Plus, Clock } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    getUser()
  }, [router, supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Calendly MVP</h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard/event-types" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <Calendar className="h-4 w-4" />
              <span>События</span>
            </Link>
            <Link href="/dashboard/availability" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <Clock className="h-4 w-4" />
              <span>Доступность</span>
            </Link>
            <Link href="/dashboard/settings" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <Settings className="h-4 w-4" />
              <span>Настройки</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/dashboard/event-types/new">
              <Button size="sm" className="flex items-center space-x-1">
                <Plus className="h-4 w-4" />
                <span>Создать событие</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 
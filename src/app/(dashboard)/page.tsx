'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Users, Plus, ArrowRight } from 'lucide-react'

interface EventType {
  id: string
  title: string
  duration: number
  description: string
  created_at: string
}

export default function DashboardPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('event_types')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) {
          console.error('Error fetching event types:', error)
        } else {
          setEventTypes(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEventTypes()
  }, [supabase])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать!</h1>
          <p className="text-gray-600 mt-2">Управляйте своими событиями и встречами</p>
        </div>
        <Link href="/dashboard/event-types/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Создать событие</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего событий</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventTypes.length}</div>
            <p className="text-xs text-muted-foreground">Активных типов событий</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Встреч за месяц</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Запланированных встреч</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее время</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30м</div>
            <p className="text-xs text-muted-foreground">Длительность события</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Event Types */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ваши события</CardTitle>
              <CardDescription>Последние созданные типы событий</CardDescription>
            </div>
            <Link href="/dashboard/event-types">
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <span>Все события</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : eventTypes.length > 0 ? (
            <div className="space-y-4">
              {eventTypes.map((eventType) => (
                <div key={eventType.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{eventType.title}</h3>
                      <p className="text-sm text-gray-600">{eventType.duration} минут</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">Поделиться</Button>
                    <Button variant="ghost" size="sm">Редактировать</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет событий</h3>
              <p className="text-gray-600 mb-4">Создайте свое первое событие для начала работы</p>
              <Link href="/dashboard/event-types/new">
                <Button>Создать событие</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Настроить доступность</span>
            </CardTitle>
            <CardDescription>
              Установите свои рабочие часы и доступные дни
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/availability">
              <Button variant="outline" className="w-full">
                Настроить
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Посмотреть профиль</span>
            </CardTitle>
            <CardDescription>
              Управляйте информацией профиля и настройками
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full">
                Открыть
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
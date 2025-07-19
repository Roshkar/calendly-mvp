export interface EventType {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  duration_minutes: number
  color: string
  is_active: boolean
  location_type: 'online' | 'in_person' | 'phone'
  location_details: string | null
  event_type_category: 'individual' | 'group'
  max_participants: number
  created_at: string
  updated_at: string
}

export interface CreateEventTypeData {
  name: string
  slug: string
  description?: string
  duration_minutes: number
  color?: string
  location_type: 'online' | 'in_person' | 'phone'
  location_details?: string
  event_type_category: 'individual' | 'group'
  max_participants?: number
} 
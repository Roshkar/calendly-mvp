export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_types: {
        Row: {
          id: string
          user_id: string
          name: string
          short_id: string
          description: string | null
          duration_minutes: number
          color: string
          is_active: boolean
          location_type: string
          location_details: string | null
          event_type_category: string
          max_participants: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          short_id: string
          description?: string | null
          duration_minutes?: number
          color?: string
          is_active?: boolean
          location_type?: string
          location_details?: string | null
          event_type_category?: string
          max_participants?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          short_id?: string
          description?: string | null
          duration_minutes?: number
          color?: string
          is_active?: boolean
          location_type?: string
          location_details?: string | null
          event_type_category?: string
          max_participants?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_types_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          event_type_id: string
          invitee_name: string
          invitee_email: string
          start_time: string
          end_time: string
          timezone: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_type_id: string
          invitee_name: string
          invitee_email: string
          start_time: string
          end_time: string
          timezone?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_type_id?: string
          invitee_name?: string
          invitee_email?: string
          start_time?: string
          end_time?: string
          timezone?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_type_id_fkey"
            columns: ["event_type_id"]
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 
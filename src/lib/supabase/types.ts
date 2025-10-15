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
          google_refresh_token: string | null
          google_access_token: string | null
          google_token_expires_at: string | null
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
          google_refresh_token?: string | null
          google_access_token?: string | null
          google_token_expires_at?: string | null
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
          google_refresh_token?: string | null
          google_access_token?: string | null
          google_token_expires_at?: string | null
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
          create_google_meet: boolean
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
          create_google_meet?: boolean
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
          create_google_meet?: boolean
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
      availability_slots: {
        Row: {
          id: string
          event_type_id: string
          date: string
          start_time: string
          end_time: string
          is_active: boolean
          current_participants: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_type_id: string
          date: string
          start_time: string
          end_time: string
          is_active?: boolean
          current_participants?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_type_id?: string
          date?: string
          start_time?: string
          end_time?: string
          is_active?: boolean
          current_participants?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_event_type_id_fkey"
            columns: ["event_type_id"]
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          event_type_id: string
          availability_slot_id: string | null
          invitee_name: string
          invitee_email: string
          start_time: string
          end_time: string
          timezone: string
          status: string
          meeting_url: string | null
          external_event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_type_id: string
          availability_slot_id?: string | null
          invitee_name: string
          invitee_email: string
          start_time: string
          end_time: string
          timezone?: string
          status?: string
          meeting_url?: string | null
          external_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_type_id?: string
          availability_slot_id?: string | null
          invitee_name?: string
          invitee_email?: string
          start_time?: string
          end_time?: string
          timezone?: string
          status?: string
          meeting_url?: string | null
          external_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_type_id_fkey"
            columns: ["event_type_id"]
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_availability_slot_id_fkey"
            columns: ["availability_slot_id"]
            referencedRelation: "availability_slots"
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
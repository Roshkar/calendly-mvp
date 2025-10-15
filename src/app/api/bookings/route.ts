'use server'

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createGoogleCalendarEvent } from '@/lib/google'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      event_type_id,
      availability_slot_id,
      invitee_name,
      invitee_email,
      start_time,
      end_time,
      timezone,
    } = body

    const supabase = createServerSupabaseClient()

    // Fetch event type and organizer
    const { data: eventType, error: eventTypeError } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', event_type_id)
      .single()
    if (eventTypeError || !eventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    // Create booking first
    const { data: bookingRows, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          event_type_id,
          availability_slot_id: availability_slot_id || null,
          invitee_name,
          invitee_email,
          start_time,
          end_time,
          timezone: timezone || 'Europe/Moscow',
          status: 'confirmed',
        },
      ])
      .select()
    if (bookingError || !bookingRows || !bookingRows[0]) {
      return NextResponse.json({ error: bookingError?.message || 'Failed to create booking' }, { status: 400 })
    }
    const booking = bookingRows[0]

    let meeting_url: string | null = null
    let external_event_id: string | null = null

    if (eventType.create_google_meet) {
      try {
        const { hangoutLink, eventId } = await createGoogleCalendarEvent({
          organizerUserId: eventType.user_id,
          summary: eventType.name,
          description: `Встреча с ${invitee_name}`,
          start: new Date(start_time).toISOString(),
          end: new Date(end_time).toISOString(),
          timezone: timezone || 'Europe/Moscow',
          attendeeEmail: invitee_email,
        })
        meeting_url = hangoutLink
        external_event_id = eventId
      } catch (err: any) {
        // Log but do not fail booking creation
        console.error('Google event creation failed:', err?.message || err)
      }
    }

    if (meeting_url || external_event_id) {
      await supabase
        .from('bookings')
        .update({ meeting_url, external_event_id })
        .eq('id', booking.id)
    }

    return NextResponse.json({
      booking: { ...booking, meeting_url, external_event_id },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}




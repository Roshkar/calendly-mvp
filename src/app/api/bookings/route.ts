'use server'

import { NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
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

    const supabase = createRouteHandlerSupabaseClient()

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
    let googleMeetDebug: any = null

    if (eventType.create_google_meet) {
      console.log('🔵 [BOOKING API] Google Meet enabled for event:', eventType.name)
      console.log('🔵 [BOOKING API] Organizer ID:', eventType.user_id)
      
      // Проверяем наличие токенов у организатора
      const { data: organizerProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('google_refresh_token, google_access_token')
        .eq('id', eventType.user_id)
        .single()
      
      if (profileCheckError) {
        console.error('❌ [BOOKING API] Error checking organizer profile:', profileCheckError)
        googleMeetDebug = { error: 'Profile check failed', details: profileCheckError.message }
      } else if (!organizerProfile?.google_refresh_token) {
        console.error('❌ [BOOKING API] No Google refresh token found for organizer')
        googleMeetDebug = { error: 'No refresh token', hasAccessToken: !!organizerProfile?.google_access_token }
      } else {
        console.log('✅ [BOOKING API] Organizer has Google tokens, creating Meet...')
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
          console.log('✅ [BOOKING API] Google Meet created:', { hangoutLink, eventId })
          meeting_url = hangoutLink
          external_event_id = eventId
          googleMeetDebug = { success: true, hangoutLink, eventId }
        } catch (err: any) {
          // Log but do not fail booking creation
          console.error('❌ [BOOKING API] Google event creation failed:', err?.message || err)
          console.error('❌ [BOOKING API] Full error:', JSON.stringify(err, null, 2))
          googleMeetDebug = { error: err?.message || 'Unknown error', details: err }
        }
      }
    } else {
      console.log('⚠️ [BOOKING API] Google Meet disabled for this event type')
      googleMeetDebug = { disabled: true }
    }

    if (meeting_url || external_event_id) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ meeting_url, external_event_id })
        .eq('id', booking.id)
      
      if (updateError) {
        console.error('❌ [BOOKING API] Failed to update booking with Meet URL:', updateError)
      }
    }

    return NextResponse.json({
      booking: { ...booking, meeting_url, external_event_id },
      debug: googleMeetDebug,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}




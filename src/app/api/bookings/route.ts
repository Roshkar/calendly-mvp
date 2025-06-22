import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()
    
    console.log('📝 API: Creating booking with data:', bookingData)
    
    // Validate required fields
    const requiredFields = ['event_type_id', 'invitee_name', 'invitee_email', 'start_time', 'end_time', 'timezone']
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Create booking using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([{
        event_type_id: bookingData.event_type_id,
        invitee_name: bookingData.invitee_name,
        invitee_email: bookingData.invitee_email,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        timezone: bookingData.timezone,
        status: bookingData.status || 'confirmed'
      }])
      .select()
      .single()
    
    if (error) {
      console.error('❌ API: Error creating booking:', error)
      return NextResponse.json(
        { error: 'Failed to create booking: ' + error.message },
        { status: 500 }
      )
    }
    
    console.log('✅ API: Booking created successfully:', data)
    
    return NextResponse.json({ 
      success: true, 
      booking: data 
    })
    
  } catch (error) {
    console.error('❌ API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
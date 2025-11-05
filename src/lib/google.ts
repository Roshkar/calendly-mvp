import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

interface RefreshTokenResponse {
  access_token: string
  expires_in: number
  scope?: string
  token_type: string
}

export async function getValidGoogleAccessToken(userId: string) {
  const supabase = createRouteHandlerSupabaseClient()
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('google_access_token, google_refresh_token, google_token_expires_at')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    console.error('Profile not found or error:', profileError)
    return null
  }

  console.log('Profile tokens:', { 
    hasRefreshToken: !!profile.google_refresh_token,
    hasAccessToken: !!profile.google_access_token,
    expiresAt: profile.google_token_expires_at 
  })

  const now = new Date()
  const isExpired = !profile.google_token_expires_at || new Date(profile.google_token_expires_at) <= now

  if (!isExpired && profile.google_access_token) {
    console.log('Using existing access token')
    return profile.google_access_token
  }

  if (!profile.google_refresh_token) {
    console.error('No refresh token found in profile')
    return null
  }
  
  console.log('Refreshing access token...')

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth env vars are not set')
  }

  const params = new URLSearchParams()
  params.set('client_id', clientId)
  params.set('client_secret', clientSecret)
  params.set('refresh_token', profile.google_refresh_token)
  params.set('grant_type', 'refresh_token')

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error('Failed to refresh Google token: ' + text)
  }
  const data = (await resp.json()) as RefreshTokenResponse

  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()
  await supabase
    .from('profiles')
    .update({ google_access_token: data.access_token, google_token_expires_at: expiresAt })
    .eq('id', userId)

  return data.access_token
}

export async function createGoogleCalendarEvent(params: {
  organizerUserId: string
  summary: string
  description?: string
  start: string
  end: string
  timezone: string
  attendeeEmail: string
}) {
  console.log('🟢 [GOOGLE] Starting createGoogleCalendarEvent for organizer:', params.organizerUserId)
  const accessToken = await getValidGoogleAccessToken(params.organizerUserId)
  
  if (!accessToken) {
    console.error('❌ [GOOGLE] No valid access token obtained')
    return { hangoutLink: null, eventId: null }
  }
  
  console.log('✅ [GOOGLE] Access token obtained, length:', accessToken.length)

  const eventPayload = {
    summary: params.summary,
    description: params.description || '',
    start: { dateTime: params.start, timeZone: params.timezone },
    end: { dateTime: params.end, timeZone: params.timezone },
    attendees: [{ email: params.attendeeEmail }],
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  }

  console.log('🟢 [GOOGLE] Event payload:', JSON.stringify(eventPayload, null, 2))
  console.log('🟢 [GOOGLE] Sending request to Google Calendar API...')

  const apiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all'
  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  })

  console.log('🟢 [GOOGLE] Response status:', resp.status, resp.statusText)

  if (!resp.ok) {
    const text = await resp.text()
    console.error('❌ [GOOGLE] Google API error response:', text)
    throw new Error(`Failed to create Google Calendar event (${resp.status}): ${text}`)
  }
  
  const data = await resp.json()
  console.log('✅ [GOOGLE] Google API response:', JSON.stringify(data, null, 2))
  
  const hangoutLink = data?.hangoutLink || data?.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri || null
  console.log('✅ [GOOGLE] Extracted hangoutLink:', hangoutLink)
  console.log('✅ [GOOGLE] Event ID:', data?.id)
  
  return { hangoutLink, eventId: data?.id || null }
}




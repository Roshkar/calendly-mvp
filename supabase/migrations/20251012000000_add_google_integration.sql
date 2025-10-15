-- Add Google integration fields and meeting link storage
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS google_access_token TEXT,
  ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMPTZ;

ALTER TABLE public.event_types
  ADD COLUMN IF NOT EXISTS create_google_meet BOOLEAN DEFAULT false;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS external_event_id TEXT;



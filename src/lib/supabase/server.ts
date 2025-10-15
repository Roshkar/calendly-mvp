import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './types'

export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

export const createRouteHandlerSupabaseClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}
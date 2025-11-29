/**
 * Supabase Client Configuration
 * Handles both server-side (service role) and client-side (anon) clients
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

// TypeScript now knows these are defined after the check above
const url: string = supabaseUrl
const serviceRoleKey: string = supabaseServiceRoleKey
const anonKey: string = supabaseAnonKey || supabaseServiceRoleKey

/**
 * Server-side Supabase client with service role key
 * This bypasses Row Level Security - use carefully!
 * Use for admin operations, background jobs, etc.
 * 
 * IMPORTANT: The service role key should start with "eyJ" and be much longer than the anon key.
 * If RLS errors occur, verify that SUPABASE_SERVICE_ROLE_KEY is set correctly.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  url,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Verify service role key on startup (only in development)
if (process.env.NODE_ENV !== 'production') {
  if (serviceRoleKey.length < 100) {
    console.warn('⚠️  WARNING: Service role key seems too short. Service role keys are typically very long (200+ characters).')
    console.warn('⚠️  Make sure you are using the SERVICE_ROLE key, not the anon key!')
    console.warn('⚠️  Find it in: Supabase Dashboard > Settings > API > service_role (secret)')
  }
}

/**
 * Client-side Supabase client with anon key
 * This respects Row Level Security policies
 * Use for user-facing operations
 */
export function createSupabaseClient(accessToken?: string): SupabaseClient {
  const client = createClient(url, anonKey, {
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  })

  return client
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('count').limit(0)
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    console.log('✅ Supabase connected successfully!')
    return true
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}

export default supabaseAdmin


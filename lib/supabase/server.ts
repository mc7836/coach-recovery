import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

// Server-side Supabase client bound to the request's auth cookies. Queries run
// as the signed-in user, so Row Level Security policies decide what's visible —
// unlike the old service-role client, which bypassed RLS entirely.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // `setAll` was called from a Server Component, where cookies are
            // read-only. Safe to ignore — the proxy refreshes the session.
          }
        },
      },
    }
  )
}

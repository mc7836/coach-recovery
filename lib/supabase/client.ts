import { createBrowserClient } from '@supabase/ssr'

// Browser Supabase client for Client Components (login/signup forms). Reads the
// public env vars Next.js inlines at build time — never import `@/lib/env` here,
// as it references server-only secrets.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

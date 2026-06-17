import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

// Paths an unauthenticated visitor is allowed to reach.
const PUBLIC_PATHS = ['/login', '/signup', '/disclaimer']
// Auth pages a signed-in user should be bounced away from (subset of public).
const AUTH_PATHS = ['/login', '/signup']

function matchesAny(paths: string[], pathname: string): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

// Refreshes the Supabase session cookie on every request and redirects based on
// auth state. Runs in the proxy (Next.js 16's renamed middleware), Node runtime.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: do not run code between createServerClient and getUser() — it
  // refreshes the token and keeps the cookie in sync.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Send unauthenticated users to the login page (except on public pages).
  if (!user && !matchesAny(PUBLIC_PATHS, path)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Keep authenticated users away from the login/signup pages (but the
  // disclaimer stays readable to everyone).
  if (user && matchesAny(AUTH_PATHS, path)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: return supabaseResponse so refreshed cookies reach the browser.
  return supabaseResponse
}

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

// Next.js 16 renamed Middleware to Proxy. This file must live at the project
// root and export a `proxy` function (or default export) + `config`.
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Run on all request paths except:
     * - api routes
     * - _next/static and _next/image (build assets)
     * - favicon.ico and common static image files
     * Auth still runs on every page and Server Action route below this.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

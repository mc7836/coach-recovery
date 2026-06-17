import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Stroke Recovery Coach',
  description: 'AI-powered stroke recovery coaching and workout tracking',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">SR</span>
            </div>
            <a href="/" className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
              Stroke Recovery Coach
            </a>
            {user && (
              <div className="ml-auto flex items-center gap-3">
                <span className="text-sm text-slate-500 hidden sm:inline">{user.email}</span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Log out
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">{children}</main>
        <footer className="bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-slate-400">
              This app is not a substitute for professional medical or physical therapy advice.
              Always follow your physical therapist&apos;s guidance.{' '}
              <Link href="/disclaimer" className="underline hover:text-blue-600 transition-colors">
                Learn more
              </Link>
            </p>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/feedback"
                className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                Feedback
              </Link>
              <Link
                href="/disclaimer"
                className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}

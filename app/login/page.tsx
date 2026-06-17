'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, type AuthState } from '@/app/auth/actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    undefined
  )

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mb-4">
            <span className="text-white text-lg font-bold">SR</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Stroke Recovery Coach</h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            A personal dashboard for tracking stroke recovery progress — log workouts, follow stage-specific exercise plans, and monitor improvement over time.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Welcome back</h2>
          <p className="text-slate-500 mt-0.5 text-sm">Log in to your coaching dashboard.</p>
        </div>

        {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {pending && (
              <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {pending ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}

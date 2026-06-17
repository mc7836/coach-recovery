'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { submitFeedback, type FeedbackState } from './actions'

export default function FeedbackPage() {
  const [state, action, pending] = useActionState<FeedbackState, FormData>(
    submitFeedback,
    undefined
  )

  return (
    <div className="min-h-[60vh] flex items-start justify-center pt-8">
      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Share Feedback</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Suggestions, bug reports, and clinical input are all welcome.
          </p>
        </div>

        {state?.success ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
            <p className="text-2xl">✓</p>
            <p className="font-semibold text-slate-900">Thank you!</p>
            <p className="text-sm text-slate-500">Your feedback has been received.</p>
            <Link href="/" className="inline-block mt-2 text-sm text-blue-600 hover:underline">
              Back to home
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            {state?.error && (
              <p className="text-red-500 text-sm mb-4">{state.error}</p>
            )}
            <form action={action} className="space-y-5">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                  Your thoughts <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Share your thoughts, suggestions, or what's not working…"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email{' '}
                  <span className="text-slate-400 font-normal">(optional, if you'd like a reply)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {pending && (
                    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {pending ? 'Submitting…' : 'Submit'}
                </button>
                <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

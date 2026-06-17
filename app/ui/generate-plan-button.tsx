'use client'

import { useTransition } from 'react'
import { generateWeeklyPlan } from '@/app/actions'

export default function GeneratePlanButton({ patientId }: { patientId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => generateWeeklyPlan(patientId))}
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {isPending ? 'Generating plan…' : 'Generate Weekly Plan'}
    </button>
  )
}

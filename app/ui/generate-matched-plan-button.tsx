'use client'

import { useTransition } from 'react'
import { generateMatchedPlan } from '@/app/actions'

// Token-free, algorithm-based alternative to the AI "Generate Weekly Plan".
export default function GenerateMatchedPlanButton({ patientId }: { patientId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => generateMatchedPlan(patientId))}
      disabled={isPending}
      title="Build a plan from the matching algorithm — no AI, zero API calls"
      className="inline-flex items-center gap-2 border border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {isPending ? 'Matching…' : 'Generate Matched Plan'}
    </button>
  )
}

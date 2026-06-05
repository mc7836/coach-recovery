'use client'

import { useTransition } from 'react'
import { generateWeeklyPlan } from '@/app/actions'

export default function GeneratePlanButton({ patientId }: { patientId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => generateWeeklyPlan(patientId))}
      disabled={isPending}
      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? 'Generating plan…' : 'Generate Weekly Plan'}
    </button>
  )
}

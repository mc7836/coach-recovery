import type { Exercise } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Small, muted caption noting where an exercise came from. Renders "Library"
// for seeded reference exercises, or "Self-logged · <date added>" for ones a
// user created through the workout logger. Works in both server and client
// components (no hooks / no 'use client').
export default function ExerciseSource({
  source,
  date,
  className = '',
}: {
  source: Exercise['source']
  date?: string | null
  className?: string
}) {
  const label =
    source === 'self_logged'
      ? `Self-logged${date ? ` · ${formatDate(date)}` : ''}`
      : 'Library'

  return (
    <span className={`text-[11px] leading-tight text-slate-400 ${className}`}>
      {label}
    </span>
  )
}

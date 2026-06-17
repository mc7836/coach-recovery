'use client'

import { useTransition } from 'react'
import type { Patient, PrimaryGoal } from '@/types'
import { MOTOR_STAGES } from '@/lib/recovery'

const AFFECTED_SIDES: { value: string; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'bilateral', label: 'Bilateral' },
]

const RECOVERY_STAGES: { value: string; label: string }[] = [
  { value: 'acute', label: 'Acute (first weeks)' },
  { value: 'subacute', label: 'Subacute (weeks–months)' },
  { value: 'chronic', label: 'Chronic (6+ months)' },
]

const FUNCTIONAL_LEVELS: { value: string; label: string }[] = [
  { value: 'bedbound', label: 'Bedbound' },
  { value: 'sitting_balance', label: 'Sitting balance' },
  { value: 'standing_balance', label: 'Standing balance' },
  { value: 'walking_independent', label: 'Walking independently' },
]

const PRIMARY_GOALS: PrimaryGoal[] = [
  'strength',
  'balance',
  'mobility',
  'endurance',
  'coordination',
]

const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

export default function PatientForm({
  action,
  patient,
  submitLabel,
  pendingLabel,
}: {
  action: (formData: FormData) => Promise<void>
  patient?: Patient
  submitLabel: string
  pendingLabel: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => action(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={patient?.name ?? ''}
          className={inputClass}
          placeholder="Patient full name"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="affected_side" className={labelClass}>
            Affected side
          </label>
          <select
            id="affected_side"
            name="affected_side"
            defaultValue={patient?.affected_side ?? ''}
            className={inputClass}
          >
            <option value="">—</option>
            {AFFECTED_SIDES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="recovery_stage" className={labelClass}>
            Recovery stage
          </label>
          <select
            id="recovery_stage"
            name="recovery_stage"
            defaultValue={patient?.recovery_stage ?? ''}
            className={inputClass}
          >
            <option value="">—</option>
            {RECOVERY_STAGES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="functional_level" className={labelClass}>
            Functional level
          </label>
          <select
            id="functional_level"
            name="functional_level"
            defaultValue={patient?.functional_level ?? ''}
            className={inputClass}
          >
            <option value="">—</option>
            {FUNCTIONAL_LEVELS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Brunnstrom motor stage (manual override — see note) */}
      <div>
        <label htmlFor="motor_stage" className={labelClass}>
          Motor recovery stage (Brunnstrom)
        </label>
        <select
          id="motor_stage"
          name="motor_stage"
          defaultValue={patient?.motor_stage != null ? String(patient.motor_stage) : ''}
          className={inputClass}
        >
          <option value="">— Not set —</option>
          {MOTOR_STAGES.map((m) => (
            <option key={m.stage} value={String(m.stage)}>
              Stage {m.stage} — {m.title}: {m.description}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1.5">
          You can set this yourself, but please confirm the stage with your
          physical therapist — it drives the exercise recommendations.
        </p>
      </div>

      <div>
        <span className={labelClass}>Primary goals</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-1">
          {PRIMARY_GOALS.map((goal) => (
            <label key={goal} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="primary_goals"
                value={goal}
                defaultChecked={patient?.primary_goals?.includes(goal) ?? false}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="capitalize">{goal}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={patient?.notes ?? ''}
          className={`${inputClass} resize-none`}
          placeholder="Diagnosis, precautions, other context..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending && (
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  )
}

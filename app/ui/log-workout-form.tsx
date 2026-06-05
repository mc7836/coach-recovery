'use client'

import { useTransition, useState } from 'react'
import type { Exercise } from '@/types'

type Props = {
  exercises: Exercise[]
  action: (formData: FormData) => Promise<void>
  defaultDate: string
}

const CATEGORY_LABELS: Record<string, string> = {
  legs: 'Legs',
  arms: 'Arms',
  torso: 'Torso',
}

export default function LogWorkoutForm({ exercises, action, defaultDate }: Props) {
  const [isPending, startTransition] = useTransition()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const byCategory = exercises.reduce<Record<string, Exercise[]>>((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = []
    acc[ex.category].push(ex)
    return acc
  }, {})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => action(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Date + overall */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultDate}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="overall_rating" className="block text-sm font-medium text-slate-700 mb-1">
            Overall Rating (1–10)
          </label>
          <input
            id="overall_rating"
            name="overall_rating"
            type="number"
            min={1}
            max={10}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. 7"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="weekly_notes" className="block text-sm font-medium text-slate-700 mb-1">
            Weekly Notes
          </label>
          <textarea
            id="weekly_notes"
            name="weekly_notes"
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="How is the patient progressing this week? Any concerns or wins?"
          />
        </div>
      </div>

      {/* Exercises by category */}
      {Object.entries(byCategory).map(([category, exs]) => (
        <div key={category} className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">{CATEGORY_LABELS[category] ?? category}</h2>
          <div className="space-y-6">
            {exs.map((ex) => (
              <div key={ex.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    id={`completed_${ex.id}`}
                    name={`completed_${ex.id}`}
                    type="checkbox"
                    checked={checked[ex.id] ?? false}
                    onChange={(e) =>
                      setChecked((prev) => ({ ...prev, [ex.id]: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`completed_${ex.id}`}
                    className="font-medium text-sm text-slate-800 cursor-pointer"
                  >
                    {ex.name}
                  </label>
                </div>

                <div className="ml-7 grid sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`difficulty_${ex.id}`}
                      className="block text-xs font-medium text-slate-500 mb-1"
                    >
                      Difficulty
                    </label>
                    <select
                      id={`difficulty_${ex.id}`}
                      name={`difficulty_${ex.id}`}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">— select —</option>
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor={`notes_${ex.id}`}
                      className="block text-xs font-medium text-slate-500 mb-1"
                    >
                      Notes
                    </label>
                    <input
                      id={`notes_${ex.id}`}
                      name={`notes_${ex.id}`}
                      type="text"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any observations..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Saving...' : 'Save Workout'}
        </button>
      </div>
    </form>
  )
}

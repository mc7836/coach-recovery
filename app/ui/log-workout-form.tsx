'use client'

import { useRef, useState, useTransition } from 'react'
import type { Exercise } from '@/types'

type Props = {
  exercises: Exercise[]
  action: (formData: FormData) => Promise<void>
  defaultDate: string
}

type Entry = {
  key: string
  exerciseId: string | null // null => new exercise to be created on submit
  name: string
  category: Exercise['category']
  timeMinutes: string
  reps: string
  weight: string
  notes: string
}

const CATEGORY_LABELS: Record<Exercise['category'], string> = {
  legs: 'Legs',
  arms: 'Arms',
  torso: 'Torso',
}

const CATEGORIES: Exercise['category'][] = ['legs', 'arms', 'torso']

export default function LogWorkoutForm({ exercises, action, defaultDate }: Props) {
  const [isPending, startTransition] = useTransition()
  const [entries, setEntries] = useState<Entry[]>([])
  const [query, setQuery] = useState('')
  const keyCounter = useRef(0)

  const nextKey = () => `entry-${keyCounter.current++}`

  const addedIds = new Set(entries.map((e) => e.exerciseId).filter(Boolean))
  const trimmed = query.trim()

  const suggestions = trimmed
    ? exercises
        .filter(
          (ex) =>
            ex.name.toLowerCase().includes(trimmed.toLowerCase()) &&
            !addedIds.has(ex.id)
        )
        .slice(0, 8)
    : []

  const exactMatch = exercises.find(
    (ex) => ex.name.toLowerCase() === trimmed.toLowerCase()
  )

  function addExisting(ex: Exercise) {
    setEntries((prev) => [
      ...prev,
      {
        key: nextKey(),
        exerciseId: ex.id,
        name: ex.name,
        category: ex.category,
        timeMinutes: '',
        reps: '',
        weight: '',
        notes: '',
      },
    ])
    setQuery('')
  }

  function addNew(name: string) {
    setEntries((prev) => [
      ...prev,
      {
        key: nextKey(),
        exerciseId: null,
        name,
        category: 'legs',
        timeMinutes: '',
        reps: '',
        weight: '',
        notes: '',
      },
    ])
    setQuery('')
  }

  // Enter / "Add" button: reuse an existing exercise when the text matches one,
  // otherwise create a brand-new exercise.
  function commitQuery() {
    if (!trimmed) return
    if (exactMatch && !addedIds.has(exactMatch.id)) {
      addExisting(exactMatch)
    } else if (!exactMatch) {
      addNew(trimmed)
    } else {
      // exact match already added — just clear the box
      setQuery('')
    }
  }

  function updateEntry(key: string, patch: Partial<Entry>) {
    setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, ...patch } : e)))
  }

  function removeEntry(key: string) {
    setEntries((prev) => prev.filter((e) => e.key !== key))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData()
    formData.set('date', (form.elements.namedItem('date') as HTMLInputElement).value)
    formData.set(
      'overall_rating',
      (form.elements.namedItem('overall_rating') as HTMLInputElement).value
    )
    formData.set(
      'weekly_notes',
      (form.elements.namedItem('weekly_notes') as HTMLTextAreaElement).value
    )
    formData.set(
      'entries',
      JSON.stringify(
        entries.map((en) => ({
          exerciseId: en.exerciseId,
          name: en.name.trim(),
          category: en.category,
          timeMinutes: en.timeMinutes ? parseInt(en.timeMinutes) : null,
          reps: en.reps ? parseInt(en.reps) : null,
          weight: en.weight ? parseFloat(en.weight) : null,
          notes: en.notes.trim() || null,
        }))
      )
    )
    startTransition(() => action(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Date */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="max-w-xs">
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
      </div>

      {/* Exercise search + logged cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label htmlFor="exercise-search" className="block text-sm font-medium text-slate-700 mb-1">
            Exercises
          </label>
          <div className="relative">
            <div className="flex gap-2">
              <input
                id="exercise-search"
                type="text"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitQuery()
                  }
                }}
                placeholder="Type an exercise name..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={commitQuery}
                disabled={!trimmed}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>

            {/* Autocomplete dropdown */}
            {trimmed && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => addExisting(ex)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className="text-slate-800">{ex.name}</span>
                    <span className="text-xs text-slate-400">{CATEGORY_LABELS[ex.category]}</span>
                  </button>
                ))}
                {!exactMatch && (
                  <button
                    type="button"
                    onClick={() => addNew(trimmed)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-t border-slate-100 text-blue-700"
                  >
                    + Add &ldquo;{trimmed}&rdquo; as a new exercise
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Search the library, or type a new exercise and press Enter to add it.
          </p>
        </div>

        {/* Logged exercise cards */}
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No exercises logged yet.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.key}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50/50"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-slate-900">{entry.name}</span>
                    {entry.exerciseId === null ? (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        New
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {CATEGORY_LABELS[entry.category]}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.key)}
                    className="text-slate-400 hover:text-red-600 text-sm transition-colors shrink-0"
                    aria-label={`Remove ${entry.name}`}
                  >
                    Remove
                  </button>
                </div>

                {/* New exercises need a category so they group correctly */}
                {entry.exerciseId === null && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Category
                    </label>
                    <select
                      value={entry.category}
                      onChange={(e) =>
                        updateEntry(entry.key, {
                          category: e.target.value as Exercise['category'],
                        })
                      }
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Time (min)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={entry.timeMinutes}
                      onChange={(e) => updateEntry(entry.key, { timeMinutes: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Reps</label>
                    <input
                      type="number"
                      min={0}
                      value={entry.reps}
                      onChange={(e) => updateEntry(entry.key, { reps: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. 12"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Weight (kg)
                      <span className="text-slate-400 font-normal"> · optional</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={entry.weight}
                      onChange={(e) => updateEntry(entry.key, { weight: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. 2.5"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                    <input
                      type="text"
                      value={entry.notes}
                      onChange={(e) => updateEntry(entry.key, { notes: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any observations..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly notes + overall rating */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 grid sm:grid-cols-2 gap-4">
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

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Saving...' : 'Submit Workout Log'}
        </button>
      </div>
    </form>
  )
}

import { notFound } from 'next/navigation'
import { getPatient, getAllWeeklyPlans, getExercisesByIds } from '@/lib/db'
import GeneratePlanButton from '@/app/ui/generate-plan-button'
import GenerateMatchedPlanButton from '@/app/ui/generate-matched-plan-button'
import ExerciseSource from '@/app/ui/exercise-source'
import type { Exercise, PlannedDay } from '@/types'

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [patient, plans] = await Promise.all([getPatient(id), getAllWeeklyPlans(id)])

  if (!patient) notFound()

  const latestPlan = plans[0] ?? null

  // Resolve the exercises referenced by the latest plan so each one can show
  // where it came from. The plan stores only exercise_id, so look them up.
  const planExerciseIds = Array.from(
    new Set(
      (latestPlan?.plan.week ?? [])
        .flatMap((d) => d.exercises.map((e) => e.exercise_id))
        .filter(Boolean)
    )
  )
  const exercisesById = new Map(
    (await getExercisesByIds(planExerciseIds)).map((ex) => [ex.id, ex])
  )

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <a
            href={`/patients/${id}`}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← {patient.name}
          </a>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Weekly Plan</h1>
        </div>
        <div className="flex gap-3 flex-wrap">
          <GeneratePlanButton patientId={id} />
          <GenerateMatchedPlanButton patientId={id} />
        </div>
      </div>

      {!latestPlan ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-500 mb-4">No plan generated yet.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <GeneratePlanButton patientId={id} />
            <GenerateMatchedPlanButton patientId={id} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Week header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="font-semibold text-slate-900">
                Week of {formatDate(latestPlan.week_start)}
              </h2>
              <span className="text-xs text-slate-400">
                Generated {formatDate(latestPlan.created_at)}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Weekly Goals</p>
                <p className="text-slate-700 text-sm">{latestPlan.plan.weekly_goals}</p>
              </div>
              {latestPlan.plan.progression_notes && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 mt-3">Progression Notes</p>
                  <p className="text-slate-700 text-sm">{latestPlan.plan.progression_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Day cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latestPlan.plan.week.map((day: PlannedDay) => (
              <DayCard key={day.day} day={day} exercisesById={exercisesById} />
            ))}
          </div>

          {/* AI Reasoning */}
          {latestPlan.ai_reasoning && (
            <details className="bg-white rounded-xl border border-slate-200 p-6 group">
              <summary className="cursor-pointer font-semibold text-slate-900 list-none flex items-center justify-between">
                <span>AI Reasoning</span>
                <span className="text-slate-400 text-sm group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {latestPlan.ai_reasoning}
              </p>
            </details>
          )}

          {/* Older plans */}
          {plans.length > 1 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-3">Previous Plans</h2>
              <div className="space-y-2">
                {plans.slice(1).map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between text-sm text-slate-600 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span>Week of {formatDate(plan.week_start)}</span>
                    <span className="text-xs text-slate-400">
                      {plan.plan.week.filter((d) => !d.rest).length} active days
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DayCard({
  day,
  exercisesById,
}: {
  day: PlannedDay
  exercisesById: Map<string, Exercise>
}) {
  if (day.rest) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <p className="font-semibold text-slate-500">{day.day}</p>
        <p className="text-sm text-slate-400 italic mt-1">Rest day</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="font-semibold text-slate-900">{day.day}</p>
      <p className="text-xs text-blue-600 font-medium mt-0.5 mb-3">{day.focus}</p>
      <ul className="space-y-2">
        {day.exercises.map((ex, i) => {
          const match = exercisesById.get(ex.exercise_id)
          return (
            <li key={i} className="text-sm">
              <span className="text-slate-800">{ex.name}</span>
              <span className="text-slate-400 text-xs ml-1">
                {ex.sets}×{ex.reps}
              </span>
              {match && (
                <ExerciseSource
                  source={match.source}
                  date={match.date_introduced}
                  className="block mt-0.5"
                />
              )}
              {ex.notes && (
                <p className="text-xs text-slate-500 mt-0.5 italic">{ex.notes}</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00Z' : '')).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  )
}

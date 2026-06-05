import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPatient, getRecentWorkoutLogs, getLatestWeeklyPlan } from '@/lib/db'
import GeneratePlanButton from '@/app/ui/generate-plan-button'

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [patient, recentLogs, latestPlan] = await Promise.all([
    getPatient(id),
    getRecentWorkoutLogs(id, 5),
    getLatestWeeklyPlan(id),
  ])

  if (!patient) notFound()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
          {patient.notes && <p className="text-slate-500 mt-1 max-w-prose">{patient.notes}</p>}
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href={`/patients/${id}/log/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Log Workout
          </Link>
          <GeneratePlanButton patientId={id} />
          {latestPlan && (
            <Link
              href={`/patients/${id}/plan`}
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              View Plan
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Latest Plan Summary */}
        {latestPlan ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Current Weekly Plan</h2>
              <span className="text-xs text-slate-400">
                Week of {formatDate(latestPlan.week_start)}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-4">{latestPlan.plan.weekly_goals}</p>
            <div className="space-y-2">
              {latestPlan.plan.week.map((day) => (
                <div key={day.day} className="flex items-start gap-3 text-sm">
                  <span className="w-10 shrink-0 font-medium text-slate-500">
                    {day.day.slice(0, 3)}
                  </span>
                  {day.rest ? (
                    <span className="text-slate-400 italic">Rest day</span>
                  ) : (
                    <span className="text-slate-700">
                      {day.focus} — {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Link
              href={`/patients/${id}/plan`}
              className="inline-block mt-4 text-sm text-blue-600 hover:underline"
            >
              Full plan →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center gap-3">
            <p className="text-slate-500 text-sm">No weekly plan yet.</p>
            <GeneratePlanButton patientId={id} />
          </div>
        )}

        {/* Recent Logs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Workouts</h2>
          {recentLogs.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No workouts logged yet.</p>
          ) : (
            <div className="space-y-4">
              {recentLogs.map((log) => {
                const completed = log.workout_exercises.filter((we) => we.completed).length
                const total = log.workout_exercises.length
                return (
                  <div key={log.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{formatDate(log.date)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {completed}/{total} done
                        </span>
                        {log.overall_rating && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {log.overall_rating}/10
                          </span>
                        )}
                      </div>
                    </div>
                    {log.weekly_notes && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{log.weekly_notes}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {log.workout_exercises
                        .filter((we) => we.completed)
                        .map((we) => (
                          <span
                            key={we.id}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              we.difficulty === 'hard'
                                ? 'bg-red-50 text-red-700'
                                : we.difficulty === 'moderate'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {we.exercise.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

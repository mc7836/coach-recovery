import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getPatient,
  getRecentWorkoutLogs,
  getLatestWeeklyPlan,
  getRoadmapForStage,
} from '@/lib/db'
import { motorStageInfo } from '@/lib/recovery'
import GenerateMatchedPlanButton from '@/app/ui/generate-matched-plan-button'
import ExerciseSource from '@/app/ui/exercise-source'

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

  const stageInfo = motorStageInfo(patient.motor_stage)
  const roadmap = patient.motor_stage
    ? await getRoadmapForStage(patient.motor_stage)
    : null

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
          <GenerateMatchedPlanButton patientId={id} />
          <span className="text-xs text-slate-400 self-center">AI-powered plans coming soon</span>
          {latestPlan && (
            <Link
              href={`/patients/${id}/plan`}
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              View Plan
            </Link>
          )}
          <Link
            href={`/patients/${id}/edit`}
            className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Recovery Roadmap */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 className="font-semibold text-slate-900">Recovery Roadmap</h2>
          {patient.motor_stage && (
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Motor stage {patient.motor_stage} of 7
            </span>
          )}
        </div>

        {stageInfo ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">{stageInfo.title}</p>
              <p className="text-sm text-slate-600 mt-0.5">{stageInfo.description}</p>
            </div>
            {roadmap && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                    Typical focus
                  </p>
                  <p className="text-sm text-slate-700">{roadmap.typical_focus}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                    Precautions
                  </p>
                  <p className="text-sm text-slate-700">{roadmap.precautions}</p>
                </div>
              </div>
            )}
            <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">
              This roadmap is for educational guidance only. Always confirm your
              recovery stage and exercise plan with your physical therapist.
            </p>
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            <p>
              No motor stage set yet. Add this patient&apos;s Brunnstrom motor
              stage to see stage-specific focus and precautions.
            </p>
            <Link
              href={`/patients/${id}/edit`}
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              Set motor stage →
            </Link>
          </div>
        )}
      </section>

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
            <GenerateMatchedPlanButton patientId={id} />
            <p className="text-xs text-slate-400">AI-powered plans coming soon</p>
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
                const total = log.workout_exercises.length
                return (
                  <div key={log.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{formatDate(log.date)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {total} exercise{total !== 1 ? 's' : ''}
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
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {log.workout_exercises.map((we) => (
                        <span
                          key={we.id}
                          className="inline-flex flex-col text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-700"
                        >
                          <span>
                            {we.exercise.name}
                            {we.time_minutes != null && (
                              <span className="text-slate-400"> · {we.time_minutes}m</span>
                            )}
                          </span>
                          <ExerciseSource
                            source={we.exercise.source}
                            date={we.exercise.date_introduced}
                            className="mt-0.5"
                          />
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

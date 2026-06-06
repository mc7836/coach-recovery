import { notFound } from 'next/navigation'
import { getPatient, getExercisesAvailableAsOf } from '@/lib/db'
import { logWorkout } from '@/app/actions'
import LogWorkoutForm from '@/app/ui/log-workout-form'

export default async function LogWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const today = new Date().toISOString().split('T')[0]

  const [patient, exercises] = await Promise.all([
    getPatient(id),
    getExercisesAvailableAsOf(today),
  ])

  if (!patient) notFound()

  const boundAction = logWorkout.bind(null, id)

  return (
    <div className="space-y-6">
      <div>
        <a
          href={`/patients/${id}`}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← {patient.name}
        </a>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Log Workout</h1>
      </div>
      <LogWorkoutForm exercises={exercises} action={boundAction} defaultDate={today} />
    </div>
  )
}

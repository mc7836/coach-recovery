import { createClient } from './supabase/server'
import type {
  Patient,
  Exercise,
  WorkoutLogWithExercises,
  WeeklyPlan,
  Difficulty,
  RecoveryRoadmap,
} from '@/types'
import type { ExerciseSession } from './matching'

export async function getPatients(): Promise<Patient[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getPatient(id: string): Promise<Patient | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getExercisesAvailableAsOf(date: string): Promise<Exercise[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .lte('date_introduced', date)
    .order('category')
    .order('date_introduced')
  if (error) throw error
  return data
}

// Flattens this patient's logged workout_exercises into per-occurrence sessions
// for the auto-progression algorithm. Each logged row counts as a completed
// occurrence; perceived difficulty isn't captured by the logger yet (so it's
// null and rule 4 / completion counts drive progression today).
export async function getExerciseSessions(patientId: string): Promise<ExerciseSession[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workout_exercises')
    .select('exercise_id, exercise:exercises (*), log:workout_logs!inner (date, patient_id)')
    .eq('log.patient_id', patientId)
  if (error) throw error

  type Row = {
    exercise_id: string
    exercise: Exercise | null
    log: { date: string } | null
  }

  return (data as unknown as Row[])
    .filter((r) => r.exercise && r.log)
    .map((r) => ({
      exerciseId: r.exercise_id,
      category: r.exercise!.category,
      bodyParts: r.exercise!.body_part ?? [],
      currentDifficulty: (r.exercise!.difficulty ?? 'beginner') as Difficulty,
      date: r.log!.date,
      perceivedDifficulty: null,
      completed: true,
      skipped: false,
    }))
}

export async function getRoadmapForStage(
  motorStage: number
): Promise<RecoveryRoadmap | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recovery_roadmap')
    .select('*')
    .eq('motor_stage', motorStage)
    .single()
  if (error) return null
  return data as RecoveryRoadmap
}

export async function getExercisesByIds(ids: string[]): Promise<Exercise[]> {
  if (ids.length === 0) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .in('id', ids)
  if (error) throw error
  return data
}

export async function getExercisesDoneByPatient(patientId: string): Promise<Exercise[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workout_exercises')
    .select('exercise:exercises (*), log:workout_logs!inner (patient_id)')
    .eq('log.patient_id', patientId)
  if (error) throw error

  const seen = new Map<string, Exercise>()
  for (const row of (data as unknown as { exercise: Exercise | null }[])) {
    if (row.exercise) seen.set(row.exercise.id, row.exercise)
  }

  return Array.from(seen.values()).sort(
    (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  )
}

export async function getRecentWorkoutLogs(
  patientId: string,
  limit = 5
): Promise<WorkoutLogWithExercises[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workout_logs')
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercises (*)
      )
    `)
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as WorkoutLogWithExercises[]
}

export async function getLatestWeeklyPlan(patientId: string): Promise<WeeklyPlan | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('patient_id', patientId)
    .order('week_start', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data as WeeklyPlan
}

export async function getAllWeeklyPlans(patientId: string): Promise<WeeklyPlan[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('patient_id', patientId)
    .order('week_start', { ascending: false })
  if (error) throw error
  return data as WeeklyPlan[]
}

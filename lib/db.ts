import { getSupabaseClient } from './supabase'
import type { Patient, Exercise, WorkoutLogWithExercises, WeeklyPlan } from '@/types'

export async function getPatients(): Promise<Patient[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getPatient(id: string): Promise<Patient | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getExercisesAvailableAsOf(date: string): Promise<Exercise[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .lte('date_introduced', date)
    .order('category')
    .order('date_introduced')
  if (error) throw error
  return data
}

export async function getExercisesDoneByPatient(patientId: string): Promise<Exercise[]> {
  const supabase = getSupabaseClient()
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
  const supabase = getSupabaseClient()
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
  const supabase = getSupabaseClient()
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
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('patient_id', patientId)
    .order('week_start', { ascending: false })
  if (error) throw error
  return data as WeeklyPlan[]
}

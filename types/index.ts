export type Patient = {
  id: string
  name: string
  notes: string | null
  created_at: string
}

export type Exercise = {
  id: string
  name: string
  category: 'legs' | 'arms' | 'torso'
  date_introduced: string
}

export type WorkoutLog = {
  id: string
  patient_id: string
  date: string
  weekly_notes: string | null
  overall_rating: number | null
  created_at: string
}

export type WorkoutExercise = {
  id: string
  log_id: string
  exercise_id: string
  time_minutes: number | null
  reps: number | null
  weight: number | null
  notes: string | null
}

export type PlannedExercise = {
  exercise_id: string
  name: string
  sets: number
  reps: number
  notes?: string
}

export type PlannedDay = {
  day: string
  focus: string
  rest: boolean
  exercises: PlannedExercise[]
}

export type PlannedWeek = {
  week: PlannedDay[]
  weekly_goals: string
  progression_notes: string
}

export type WeeklyPlan = {
  id: string
  patient_id: string
  week_start: string
  plan: PlannedWeek
  ai_reasoning: string | null
  created_at: string
}

export type WorkoutLogWithExercises = WorkoutLog & {
  workout_exercises: (WorkoutExercise & { exercise: Exercise })[]
}

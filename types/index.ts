export type AffectedSide = 'left' | 'right' | 'bilateral'
export type RecoveryStage = 'acute' | 'subacute' | 'chronic'
export type FunctionalLevel =
  | 'bedbound'
  | 'sitting_balance'
  | 'standing_balance'
  | 'walking_independent'
export type PrimaryGoal =
  | 'strength'
  | 'balance'
  | 'mobility'
  | 'endurance'
  | 'coordination'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type Position = 'laying_down' | 'sitting' | 'standing' | 'walking'

export type Patient = {
  id: string
  name: string
  notes: string | null
  user_id: string | null
  created_at: string
  // Profile fields driving the token-free matching algorithm (migration 0006).
  affected_side: AffectedSide | null
  recovery_stage: RecoveryStage | null
  functional_level: FunctionalLevel | null
  primary_goals: PrimaryGoal[] | null
  // Brunnstrom motor recovery stage 1-7 (migration 0007).
  motor_stage: number | null
}

export type Exercise = {
  id: string
  name: string
  category: 'legs' | 'arms' | 'torso'
  date_introduced: string
  // 'library' = seeded reference data; 'self_logged' = added by a user via the
  // workout logger (date_introduced is the date it was added).
  source: 'library' | 'self_logged'
  // Rich rehab metadata (migration 0003). Nullable: older rows may lack it.
  description: string | null
  body_part: string[] | null
  difficulty: Difficulty | null
  goals: string[] | null
  conditions: string[] | null
  position: Position | null
  equipment: string[] | null
  notes: string | null
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

// Brunnstrom-stage clinical guidance (migration 0007). One row per motor_stage.
export type RecoveryRoadmap = {
  id: string
  motor_stage: number
  recovery_stage: RecoveryStage
  recommended_positions: Position[]
  recommended_exercise_types: string[]
  precautions: string
  typical_focus: string
}

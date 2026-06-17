// Token-free exercise matching + auto-progression.
//
// Everything here is deterministic, rule-based TypeScript — NO AI / API calls.
// The pure helpers (rankExercises, computeProgression, buildMatchedWeek, …) take
// data in and return data out so they can be reasoned about and unit-tested; the
// single async entry point (matchExercisesForPatient) queries the exercises
// table and delegates to the pure code.

import { createClient } from '@/lib/supabase/server'
import { getRoadmapForStage } from '@/lib/db'
import type {
  Difficulty,
  Exercise,
  FunctionalLevel,
  Patient,
  PlannedExercise,
  PlannedWeek,
  Position,
  PrimaryGoal,
  RecoveryStage,
} from '@/types'

// ---------------------------------------------------------------------------
// Domain constants
// ---------------------------------------------------------------------------

export const DIFFICULTY_TIERS: Difficulty[] = ['beginner', 'intermediate', 'advanced']
const ALL_POSITIONS: Position[] = ['laying_down', 'sitting', 'standing', 'walking']

// Functional level gates which positions are safe to attempt.
export const POSITIONS_BY_FUNCTIONAL_LEVEL: Record<FunctionalLevel, Position[]> = {
  bedbound: ['laying_down'],
  sitting_balance: ['laying_down', 'sitting'],
  standing_balance: ['laying_down', 'sitting', 'standing'],
  walking_independent: ['laying_down', 'sitting', 'standing', 'walking'],
}

// Recovery stage caps the difficulty tier. We include every tier *up to and
// including* the cap (clinically safer than forcing the exact tier only).
export const MAX_DIFFICULTY_BY_STAGE: Record<RecoveryStage, Difficulty> = {
  acute: 'beginner',
  subacute: 'intermediate',
  chronic: 'advanced',
}

// ---------------------------------------------------------------------------
// Pure filtering / ranking helpers
// ---------------------------------------------------------------------------

export function allowedPositions(level: FunctionalLevel | null): Position[] {
  return level ? POSITIONS_BY_FUNCTIONAL_LEVEL[level] : ALL_POSITIONS
}

export function allowedDifficulties(stage: RecoveryStage | null): Difficulty[] {
  if (!stage) return [...DIFFICULTY_TIERS]
  const maxIdx = DIFFICULTY_TIERS.indexOf(MAX_DIFFICULTY_BY_STAGE[stage])
  return DIFFICULTY_TIERS.slice(0, maxIdx + 1)
}

export function nextDifficulty(d: Difficulty): Difficulty {
  const i = DIFFICULTY_TIERS.indexOf(d)
  return DIFFICULTY_TIERS[Math.min(i + 1, DIFFICULTY_TIERS.length - 1)]
}

// How many of the patient's primary goals this exercise advances.
export function goalOverlapScore(
  exercise: Exercise,
  goals: PrimaryGoal[] | null
): number {
  if (!goals?.length || !exercise.goals?.length) return 0
  const wanted = new Set<string>(goals)
  return exercise.goals.filter((g) => wanted.has(g)).length
}

// body_part values (legs/arms/torso/core/full_body) carry no left/right info, so
// we can't filter by the affected side from body_part data alone. Instead we use
// the affected side as a *ranking* signal: many seeded exercises name the side
// they target (e.g. "Bridges with left leg only").
export function mentionsAffectedSide(
  exercise: Exercise,
  side: Patient['affected_side']
): boolean {
  if (!side || side === 'bilateral') return false
  const haystack =
    `${exercise.name} ${exercise.description ?? ''} ${exercise.notes ?? ''}`.toLowerCase()
  return haystack.includes(side)
}

export type ScoredExercise = Exercise & {
  matchScore: number
  sideRelevant: boolean
}

export function rankExercises(
  exercises: Exercise[],
  patient: Pick<Patient, 'primary_goals' | 'affected_side'>
): ScoredExercise[] {
  return exercises
    .map((ex) => ({
      ...ex,
      matchScore: goalOverlapScore(ex, patient.primary_goals),
      sideRelevant: mentionsAffectedSide(ex, patient.affected_side),
    }))
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        Number(b.sideRelevant) - Number(a.sideRelevant) ||
        a.name.localeCompare(b.name)
    )
}

export type GroupedExercises = Record<Exercise['category'], ScoredExercise[]>

export function groupByCategory(ranked: ScoredExercise[]): GroupedExercises {
  const grouped: GroupedExercises = { legs: [], arms: [], torso: [] }
  for (const ex of ranked) {
    if (ex.category in grouped) grouped[ex.category].push(ex)
  }
  return grouped
}

// ---------------------------------------------------------------------------
// Matching entry point (async — queries the exercises table)
// ---------------------------------------------------------------------------

// The exercises table has no explicit "type" column, so we derive a coarse set
// of exercise types from each exercise's goals, difficulty, body part, and
// equipment. This lets us align exercises against the
// recovery_roadmap.recommended_exercise_types for the patient's motor stage.
// Heuristic by necessity — documented, and applied with an empty-result fallback.
export function deriveExerciseTypes(ex: Exercise): string[] {
  const types = new Set<string>()
  const goals = ex.goals ?? []
  const equipment = ex.equipment ?? []

  if (goals.includes('strength')) types.add('strengthening')
  if (goals.includes('coordination')) types.add('coordination')
  if (goals.includes('balance')) {
    types.add('coordination')
    types.add('functional')
  }
  if (goals.includes('endurance')) types.add('functional')
  if (goals.includes('mobility') || goals.includes('flexibility')) {
    types.add('passive_range_of_motion')
    types.add('assisted_movement')
  }

  switch (ex.difficulty) {
    case 'beginner':
      types.add('assisted_movement')
      types.add('active_movement')
      break
    case 'intermediate':
      types.add('active_movement')
      types.add('synergy_breaking')
      break
    case 'advanced':
      types.add('coordination')
      types.add('functional')
      types.add('fine_motor')
      break
  }

  // Arm/hand work tends to involve fine motor control.
  if ((ex.body_part ?? []).includes('arms')) types.add('fine_motor')
  // Electrical-stimulation assisted work implies assisted movement.
  if (equipment.includes('electrodes')) types.add('assisted_movement')

  return [...types]
}

export function matchesRoadmapTypes(ex: Exercise, recommendedTypes: string[]): boolean {
  if (!recommendedTypes.length) return true
  const derived = new Set(deriveExerciseTypes(ex))
  return recommendedTypes.some((t) => derived.has(t))
}

export type MatchResult = {
  grouped: GroupedExercises
  ranked: ScoredExercise[]
  appliedFilters: {
    conditions: string[]
    positions: Position[]
    difficulties: Difficulty[]
    motorStage: number | null
    exerciseTypes: string[] | null
  }
}

export async function matchExercisesForPatient(patient: Patient): Promise<MatchResult> {
  const supabase = await createClient()

  // Motor stage (Brunnstrom) is the primary clinical driver when set: it dictates
  // safe positions and appropriate exercise types via the recovery_roadmap. When
  // unset, fall back to functional_level + recovery_stage (the 0006 fields).
  const roadmap = patient.motor_stage
    ? await getRoadmapForStage(patient.motor_stage)
    : null

  const positions: Position[] = roadmap
    ? (roadmap.recommended_positions as Position[])
    : allowedPositions(patient.functional_level)

  // Difficulty follows the stage's recovery phase when on the roadmap.
  const difficulties = allowedDifficulties(
    roadmap ? roadmap.recovery_stage : patient.recovery_stage
  )

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    // Only stroke-recovery-appropriate exercises.
    .contains('conditions', ['stroke_recovery'])
    // Position must be safe for the stage / functional level. Exercises with a
    // null position are excluded since we can't confirm they're appropriate.
    .in('position', positions)
    // Difficulty at or below the appropriate progression level.
    .in('difficulty', difficulties)

  if (error) throw error

  let exercises = (data ?? []) as Exercise[]

  // On the roadmap, also require the exercise type to suit the stage. Guard
  // against over-filtering: if nothing survives the type filter, keep the
  // position/difficulty-filtered set rather than returning an empty plan.
  let exerciseTypes: string[] | null = null
  if (roadmap) {
    exerciseTypes = roadmap.recommended_exercise_types
    const typeFiltered = exercises.filter((ex) =>
      matchesRoadmapTypes(ex, roadmap.recommended_exercise_types)
    )
    if (typeFiltered.length > 0) exercises = typeFiltered
  }

  const ranked = rankExercises(exercises, patient)

  return {
    grouped: groupByCategory(ranked),
    ranked,
    appliedFilters: {
      conditions: ['stroke_recovery'],
      positions,
      difficulties,
      motorStage: patient.motor_stage,
      exerciseTypes,
    },
  }
}

// ---------------------------------------------------------------------------
// Auto-progression
// ---------------------------------------------------------------------------

export type PerceivedDifficulty = 'easy' | 'moderate' | 'hard'

// One logged occurrence of an exercise in a session. perceivedDifficulty is
// optional — the logger doesn't capture it today, so rule 4 (completion-based)
// is what currently fires; the difficulty rules are ready for when it does.
export type ExerciseSession = {
  exerciseId: string
  category: Exercise['category']
  bodyParts: string[]
  currentDifficulty: Difficulty
  date: string // ISO yyyy-mm-dd
  perceivedDifficulty: PerceivedDifficulty | null
  completed: boolean
  skipped: boolean
}

export type ProgressionVerdict = 'progress' | 'hold' | 'maintain'

// Evaluate a single exercise from its (up to last 3) sessions.
export function evaluateExerciseProgress(sessions: ExerciseSession[]): ProgressionVerdict {
  const recent = [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
  if (recent.length === 0) return 'maintain'

  // Consecutive "easy" reports counting back from the most recent session.
  let easyStreak = 0
  for (const s of recent) {
    if (s.perceivedDifficulty === 'easy') easyStreak++
    else break
  }
  const hardCount = recent.filter((s) => s.perceivedDifficulty === 'hard').length
  const skippedCount = recent.filter((s) => s.skipped).length
  const completedCount = recent.filter((s) => s.completed).length
  const anyDifficultyReported = recent.some((s) => s.perceivedDifficulty != null)

  // Rule 3: felt hard, or skipped 2+ times → stay put.
  if (hardCount > 0 || skippedCount >= 2) return 'hold'
  // Rule 2: easy 2+ times in a row → ready to progress.
  if (easyStreak >= 2) return 'progress'
  // Rule 4: no difficulty reported but completed 3+ times consistently → progress.
  if (!anyDifficultyReported && completedCount >= 3) return 'progress'
  return 'maintain'
}

export type BodyPartProgression = {
  bodyPart: string
  currentDifficulty: Difficulty
  recommendedDifficulty: Difficulty
  readyToProgress: boolean
  rationale: string
}

// Roll exercise-level verdicts up to a recommended difficulty per body part.
export function computeProgression(sessions: ExerciseSession[]): BodyPartProgression[] {
  const byExercise = new Map<string, ExerciseSession[]>()
  for (const s of sessions) {
    const arr = byExercise.get(s.exerciseId) ?? []
    arr.push(s)
    byExercise.set(s.exerciseId, arr)
  }

  type Agg = { hasProgress: boolean; hasHold: boolean; maxDifficulty: Difficulty }
  const byBodyPart = new Map<string, Agg>()

  for (const arr of byExercise.values()) {
    const verdict = evaluateExerciseProgress(arr)
    const difficulty = arr[0].currentDifficulty
    const bodyParts = arr[0].bodyParts.length ? arr[0].bodyParts : [arr[0].category]
    for (const bp of bodyParts) {
      const cur =
        byBodyPart.get(bp) ??
        ({ hasProgress: false, hasHold: false, maxDifficulty: 'beginner' } as Agg)
      if (verdict === 'progress') cur.hasProgress = true
      if (verdict === 'hold') cur.hasHold = true
      if (DIFFICULTY_TIERS.indexOf(difficulty) > DIFFICULTY_TIERS.indexOf(cur.maxDifficulty)) {
        cur.maxDifficulty = difficulty
      }
      byBodyPart.set(bp, cur)
    }
  }

  const result: BodyPartProgression[] = []
  for (const [bodyPart, agg] of byBodyPart) {
    // Progress only when something signals readiness and nothing says "hold".
    const readyToProgress = agg.hasProgress && !agg.hasHold
    const recommendedDifficulty = readyToProgress
      ? nextDifficulty(agg.maxDifficulty)
      : agg.maxDifficulty
    result.push({
      bodyPart,
      currentDifficulty: agg.maxDifficulty,
      recommendedDifficulty,
      readyToProgress,
      rationale: readyToProgress
        ? `${bodyPart}: recent sessions were well tolerated — ready to try ${recommendedDifficulty}.`
        : agg.hasHold
          ? `${bodyPart}: hold at ${agg.maxDifficulty} — recent sessions felt hard or were skipped.`
          : `${bodyPart}: maintain ${agg.maxDifficulty} — not enough signal to progress yet.`,
    })
  }
  return result.sort((a, b) => a.bodyPart.localeCompare(b.bodyPart))
}

// ---------------------------------------------------------------------------
// Weekly plan builder (turns a MatchResult into the PlannedWeek shape used by
// the existing plan view + weekly_plans table — same shape the AI plan produces)
// ---------------------------------------------------------------------------

const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]
const REST_DAYS = new Set(['Wednesday', 'Sunday'])
const CATEGORY_ORDER: Exercise['category'][] = ['legs', 'arms', 'torso']

function defaultSetsReps(difficulty: Difficulty): { sets: number; reps: number } {
  switch (difficulty) {
    case 'beginner':
      return { sets: 2, reps: 8 }
    case 'intermediate':
      return { sets: 3, reps: 10 }
    case 'advanced':
      return { sets: 3, reps: 12 }
  }
}

export function buildMatchedWeek(
  match: MatchResult,
  patient: Patient
): PlannedWeek {
  const pools: Record<Exercise['category'], ScoredExercise[]> = {
    legs: [...match.grouped.legs],
    arms: [...match.grouped.arms],
    torso: [...match.grouped.torso],
  }
  // Round-robin cursor per category so days stay varied and never run dry.
  const cursors: Record<Exercise['category'], number> = { legs: 0, arms: 0, torso: 0 }

  const take = (cat: Exercise['category']): ScoredExercise | null => {
    const pool = pools[cat]
    if (!pool.length) return null
    const ex = pool[cursors[cat] % pool.length]
    cursors[cat]++
    return ex
  }

  let activeIndex = 0
  const week = WEEK_DAYS.map((day) => {
    if (REST_DAYS.has(day)) {
      return { day, focus: 'Rest & recovery', rest: true, exercises: [] }
    }

    const focusCat = CATEGORY_ORDER[activeIndex % CATEGORY_ORDER.length]
    activeIndex++

    const picks: ScoredExercise[] = []
    for (let i = 0; i < 3; i++) {
      const ex = take(focusCat)
      if (ex) picks.push(ex)
    }
    // One complementary exercise from another non-empty category.
    const other = CATEGORY_ORDER.find((c) => c !== focusCat && pools[c].length)
    if (other) {
      const ex = take(other)
      if (ex) picks.push(ex)
    }

    const seen = new Set<string>()
    const exercises: PlannedExercise[] = picks
      .filter((e) => {
        if (seen.has(e.id)) return false
        seen.add(e.id)
        return true
      })
      .map((e) => {
        const { sets, reps } = defaultSetsReps(e.difficulty ?? 'beginner')
        return {
          exercise_id: e.id,
          name: e.name,
          sets,
          reps,
          notes: e.notes ?? undefined,
        }
      })

    return {
      day,
      focus: `${focusCat[0].toUpperCase()}${focusCat.slice(1)} focus`,
      rest: false,
      exercises,
    }
  })

  const goals = patient.primary_goals ?? []

  return {
    week,
    weekly_goals: goals.length
      ? `Build ${goals.join(', ')} with exercises matched to this patient's profile.`
      : "A balanced stroke-recovery routine matched to this patient's profile.",
    progression_notes: '', // filled in by the caller from computeProgression()
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { anthropic } from '@/lib/anthropic'
import {
  getPatient,
  getExercisesAvailableAsOf,
  getExercisesDoneByPatient,
  getRecentWorkoutLogs,
} from '@/lib/db'
import type { Exercise } from '@/types'

export async function addPatient(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const notes = (formData.get('notes') as string | null)?.trim() || null

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('patients')
    .insert({ name, notes })
    .select()
    .single()
  if (error) throw error

  redirect(`/patients/${data.id}`)
}

type LoggedEntry = {
  exerciseId: string | null
  name: string
  category: Exercise['category']
  timeMinutes: number | null
  reps: number | null
  weight: number | null
  notes: string | null
}

export async function logWorkout(patientId: string, formData: FormData) {
  const supabase = getSupabaseClient()
  const date = formData.get('date') as string
  const weeklyNotes = (formData.get('weekly_notes') as string | null)?.trim() || null
  const ratingRaw = formData.get('overall_rating') as string | null
  const overallRating = ratingRaw ? parseInt(ratingRaw) : null

  const entries: LoggedEntry[] = JSON.parse(
    (formData.get('entries') as string | null) || '[]'
  )

  const { data: log, error: logError } = await supabase
    .from('workout_logs')
    .insert({ patient_id: patientId, date, weekly_notes: weeklyNotes, overall_rating: overallRating })
    .select()
    .single()
  if (logError) throw logError

  // Resolve each entry to an exercise id, creating any brand-new exercises in
  // the library on the fly (introduced as of the workout date).
  const exerciseEntries = []
  for (const entry of entries) {
    let exerciseId = entry.exerciseId
    if (!exerciseId) {
      const { data: newExercise, error: exCreateError } = await supabase
        .from('exercises')
        .insert({ name: entry.name, category: entry.category, date_introduced: date })
        .select()
        .single()
      if (exCreateError) throw exCreateError
      exerciseId = newExercise.id
    }
    exerciseEntries.push({
      log_id: log.id,
      exercise_id: exerciseId,
      time_minutes: entry.timeMinutes,
      reps: entry.reps,
      weight: entry.weight,
      notes: entry.notes,
    })
  }

  if (exerciseEntries.length > 0) {
    const { error: exError } = await supabase
      .from('workout_exercises')
      .insert(exerciseEntries)
    if (exError) throw exError
  }

  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}`)
}

export async function generateWeeklyPlan(patientId: string) {
  const today = new Date().toISOString().split('T')[0]
  const weekStart = getMondayOfWeek(today)

  const [patient, doneExercises, recentLogs] = await Promise.all([
    getPatient(patientId),
    getExercisesDoneByPatient(patientId),
    getRecentWorkoutLogs(patientId, 4),
  ])

  if (!patient) throw new Error('Patient not found')

  // Build the plan from the exercises this patient has actually done. Fall back
  // to the full library (as of today) if they haven't logged anything yet.
  const exercises =
    doneExercises.length > 0 ? doneExercises : await getExercisesAvailableAsOf(today)

  const byCategory = exercises.reduce<Record<string, typeof exercises>>((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = []
    acc[ex.category].push(ex)
    return acc
  }, {})

  const exerciseList = Object.entries(byCategory)
    .map(
      ([cat, exs]) =>
        `${cat.toUpperCase()}:\n${exs.map((e) => `  - ${e.name} (id: ${e.id})`).join('\n')}`
    )
    .join('\n\n')

  const logsText =
    recentLogs.length === 0
      ? 'No previous workout logs.'
      : recentLogs
          .map((log) => {
            const exLines = log.workout_exercises
              .map((we) => {
                const parts = [
                  we.time_minutes != null ? `${we.time_minutes} min` : null,
                  we.reps != null ? `${we.reps} reps` : null,
                  we.weight != null ? `${we.weight} kg` : null,
                ].filter(Boolean)
                const detail = parts.length > 0 ? `: ${parts.join(', ')}` : ''
                return `    - ${we.exercise.name}${detail}${we.notes ? ` — note: ${we.notes}` : ''}`
              })
              .join('\n')
            return [
              `Date: ${log.date} | Rating: ${log.overall_rating ?? 'N/A'}/10`,
              exLines,
              log.weekly_notes ? `  Weekly notes: ${log.weekly_notes}` : '',
            ]
              .filter(Boolean)
              .join('\n')
          })
          .join('\n\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8096,
    system:
      'You are an expert stroke recovery physical therapy coach. You create personalized weekly exercise plans. Your response MUST always begin with <plan> and end with </reasoning>. Never use any other format.',
    messages: [
      {
        role: 'user',
        content: `Create a weekly recovery plan for my patient.

PATIENT: ${patient.name}
NOTES: ${patient.notes || 'None'}

EXERCISES THIS PATIENT HAS DONE (grouped by category — build the plan from these):
${exerciseList}

RECENT WORKOUT HISTORY (most recent first):
${logsText}

Generate a 7-day plan (Monday through Sunday). Include rest days as appropriate — typically 1–2 per week.

CRITICAL FORMATTING RULES — YOU MUST FOLLOW THESE EXACTLY:
1. Your ENTIRE response must be wrapped in the XML tags shown below.
2. Do NOT add any text, commentary, or markdown before <plan> or after </reasoning>.
3. Do NOT wrap the JSON in markdown code fences (no \`\`\`json).
4. The <plan> block must contain only raw JSON.

<plan>
{
  "week": [
    {
      "day": "Monday",
      "focus": "brief focus description",
      "rest": false,
      "exercises": [
        {
          "exercise_id": "exact-uuid-from-list",
          "name": "Exercise Name",
          "sets": 3,
          "reps": 10,
          "notes": "optional modification"
        }
      ]
    }
  ],
  "weekly_goals": "overall goals for the week",
  "progression_notes": "how this builds on recent history"
}
</plan>
<reasoning>
Your clinical reasoning here, explaining exercise choices, progressions, and any safety considerations.
</reasoning>`,
      },
    ],
  })

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  console.log('\n=== Claude raw response ===\n')
  console.log(responseText)
  console.log('\n=== end Claude response ===\n')

  const planMatch = responseText.match(/<plan>\s*([\s\S]*?)\s*<\/plan>/i)
  const reasoningMatch = responseText.match(/<reasoning>\s*([\s\S]*?)\s*<\/reasoning>/i)

  if (!planMatch) throw new Error('AI returned an invalid plan format')

  const planRaw = planMatch[1].replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const plan = JSON.parse(planRaw)
  const aiReasoning = reasoningMatch ? reasoningMatch[1].trim() : null

  const supabase = getSupabaseClient()
  const { error } = await supabase.from('weekly_plans').insert({
    patient_id: patientId,
    week_start: weekStart,
    plan,
    ai_reasoning: aiReasoning,
  })
  if (error) throw error

  revalidatePath(`/patients/${patientId}/plan`)
  redirect(`/patients/${patientId}/plan`)
}

function getMondayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00Z')
  const day = date.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setUTCDate(date.getUTCDate() + diff)
  return date.toISOString().split('T')[0]
}

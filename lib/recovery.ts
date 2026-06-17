// Plain-language reference for the Brunnstrom motor recovery stages (1-7).
// Pure data, no server imports — safe in both client and server components.
// Shared by the patient form (stage selector) and the dashboard roadmap card.

export type MotorStageInfo = {
  stage: number
  title: string
  description: string
}

export const MOTOR_STAGES: MotorStageInfo[] = [
  { stage: 1, title: 'Flaccidity', description: 'No voluntary movement; paralysis of the affected side.' },
  { stage: 2, title: 'Spasticity appears', description: 'Muscle tone begins to return with minimal voluntary movement.' },
  { stage: 3, title: 'Synergy patterns', description: 'Increased spasticity; voluntary movement only within synergy patterns.' },
  { stage: 4, title: 'Out of synergy', description: 'Spasticity decreasing; some movement begins outside synergy patterns.' },
  { stage: 5, title: 'Complex movement', description: 'More complex movement combinations; spasticity continues to decrease.' },
  { stage: 6, title: 'Near-normal coordination', description: 'Spasticity disappears; individual joint movements with near-normal coordination.' },
  { stage: 7, title: 'Normal function', description: 'Normal motor function restored.' },
]

export function motorStageInfo(stage: number | null | undefined): MotorStageInfo | null {
  if (!stage) return null
  return MOTOR_STAGES.find((m) => m.stage === stage) ?? null
}

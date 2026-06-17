-- Migration: Brunnstrom motor-stage recovery roadmap
-- Run this in the Supabase SQL editor against an existing database.
--
-- Adds patients.motor_stage (Brunnstrom 1-7) and a shared reference table,
-- recovery_roadmap, mapping each motor stage to the positions and exercise
-- types that are clinically appropriate, plus precautions and typical focus.
-- lib/matching.ts joins against this table to filter exercises, and the patient
-- dashboard shows the focus/precautions for the patient's current stage.

-- ============================================================
-- 1. Motor stage on patients (manual, caregiver-adjustable)
-- ============================================================

alter table patients
  add column if not exists motor_stage integer
    check (motor_stage between 1 and 7);

-- ============================================================
-- 2. recovery_roadmap reference table
-- ============================================================

create table if not exists recovery_roadmap (
  id uuid default gen_random_uuid() primary key,
  motor_stage integer not null unique check (motor_stage between 1 and 7),
  recovery_stage text not null check (recovery_stage in ('acute', 'subacute', 'chronic')),
  recommended_positions text[] not null,
  recommended_exercise_types text[] not null,
  precautions text not null,
  typical_focus text not null
);

-- Shared reference data, like exercises: any authenticated user can read it.
alter table recovery_roadmap enable row level security;
drop policy if exists "recovery_roadmap_select" on recovery_roadmap;
create policy "recovery_roadmap_select" on recovery_roadmap
  for select
  to authenticated
  using (true);

-- ============================================================
-- 3. Seed the 7 stages. Positions are cumulative (each stage retains the
--    safe positions of earlier stages and adds new ones).
--    Re-running updates existing rows via the unique motor_stage.
-- ============================================================

insert into recovery_roadmap
  (motor_stage, recovery_stage, recommended_positions, recommended_exercise_types, precautions, typical_focus)
values
  (1, 'acute',
   array['laying_down'],
   array['passive_range_of_motion'],
   'No weight bearing or active movement. Movement is passive only — a caregiver or therapist moves the limb. Watch for skin integrity and proper positioning.',
   'Preventing contractures and maintaining joint mobility through passive range of motion.'),

  (2, 'acute',
   array['laying_down', 'sitting'],
   array['passive_range_of_motion', 'assisted_movement'],
   'Respect the emerging spasticity — do not force movement against resistance. Keep sessions short and gentle.',
   'Encouraging early voluntary movement attempts with assistance.'),

  (3, 'subacute',
   array['laying_down', 'sitting', 'standing'],
   array['assisted_movement', 'synergy_breaking'],
   'Fall risk is significant. Standing should be done with support and supervision only.',
   'Practicing movement within synergy patterns and beginning to challenge them.'),

  (4, 'subacute',
   array['laying_down', 'sitting', 'standing', 'walking'],
   array['active_movement', 'synergy_breaking', 'coordination'],
   'Monitor for fatigue and overexertion. Walking should still be done with support. Rest between efforts.',
   'Breaking out of synergy patterns into more isolated, voluntary movement.'),

  (5, 'chronic',
   array['laying_down', 'sitting', 'standing', 'walking'],
   array['coordination', 'strengthening'],
   'Watch balance during more complex, multi-step tasks. Progress load and complexity gradually.',
   'Performing more complex voluntary movement combinations.'),

  (6, 'chronic',
   array['laying_down', 'sitting', 'standing', 'walking'],
   array['coordination', 'strengthening', 'functional', 'fine_motor'],
   'Do not push through pain. Refine quality of movement rather than forcing quantity.',
   'Fine motor control and near-normal coordination.'),

  (7, 'chronic',
   array['laying_down', 'sitting', 'standing', 'walking'],
   array['passive_range_of_motion', 'assisted_movement', 'active_movement', 'synergy_breaking', 'fine_motor', 'coordination', 'strengthening', 'functional'],
   'Observe general exercise safety and warm up appropriately.',
   'Returning to normal activities and maintaining function.')
on conflict (motor_stage) do update set
  recovery_stage = excluded.recovery_stage,
  recommended_positions = excluded.recommended_positions,
  recommended_exercise_types = excluded.recommended_exercise_types,
  precautions = excluded.precautions,
  typical_focus = excluded.typical_focus;

-- Migration: add user ownership + Row Level Security
-- Run this in the Supabase SQL editor against an existing database.
--
-- Introduces per-user data isolation backed by Supabase Auth:
--   * patients gain a user_id linking them to auth.users
--   * RLS ensures each user only reads/writes their own patients and the
--     workout_logs / workout_exercises / weekly_plans hanging off them
--   * exercises stay shared reference data, readable/insertable by any
--     authenticated user (the app creates new exercises on the fly)
--
-- NOTE: the app now queries Supabase with the public "anon" key carrying the
-- user's session (not the service_role key), so these policies are enforced.
-- Any pre-existing patient rows have a NULL user_id and become invisible until
-- you assign them an owner: update patients set user_id = '<uuid>' where ...

-- ============================================================
-- 1. Ownership column on patients
-- ============================================================

alter table patients
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- New rows default to the current authenticated user as a safety net; the app
-- also sets user_id explicitly on insert.
alter table patients
  alter column user_id set default auth.uid();

create index if not exists patients_user_id_idx on patients(user_id);

-- ============================================================
-- 2. Enable Row Level Security
--    (with RLS on and no matching policy, access is denied by default)
-- ============================================================

alter table patients           enable row level security;
alter table workout_logs       enable row level security;
alter table workout_exercises  enable row level security;
alter table weekly_plans       enable row level security;
alter table exercises          enable row level security;

-- ============================================================
-- 3. Policies — user-owned data
-- ============================================================

-- patients: a user owns rows where user_id = their auth id
drop policy if exists "patients_own" on patients;
create policy "patients_own" on patients
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- workout_logs: accessible when the parent patient is owned by the user
drop policy if exists "workout_logs_own" on workout_logs;
create policy "workout_logs_own" on workout_logs
  for all
  to authenticated
  using (
    exists (
      select 1 from patients p
      where p.id = workout_logs.patient_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from patients p
      where p.id = workout_logs.patient_id and p.user_id = auth.uid()
    )
  );

-- workout_exercises: accessible via log -> patient ownership
drop policy if exists "workout_exercises_own" on workout_exercises;
create policy "workout_exercises_own" on workout_exercises
  for all
  to authenticated
  using (
    exists (
      select 1 from workout_logs l
      join patients p on p.id = l.patient_id
      where l.id = workout_exercises.log_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workout_logs l
      join patients p on p.id = l.patient_id
      where l.id = workout_exercises.log_id and p.user_id = auth.uid()
    )
  );

-- weekly_plans: accessible when the parent patient is owned by the user
drop policy if exists "weekly_plans_own" on weekly_plans;
create policy "weekly_plans_own" on weekly_plans
  for all
  to authenticated
  using (
    exists (
      select 1 from patients p
      where p.id = weekly_plans.patient_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from patients p
      where p.id = weekly_plans.patient_id and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- 4. Policies — exercises (shared reference data)
--    Any authenticated user can read and add exercises, but not delete them.
-- ============================================================

drop policy if exists "exercises_select" on exercises;
create policy "exercises_select" on exercises
  for select
  to authenticated
  using (true);

drop policy if exists "exercises_insert" on exercises;
create policy "exercises_insert" on exercises
  for insert
  to authenticated
  with check (true);

drop policy if exists "exercises_update" on exercises;
create policy "exercises_update" on exercises
  for update
  to authenticated
  using (true)
  with check (true);

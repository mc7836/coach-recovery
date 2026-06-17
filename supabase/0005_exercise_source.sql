-- Migration: track where each exercise came from
-- Run this in the Supabase SQL editor against an existing database.
--
-- Distinguishes seeded reference exercises ("library") from exercises a user
-- created on the fly through the search-based workout logger ("self_logged").
--
-- The "date it was added" for a self-logged exercise is already captured by
-- date_introduced: app/actions.ts > logWorkout inserts new exercises with
-- date_introduced set to the workout date. That same column gates exercise
-- availability, so the added-on date and the introduced date are one and the
-- same — no separate column is needed.

alter table exercises
  add column if not exists source text not null default 'library'
    check (source in ('library', 'self_logged'));

-- Existing rows keep the default 'library'. New self-logged exercises are
-- written with source = 'self_logged' by the workout logger.
comment on column exercises.source is
  'library = seeded reference data; self_logged = created by a user via the workout logger (date_introduced = date added)';

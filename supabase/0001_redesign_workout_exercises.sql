-- Migration: redesign workout_exercises for the search-based logger
-- Run this in the Supabase SQL editor against an existing database.
--
-- The new logging flow captures time spent, reps, weight, and notes per
-- exercise instead of a completed/difficulty pair.

alter table workout_exercises add column if not exists time_minutes integer;
alter table workout_exercises add column if not exists reps integer;
alter table workout_exercises add column if not exists weight numeric;

alter table workout_exercises drop column if exists completed;
alter table workout_exercises drop column if exists difficulty;

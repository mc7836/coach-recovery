-- Stroke Recovery Coach — Supabase schema + seed
-- Run this in the Supabase SQL editor

create extension if not exists "pgcrypto";

create table patients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  notes text,
  created_at timestamptz default now()
);

create table exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null check (category in ('legs', 'arms', 'torso')),
  date_introduced date not null
);

create table workout_logs (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  date date not null,
  weekly_notes text,
  overall_rating integer check (overall_rating between 1 and 10),
  created_at timestamptz default now()
);

create table workout_exercises (
  id uuid default gen_random_uuid() primary key,
  log_id uuid references workout_logs(id) on delete cascade not null,
  exercise_id uuid references exercises(id) not null,
  time_minutes integer,
  reps integer,
  weight numeric,
  notes text
);

create table weekly_plans (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  week_start date not null,
  plan jsonb not null,
  ai_reasoning text,
  created_at timestamptz default now()
);

-- ============================================================
-- Exercise seed data
-- ============================================================

insert into exercises (name, category, date_introduced) values
  -- LEGS — 10/31/25
  ('Bridges', 'legs', '2025-10-31'),
  ('Lay down side kicks', 'legs', '2025-10-31'),
  -- LEGS — 11/4/25
  ('Bicycle', 'legs', '2025-11-04'),
  -- LEGS — 11/7/25
  ('Laying down elevate left leg to chest', 'legs', '2025-11-07'),
  ('Lay down side elevate left knee to chest and kick', 'legs', '2025-11-07'),
  ('Elevate left leg to strengthen quad with electrodes', 'legs', '2025-11-07'),
  ('Left leg side to side swipes', 'legs', '2025-11-07'),
  ('Lay down push down quad', 'legs', '2025-11-07'),
  -- LEGS — 12/16/25
  ('Standing up with one leg', 'legs', '2025-12-16'),
  ('Bridges with left leg only', 'legs', '2025-12-16'),
  ('Laying down elevate both legs', 'legs', '2025-12-16'),
  ('Squeeze ball with knees bent', 'legs', '2025-12-16'),
  ('Knees bent push out', 'legs', '2025-12-16'),
  ('Propped legs on pillow elevate feet up and down', 'legs', '2025-12-16'),
  ('Propped legs on pillow push feet down', 'legs', '2025-12-16'),
  -- LEGS — 2/6/26 (data was cut off; add remaining exercises here)
  ('Knees bent holding ball moving', 'legs', '2026-02-06');

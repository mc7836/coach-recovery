-- Migration: patient profile fields for the token-free matching algorithm
-- Run this in the Supabase SQL editor against an existing database.
--
-- These columns drive lib/matching.ts: they decide which exercise positions and
-- difficulty tiers are appropriate, and how candidate exercises are ranked
-- against the patient's goals. All are nullable so existing patients keep
-- working until a caregiver fills in the profile.

alter table patients
  add column if not exists affected_side text
    check (affected_side in ('left', 'right', 'bilateral'));

alter table patients
  add column if not exists recovery_stage text
    check (recovery_stage in ('acute', 'subacute', 'chronic'));

alter table patients
  add column if not exists functional_level text
    check (functional_level in (
      'bedbound', 'sitting_balance', 'standing_balance', 'walking_independent'
    ));

-- Subset of: strength, balance, mobility, endurance, coordination.
-- Stored as a text[]; defaults to empty so ranking code can treat it uniformly.
alter table patients
  add column if not exists primary_goals text[] not null default '{}';

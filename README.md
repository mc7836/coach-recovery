# Stroke Recovery Coach

An AI-powered stroke recovery coaching tool for physical therapists. Log patient workouts, track exercise difficulty, and generate personalized weekly plans using Claude.

## Stack

- **Next.js 16** (App Router) — frontend and server actions
- **Supabase** — Postgres database
- **Anthropic API** (`claude-sonnet-4-6`) — AI weekly plan generation
- **Tailwind CSS** — styling
- **Vercel** — deployment

## Features

- Add patients with notes (diagnosis, affected side, precautions)
- Log workouts: mark exercises completed, rate difficulty (easy/moderate/hard), add notes
- AI-generated weekly plans with clinical reasoning, based on full workout history
- Exercise library with PT-defined introduction dates (no exercise suggested before it was cleared)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd coach-recovery
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → `service_role` secret |
| `ANTHROPIC_API_KEY` | console.anthropic.com → Settings → API Keys |

> **Important:** Use the `service_role` key, not the `anon` key. This app runs all database access server-side and never exposes credentials to the browser.

### 3. Set up the database

In the [Supabase SQL editor](https://supabase.com/dashboard/project/_/sql), run the contents of `supabase/schema.sql`. This creates all tables and seeds the exercise library.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment on Vercel

1. Push to a GitHub repository
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add the three environment variables under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy

No additional Vercel configuration is needed — the app uses server actions for all mutations and has no custom API routes.

## Project structure

```
app/
  actions.ts              # Server actions (add patient, log workout, generate plan)
  layout.tsx
  page.tsx                # Patient list / home
  patients/[id]/
    page.tsx              # Patient dashboard
    log/new/page.tsx      # Log a workout
    plan/page.tsx         # View weekly plan
  ui/
    add-patient-form.tsx
    log-workout-form.tsx
    generate-plan-button.tsx
lib/
  env.ts                  # Validated environment variables (throws on missing vars)
  supabase.ts             # Supabase client (server-side only, service role)
  anthropic.ts            # Anthropic client
  db.ts                   # Database query helpers
types/
  index.ts
supabase/
  schema.sql              # Run this in Supabase SQL editor to initialize the database
```

## Adding exercises

Edit `supabase/schema.sql` and run the new `INSERT` statement in the Supabase SQL editor. The `date_introduced` field controls when an exercise becomes available — the plan generator and workout logger only show exercises introduced on or before today's date.

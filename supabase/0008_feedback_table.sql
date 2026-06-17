create table feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users,
  message    text not null,
  email      text,
  created_at timestamptz not null default now()
);

-- Authenticated users can submit feedback.
alter table feedback enable row level security;

create policy "authenticated users can insert feedback"
  on feedback for insert
  to authenticated
  with check (true);

-- No SELECT policy — rows are invisible to all JWT-authenticated requests.
-- Service-role key bypasses RLS and can read everything for admin access.

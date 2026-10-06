-- Paste into the Supabase SQL editor for your project.

create table if not exists sessions (
  id uuid primary key,
  day text not null,
  performed_at timestamptz not null,
  exercises jsonb not null,
  created_at timestamptz default now()
);

alter table sessions enable row level security;

-- Permissive policy for a single-user personal app using the anon key.
-- Tighten this later (e.g. scope to a user_id) if you add auth or share the app.
create policy "allow all for anon" on sessions
  for all
  using (true)
  with check (true);

-- ============================================================================
-- DIGITAL TECH TREASURE HUNT 2026: SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ============================================================================

-- 1. Create the Leaderboard Table
create table if not exists public.leaderboard (
  team_id text primary key,
  team_name text not null,
  avatar text default '🚀',
  current_level int default 1,
  score int default 0,
  elapsed_time int default 0,
  penalties int default 0,
  is_disqualified boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Performance indexes for high-speed live leaderboard ranking
create index if not exists idx_leaderboard_score on public.leaderboard (score desc);
create index if not exists idx_leaderboard_time on public.leaderboard (elapsed_time asc, penalties asc);
create index if not exists idx_leaderboard_level on public.leaderboard (current_level desc);

-- 3. Enable Row Level Security (RLS)
alter table public.leaderboard enable row level security;

-- 4. Drop existing policy if any, and create full public access policy (for anon key)
drop policy if exists "Allow public access" on public.leaderboard;
create policy "Allow public access" on public.leaderboard
  for all 
  using (true) 
  with check (true);

-- 5. Enable Supabase Realtime Broadcasts for this table
alter publication supabase_realtime add table public.leaderboard;

-- ============================================================================
-- Verification: Test query (should return 0 rows if fresh table)
-- ============================================================================
select * from public.leaderboard;

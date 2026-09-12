-- UoN Call of Duty Mobile Tournament schema
-- Apply via Supabase SQL Editor OR: npm run db:migrate (needs DATABASE_URL)

create extension if not exists "pgcrypto";

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_number int not null unique check (team_number between 1 and 20),
  team_name text,
  pool int check (pool between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  slot char(1) not null check (slot in ('A', 'B', 'C', 'D', 'E')),
  full_name text not null,
  phone text not null,
  email text not null,
  cod_mobile_name text not null,
  created_at timestamptz not null default now(),
  unique (team_id, slot)
);

create unique index if not exists players_email_unique on public.players (lower(email));
create unique index if not exists players_cod_unique on public.players (lower(cod_mobile_name));

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  stage text not null check (stage in ('pool', 'quarterfinal', 'semifinal', 'final')),
  pool int check (pool between 1 and 5),
  match_order int not null default 1,
  team1_id uuid references public.teams (id),
  team2_id uuid references public.teams (id),
  team1_score int,
  team2_score int,
  winner_id uuid references public.teams (id),
  status text not null default 'pending'
    check (status in ('pending', 'live', 'completed')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

insert into public.settings (key, value)
values
  ('registration_open', 'true'::jsonb),
  ('max_teams', '20'::jsonb),
  ('max_players', '100'::jsonb),
  ('tournament_name', '"University of Nairobi Call of Duty Tournament"'::jsonb)
on conflict (key) do nothing;

alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Public read settings" on public.settings;
drop policy if exists "Public read teams" on public.teams;
drop policy if exists "Public read players" on public.players;
drop policy if exists "Public read matches" on public.matches;

create policy "Public read settings"
  on public.settings for select
  using (true);

create policy "Public read teams"
  on public.teams for select
  using (true);

create policy "Public read players"
  on public.players for select
  using (true);

create policy "Public read matches"
  on public.matches for select
  using (true);

create or replace view public.team_roster as
select
  t.id as team_id,
  t.team_number,
  t.team_name,
  t.pool,
  t.created_at,
  p.id as player_id,
  p.slot,
  p.full_name,
  p.phone,
  p.email,
  p.cod_mobile_name
from public.teams t
join public.players p on p.team_id = t.id
order by t.team_number, p.slot;

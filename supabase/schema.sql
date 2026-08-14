-- Pomodoro BB — schema inicial (Supabase / Postgres)
-- Rode este arquivo inteiro uma vez no SQL Editor do painel do Supabase.
-- Todas as tabelas são isoladas por usuário via Row Level Security (RLS):
-- cada linha só é visível/editável por quem a criou (auth.uid() = user_id).

-- ============================================================
-- user_settings — 1 linha por usuário (tempos do Pomodoro + preferências)
-- ============================================================
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  focus_minutes integer not null default 30,
  short_break_minutes integer not null default 5,
  long_break_minutes integer not null default 15,
  cycles_before_long_break integer not null default 4,
  sound_enabled boolean not null default true,
  goal_metric text not null default 'pomodoros' check (goal_metric in ('pomodoros', 'horas')),
  goal_period text not null default 'diaria' check (goal_period in ('diaria', 'semanal')),
  goal_target numeric not null default 8,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings: dono only"
  on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- timer_runtime_state — 1 linha por usuário (ciclo do Pomodoro em andamento)
-- ============================================================
create table if not exists public.timer_runtime_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  cycle text not null default 'foco' check (cycle in ('foco', 'pausaCurta', 'pausaLonga')),
  cycles_since_long_break integer not null default 0,
  is_running boolean not null default false,
  cycle_end_timestamp timestamptz,
  paused_seconds_left integer not null default 1800,
  subject text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.timer_runtime_state enable row level security;

create policy "timer_runtime_state: dono only"
  on public.timer_runtime_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- pomodoro_completions — 1 linha por pomodoro de foco concluído (log de eventos)
-- ============================================================
create table if not exists public.pomodoro_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject text not null,
  minutes integer not null,
  completed_at timestamptz not null default now()
);

create index if not exists pomodoro_completions_user_completed_at_idx
  on public.pomodoro_completions (user_id, completed_at desc);

alter table public.pomodoro_completions enable row level security;

create policy "pomodoro_completions: dono only"
  on public.pomodoro_completions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- schedule_blocks — cronograma semanal
-- ============================================================
create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  weekday text not null check (
    weekday in ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')
  ),
  subject text not null,
  start_time text not null,
  duration_minutes integer not null
);

create index if not exists schedule_blocks_user_id_idx on public.schedule_blocks (user_id);

alter table public.schedule_blocks enable row level security;

create policy "schedule_blocks: dono only"
  on public.schedule_blocks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- question_log — questões resolvidas por matéria
-- ============================================================
create table if not exists public.question_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject text not null,
  date date not null,
  total integer not null,
  correct integer not null,
  wrong integer not null
);

create index if not exists question_log_user_id_idx on public.question_log (user_id);

alter table public.question_log enable row level security;

create policy "question_log: dono only"
  on public.question_log
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- review_flags — questões marcadas para revisar depois
-- ============================================================
create table if not exists public.review_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject text not null,
  note text not null,
  date date not null,
  review_date date not null
);

create index if not exists review_flags_user_id_idx on public.review_flags (user_id);

alter table public.review_flags enable row level security;

create policy "review_flags: dono only"
  on public.review_flags
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- spaced_review_overrides — decisão do usuário sobre uma sugestão de revisão
-- espaçada (revisado / adiado)
-- ============================================================
create table if not exists public.spaced_review_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject text not null,
  studied_date date not null,
  interval_days integer not null,
  status text not null check (status in ('revisado', 'adiado')),
  effective_date date,
  unique (user_id, subject, studied_date, interval_days)
);

create index if not exists spaced_review_overrides_user_id_idx
  on public.spaced_review_overrides (user_id);

alter table public.spaced_review_overrides enable row level security;

create policy "spaced_review_overrides: dono only"
  on public.spaced_review_overrides
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

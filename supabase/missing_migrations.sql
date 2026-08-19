-- Combined missing migrations for gapyear-os / ALevels.io production Supabase project.
-- Applies (in order, safely re-runnable):
--   1. 20260818_alevels_onboarding.sql  -> creates public.student_profiles (fixes POST /onboarding crash)
--   2. 20260818_reference_onboarding.sql -> creates canonical reference tables (fixes "canonical data not loading")
--
-- Run this entire file once in the Supabase SQL editor for the project backing gapyear-os.vercel.app.
-- Both source migrations use "create table if not exists" / "drop policy if exists", so this is safe
-- to re-run if partially applied.

-- ============================================================
-- 1. 20260818_alevels_onboarding.sql
-- ============================================================

create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  first_name text,
  school_college text,
  stage text not null default 'Year 12' check (stage in ('Year 12', 'Year 13', 'Resit-Gap Year')),
  weekday_study_hours numeric(4,2) check (weekday_study_hours is null or weekday_study_hours >= 0),
  weekend_study_hours numeric(4,2) check (weekend_study_hours is null or weekend_study_hours >= 0),
  lighter_days text[] not null default '{}',
  tutors text,
  next_assessments text,
  onboarding_step integer not null default 1,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(owner_id)
);

alter table public.subjects
  add column if not exists exam_board text,
  add column if not exists specification_code text,
  add column if not exists specification_options text,
  add column if not exists school_predicted_grade text;

alter table public.student_profiles enable row level security;

drop policy if exists "own student profile" on public.student_profiles;
create policy "own student profile"
on public.student_profiles for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create index if not exists student_profiles_owner_idx on public.student_profiles(owner_id);

do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    drop trigger if exists set_student_profiles_updated_at on public.student_profiles;
    create trigger set_student_profiles_updated_at
      before update on public.student_profiles
      for each row execute function public.set_updated_at();
  end if;
end $$;

-- ============================================================
-- 2. 20260818_reference_onboarding.sql
-- ============================================================

create table if not exists public.exam_boards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  official_name text not null,
  country_scope text not null default 'England',
  website_url text,
  active boolean not null default true,
  source_name text,
  source_url text,
  verified_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);

create table if not exists public.a_level_subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  topic_support_status text not null default 'coming_soon' check (topic_support_status in ('full', 'coming_soon', 'not_planned')),
  source_name text,
  source_url text,
  verified_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);

create table if not exists public.board_subject_offerings (
  id uuid primary key default gen_random_uuid(),
  exam_board_id uuid not null references public.exam_boards(id) on delete cascade,
  subject_id uuid not null references public.a_level_subjects(id) on delete cascade,
  qualification_level text not null default 'A Level',
  available boolean not null default true,
  coming_soon boolean not null default false,
  topic_support_status text not null default 'coming_soon' check (topic_support_status in ('full', 'coming_soon', 'not_planned')),
  notes text,
  official_source_url text,
  verified_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(exam_board_id, subject_id, qualification_level)
);

create table if not exists public.specifications (
  id uuid primary key default gen_random_uuid(),
  exam_board_id uuid not null references public.exam_boards(id) on delete cascade,
  subject_id uuid not null references public.a_level_subjects(id) on delete cascade,
  qualification_type text not null default 'A Level',
  specification_code text not null,
  specification_name text not null,
  version_name text,
  teaching_from text,
  first_exam text,
  last_exam text,
  active boolean not null default true,
  topic_support_status text not null default 'coming_soon' check (topic_support_status in ('full', 'coming_soon', 'not_planned')),
  official_source_url text,
  verified_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(exam_board_id, specification_code)
);

create table if not exists public.specification_options (
  id uuid primary key default gen_random_uuid(),
  specification_id uuid not null references public.specifications(id) on delete cascade,
  code text not null,
  name text not null,
  option_group text,
  required_or_optional text not null default 'optional' check (required_or_optional in ('required', 'optional')),
  min_select integer not null default 0,
  max_select integer not null default 1,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(specification_id, code)
);

create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(),
  specification_id uuid not null references public.specifications(id) on delete cascade,
  code text not null,
  name text not null,
  component_type text not null default 'paper',
  weighting numeric(5,2),
  duration_minutes integer,
  max_marks integer,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(specification_id, code)
);

create table if not exists public.grade_scales (
  id uuid primary key default gen_random_uuid(),
  qualification_type text not null default 'A Level',
  grade text not null,
  rank integer not null,
  is_pass boolean not null default true,
  is_target_selectable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(qualification_type, grade)
);

create table if not exists public.student_subjects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.a_level_subjects(id) on delete restrict,
  exam_board_id uuid references public.exam_boards(id) on delete set null,
  specification_id uuid references public.specifications(id) on delete set null,
  self_grade text,
  school_predicted_grade text,
  target_grade text,
  specification_confirmation_status text not null default 'needs_confirmation' check (specification_confirmation_status in ('confirmed', 'needs_confirmation')),
  topic_support_status text not null default 'coming_soon' check (topic_support_status in ('full', 'coming_soon', 'not_planned')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, subject_id)
);

create table if not exists public.student_specification_options (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  student_subject_id uuid not null references public.student_subjects(id) on delete cascade,
  specification_option_id uuid not null references public.specification_options(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(owner_id, student_subject_id, specification_option_id)
);

create table if not exists public.grade_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  student_subject_id uuid not null references public.student_subjects(id) on delete cascade,
  grade_type text not null check (grade_type in ('self_estimate', 'school_prediction', 'platform_evidence_estimate', 'mock', 'prelim', 'actual_result')),
  grade text,
  recorded_at timestamptz not null default now(),
  source text not null default 'onboarding',
  assessment_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.study_availability (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  weekday_default_minutes integer check (weekday_default_minutes is null or weekday_default_minutes >= 0),
  weekend_default_minutes integer check (weekend_default_minutes is null or weekend_default_minutes >= 0),
  monday_minutes integer,
  tuesday_minutes integer,
  wednesday_minutes integer,
  thursday_minutes integer,
  friday_minutes integer,
  saturday_minutes integer,
  sunday_minutes integer,
  lighter_days text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(owner_id)
);

alter table public.exam_boards enable row level security;
alter table public.a_level_subjects enable row level security;
alter table public.board_subject_offerings enable row level security;
alter table public.specifications enable row level security;
alter table public.specification_options enable row level security;
alter table public.papers enable row level security;
alter table public.grade_scales enable row level security;
alter table public.student_subjects enable row level security;
alter table public.student_specification_options enable row level security;
alter table public.grade_history enable row level security;
alter table public.study_availability enable row level security;

drop policy if exists "authenticated read exam boards" on public.exam_boards;
create policy "authenticated read exam boards" on public.exam_boards for select to authenticated using (true);
drop policy if exists "authenticated read a level subjects" on public.a_level_subjects;
create policy "authenticated read a level subjects" on public.a_level_subjects for select to authenticated using (true);
drop policy if exists "authenticated read board offerings" on public.board_subject_offerings;
create policy "authenticated read board offerings" on public.board_subject_offerings for select to authenticated using (true);
drop policy if exists "authenticated read specifications" on public.specifications;
create policy "authenticated read specifications" on public.specifications for select to authenticated using (true);
drop policy if exists "authenticated read specification options" on public.specification_options;
create policy "authenticated read specification options" on public.specification_options for select to authenticated using (true);
drop policy if exists "authenticated read papers" on public.papers;
create policy "authenticated read papers" on public.papers for select to authenticated using (true);
drop policy if exists "authenticated read grade scales" on public.grade_scales;
create policy "authenticated read grade scales" on public.grade_scales for select to authenticated using (true);

drop policy if exists "own student subjects" on public.student_subjects;
create policy "own student subjects" on public.student_subjects for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "own student specification options" on public.student_specification_options;
create policy "own student specification options" on public.student_specification_options for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "own grade history" on public.grade_history;
create policy "own grade history" on public.grade_history for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "own study availability" on public.study_availability;
create policy "own study availability" on public.study_availability for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create index if not exists a_level_subjects_active_sort_idx on public.a_level_subjects(active, sort_order, name);
create index if not exists offerings_subject_idx on public.board_subject_offerings(subject_id, available);
create index if not exists specifications_subject_board_idx on public.specifications(subject_id, exam_board_id, active);
create index if not exists student_subjects_owner_idx on public.student_subjects(owner_id, is_deleted);
create index if not exists grade_history_student_subject_idx on public.grade_history(student_subject_id, recorded_at desc);

do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    drop trigger if exists set_exam_boards_updated_at on public.exam_boards;
    create trigger set_exam_boards_updated_at before update on public.exam_boards for each row execute function public.set_updated_at();
    drop trigger if exists set_a_level_subjects_updated_at on public.a_level_subjects;
    create trigger set_a_level_subjects_updated_at before update on public.a_level_subjects for each row execute function public.set_updated_at();
    drop trigger if exists set_student_subjects_updated_at on public.student_subjects;
    create trigger set_student_subjects_updated_at before update on public.student_subjects for each row execute function public.set_updated_at();
    drop trigger if exists set_study_availability_updated_at on public.study_availability;
    create trigger set_study_availability_updated_at before update on public.study_availability for each row execute function public.set_updated_at();
  end if;
end $$;

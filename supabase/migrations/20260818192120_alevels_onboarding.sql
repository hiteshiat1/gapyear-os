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

alter table public.daily_tasks
  add column if not exists syllabus_topic_id uuid,
  add column if not exists reason text,
  add column if not exists priority_score integer,
  add column if not exists source text;

alter table public.exams
  add column if not exists paper_code text,
  add column if not exists paper_section text;

alter table public.exam_errors
  add column if not exists syllabus_topic_id uuid;

create table if not exists public.syllabus_topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  parent_topic_id uuid references public.syllabus_topics(id) on delete set null,
  stable_code text not null,
  name text not null,
  specification_code text not null,
  specification_ref text not null,
  paper_code text not null,
  paper_name text not null,
  topic_level text not null check (topic_level in ('module', 'topic', 'subtopic', 'skill')),
  sort_order integer not null default 0,
  is_optional boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique (subject_id, stable_code)
);

create table if not exists public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  syllabus_topic_id uuid not null references public.syllabus_topics(id) on delete cascade,
  status text not null default 'Not Started',
  confidence integer check (confidence is null or confidence between 1 and 5),
  accuracy integer check (accuracy is null or accuracy between 0 and 100),
  priority text not null default 'Medium',
  last_revised date,
  notes text,
  tutor_feedback text,
  retest_date date,
  tutor_flag boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique (owner_id, syllabus_topic_id)
);

create table if not exists public.topic_diagnostics (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  syllabus_topic_id uuid not null references public.syllabus_topics(id) on delete cascade,
  diagnostic_date date not null default current_date,
  questions_attempted integer check (questions_attempted is null or questions_attempted >= 0),
  correct integer check (correct is null or correct >= 0),
  marks_scored integer not null check (marks_scored >= 0),
  marks_available integer not null check (marks_available > 0),
  percentage integer not null check (percentage between 0 and 100),
  confidence_before integer check (confidence_before is null or confidence_before between 1 and 5),
  confidence_after integer check (confidence_after is null or confidence_after between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.mock_schedule_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  subject_id uuid references public.subjects(id) on delete set null,
  paper_code text,
  label text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  is_deleted boolean not null default false
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_tasks_syllabus_topic_id_fkey'
  ) then
    alter table public.daily_tasks
      add constraint daily_tasks_syllabus_topic_id_fkey
      foreign key (syllabus_topic_id) references public.syllabus_topics(id) on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'exam_errors_syllabus_topic_id_fkey'
  ) then
    alter table public.exam_errors
      add constraint exam_errors_syllabus_topic_id_fkey
      foreign key (syllabus_topic_id) references public.syllabus_topics(id) on delete set null;
  end if;
end $$;

alter table public.syllabus_topics enable row level security;
alter table public.topic_progress enable row level security;
alter table public.topic_diagnostics enable row level security;
alter table public.mock_schedule_templates enable row level security;

drop policy if exists "authenticated read syllabus topics" on public.syllabus_topics;
create policy "authenticated read syllabus topics"
on public.syllabus_topics for select
to authenticated
using (true);

drop policy if exists "authenticated manage syllabus topics" on public.syllabus_topics;
create policy "authenticated manage syllabus topics"
on public.syllabus_topics for all
to authenticated
using (
  exists (
    select 1
    from public.subjects
    where subjects.id = syllabus_topics.subject_id
      and subjects.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.subjects
    where subjects.id = syllabus_topics.subject_id
      and subjects.owner_id = auth.uid()
  )
);

drop policy if exists "own topic progress" on public.topic_progress;
create policy "own topic progress"
on public.topic_progress for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "own topic diagnostics" on public.topic_diagnostics;
create policy "own topic diagnostics"
on public.topic_diagnostics for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "own mock schedule templates" on public.mock_schedule_templates;
create policy "own mock schedule templates"
on public.mock_schedule_templates for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create index if not exists syllabus_topics_subject_idx on public.syllabus_topics(subject_id, sort_order);
create index if not exists syllabus_topics_paper_idx on public.syllabus_topics(subject_id, paper_code);
create index if not exists topic_progress_owner_idx on public.topic_progress(owner_id, is_deleted);
create index if not exists topic_progress_topic_idx on public.topic_progress(syllabus_topic_id);
create index if not exists topic_diagnostics_topic_date_idx on public.topic_diagnostics(syllabus_topic_id, diagnostic_date desc);
create index if not exists mock_schedule_owner_day_idx on public.mock_schedule_templates(owner_id, day_of_week);
create index if not exists daily_tasks_syllabus_topic_idx on public.daily_tasks(syllabus_topic_id);
create index if not exists exam_errors_syllabus_topic_idx on public.exam_errors(syllabus_topic_id);

do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    drop trigger if exists set_syllabus_topics_updated_at on public.syllabus_topics;
    create trigger set_syllabus_topics_updated_at
      before update on public.syllabus_topics
      for each row execute function public.set_updated_at();

    drop trigger if exists set_topic_progress_updated_at on public.topic_progress;
    create trigger set_topic_progress_updated_at
      before update on public.topic_progress
      for each row execute function public.set_updated_at();

    drop trigger if exists set_topic_diagnostics_updated_at on public.topic_diagnostics;
    create trigger set_topic_diagnostics_updated_at
      before update on public.topic_diagnostics
      for each row execute function public.set_updated_at();

    drop trigger if exists set_mock_schedule_templates_updated_at on public.mock_schedule_templates;
    create trigger set_mock_schedule_templates_updated_at
      before update on public.mock_schedule_templates
      for each row execute function public.set_updated_at();
  end if;
end $$;

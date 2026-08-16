create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.version = coalesce(old.version, 0) + 1;
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'student' check (role in ('student', 'parent', 'tutor', 'mentor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  short_name text not null,
  achieved_grade text,
  target_grade text,
  estimated_grade text,
  latest_mock_grade text,
  syllabus_completion integer not null default 0 check (syllabus_completion between 0 and 100),
  active boolean not null default true,
  source_type text,
  source_file text,
  source_sheet text,
  source_row_key text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, source_sheet, source_row_key)
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  status text not null default 'Not Started' check (status in ('Not Started', 'Learning', 'Revised', 'Practice Required', 'Exam Ready', 'Mastered')),
  confidence integer check (confidence between 1 and 5),
  accuracy integer check (accuracy between 0 and 100),
  error_count integer not null default 0,
  last_revised date,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  notes text,
  tutor_feedback text,
  source_type text,
  source_file text,
  source_sheet text,
  source_row_key text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, subject_id, name),
  unique(owner_id, source_sheet, source_row_key)
);

create table if not exists public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  plan_date date not null,
  energy integer check (energy between 1 and 5),
  focus integer check (focus between 1 and 5),
  motivation integer check (motivation between 1 and 5),
  sleep_hours numeric(4,2) check (sleep_hours >= 0),
  academic_goal text,
  personal_goal text,
  total_focused_hours numeric(5,2),
  evening_reflection jsonb,
  source_type text,
  source_file text,
  source_sheet text,
  source_row_key text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, plan_date),
  unique(owner_id, source_sheet, source_row_key)
);

create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  daily_plan_id uuid not null references public.daily_plans(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  task text not null,
  category text not null,
  topic text,
  starts_at time,
  ends_at time,
  estimated_duration numeric(5,2) check (estimated_duration >= 0),
  actual_duration numeric(5,2) check (actual_duration >= 0),
  status text not null default 'Planned' check (status in ('Planned', 'In Progress', 'Complete', 'Missed', 'Rescheduled')),
  difficulty integer check (difficulty between 1 and 5),
  confidence_before integer check (confidence_before between 1 and 5),
  confidence_after integer check (confidence_after between 1 and 5),
  notes text,
  source_type text,
  source_file text,
  source_sheet text,
  source_row_key text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, source_sheet, source_row_key)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  linked_task_id uuid references public.daily_tasks(id) on delete set null,
  session_date date not null,
  duration_hours numeric(5,2) not null check (duration_hours >= 0),
  session_type text not null,
  notes text,
  source_type text,
  source_file text,
  source_sheet text,
  source_row_key text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, source_sheet, source_row_key)
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  exam_type text not null,
  exam_board text,
  paper text not null,
  paper_year text,
  completed_on date not null,
  duration_minutes integer check (duration_minutes >= 0),
  timed boolean not null default true,
  raw_marks integer not null check (raw_marks >= 0),
  max_marks integer not null check (max_marks > 0),
  percentage numeric(5,2) generated always as ((raw_marks::numeric / nullif(max_marks, 0)::numeric) * 100) stored,
  grade text,
  target_grade text,
  next_boundary integer,
  target_boundary integer,
  time_remaining_minutes integer,
  cycle_status text not null default 'Needs error review' check (cycle_status in ('Needs marking', 'Needs error review', 'Corrections scheduled', 'Complete')),
  notes text,
  source_type text,
  source_file text,
  source_sheet text,
  source_row_key text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false,
  check (raw_marks <= max_marks),
  unique(owner_id, source_sheet, source_row_key)
);

create table if not exists public.exam_errors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  exam_id uuid references public.exams(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  topic_name text,
  paper_name text,
  error_date date not null,
  question_number text,
  marks_available integer check (marks_available >= 0),
  marks_lost integer not null check (marks_lost >= 0),
  category text not null,
  description text,
  correct_approach text,
  lesson_learned text,
  corrective_action text,
  retest_date date,
  retest_result text,
  resolved boolean not null default false,
  resolved_at timestamptz,
  source_type text,
  source_file text,
  source_sheet text,
  source_row_key text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, source_sheet, source_row_key)
);

create table if not exists public.tutors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  contact text,
  frequency text,
  lesson_duration_minutes integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.tutors(id) on delete cascade,
  session_date timestamptz not null,
  subject_id uuid references public.subjects(id) on delete set null,
  topics_covered text,
  problems_identified text,
  recommendations text,
  homework_assigned text,
  homework_completed boolean default false,
  confidence_before integer check (confidence_before between 1 and 5),
  confidence_after integer check (confidence_after between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.tutor_questions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  question text not null,
  status text not null default 'Unanswered' check (status in ('Unanswered', 'Answered', 'Needs Practice', 'Resolved')),
  resolved_at timestamptz,
  linked_tutor_session_id uuid references public.tutor_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  timeframe text not null check (timeframe in ('Annual', 'Monthly', 'Weekly')),
  area text not null,
  title text not null,
  target text,
  progress integer not null default 0 check (progress between 0 and 100),
  status text not null default 'Active',
  start_date date,
  target_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  sections jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  publish_to_portfolio boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, entry_date)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  problem text,
  description text,
  why_it_matters text,
  technologies text[] not null default '{}',
  engineering_concepts text[] not null default '{}',
  status text not null default 'Problem',
  started_on date,
  ended_on date,
  github_url text,
  demo_url text,
  publish_to_portfolio boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.project_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  log_date date not null,
  objective text,
  test_performed text,
  result text,
  unexpected_behaviour text,
  hypothesis text,
  modification text,
  lesson text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.startup_experiences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  company text,
  mentor text,
  starts_on date,
  ends_on date,
  department text,
  objectives text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.startup_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  startup_experience_id uuid not null references public.startup_experiences(id) on delete cascade,
  log_date date not null,
  activity text not null,
  technical_learning text,
  business_learning text,
  people_worked_with text,
  hours numeric(5,2),
  evidence_url text,
  reflection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.startup_problems (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  startup_experience_id uuid not null references public.startup_experiences(id) on delete cascade,
  linked_project_id uuid references public.projects(id) on delete set null,
  problem text not null,
  who_experiences_it text,
  frequency text,
  impact text,
  existing_solution text,
  possible_improvement text,
  status text not null default 'Discovered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  event_name text not null,
  event_date date,
  venue text,
  topic text,
  speakers text,
  people_met text,
  company text,
  notes text,
  reflection jsonb,
  publish_to_portfolio boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  company text,
  role text,
  where_met text,
  met_on date,
  linkedin_url text,
  email text,
  topics_discussed text,
  follow_up text,
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text,
  category text,
  subject text,
  why_saved text,
  completed boolean not null default false,
  key_takeaway text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  review jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, week_start)
);

create table if not exists public.monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  month_start date not null,
  review jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, month_start)
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null,
  source_id uuid,
  title text not null,
  summary text,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text,
  evidence text,
  acquired boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  linked_table text not null,
  linked_id uuid not null,
  file_url text not null,
  file_type text,
  caption text,
  publish_to_portfolio boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.activity_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  field_name text,
  old_value jsonb,
  new_value jsonb,
  metadata jsonb,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id)
);

create table if not exists public.topic_progress_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  status text,
  confidence integer,
  accuracy integer,
  error_count integer,
  source text
);

create table if not exists public.weekly_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  subject_metrics jsonb not null default '{}'::jsonb,
  study_metrics jsonb not null default '{}'::jsonb,
  exam_metrics jsonb not null default '{}'::jsonb,
  error_metrics jsonb not null default '{}'::jsonb,
  project_metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(owner_id, week_start)
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  filename text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'Started',
  rows_created integer not null default 0,
  rows_updated integer not null default 0,
  rows_skipped integer not null default 0,
  warnings jsonb not null default '[]'::jsonb,
  errors jsonb not null default '[]'::jsonb
);

create or replace function public.log_activity()
returns trigger
language plpgsql
as $$
declare
  row_owner uuid;
  actor uuid;
begin
  row_owner := coalesce(new.owner_id, old.owner_id);
  actor := coalesce(new.updated_by, new.created_by, auth.uid());

  insert into public.activity_history(owner_id, entity_type, entity_id, action, old_value, new_value, changed_by)
  values (
    row_owner,
    tg_table_name,
    coalesce(new.id, old.id),
    case
      when tg_op = 'INSERT' then 'CREATE'
      when tg_op = 'UPDATE' and new.is_deleted = true and old.is_deleted = false then 'SOFT_DELETE'
      when tg_op = 'UPDATE' then 'UPDATE'
      when tg_op = 'DELETE' then 'DELETE'
      else tg_op
    end,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    actor
  );

  return coalesce(new, old);
end;
$$;

create or replace function public.log_topic_progress()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT'
    or new.status is distinct from old.status
    or new.confidence is distinct from old.confidence
    or new.accuracy is distinct from old.accuracy
    or new.error_count is distinct from old.error_count
  then
    insert into public.topic_progress_history(owner_id, topic_id, status, confidence, accuracy, error_count, source)
    values (new.owner_id, new.id, new.status, new.confidence, new.accuracy, new.error_count, 'topic_update');
  end if;

  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'subjects','topics','daily_plans','daily_tasks','study_sessions','exams','exam_errors',
    'tutors','tutor_sessions','tutor_questions','goals','journal_entries','projects',
    'project_logs','startup_experiences','startup_logs','startup_problems','events',
    'contacts','learning_resources','weekly_reviews','monthly_reviews','portfolio_items',
    'skills','attachments'
  ]
  loop
    execute format('drop trigger if exists set_updated_at_%I on public.%I', table_name, table_name);
    execute format('create trigger set_updated_at_%I before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
    execute format('drop trigger if exists log_activity_%I on public.%I', table_name, table_name);
    execute format('create trigger log_activity_%I after insert or update or delete on public.%I for each row execute function public.log_activity()', table_name, table_name);
  end loop;
end $$;

drop trigger if exists log_topic_progress_topics on public.topics;
create trigger log_topic_progress_topics
after insert or update on public.topics
for each row execute function public.log_topic_progress();

alter table public.profiles enable row level security;
drop policy if exists "profiles own select" on public.profiles;
drop policy if exists "profiles own insert" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own select" on public.profiles for select using (auth.uid() = id);
create policy "profiles own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'subjects','topics','daily_plans','daily_tasks','study_sessions','exams','exam_errors',
    'tutors','tutor_sessions','tutor_questions','goals','journal_entries','projects',
    'project_logs','startup_experiences','startup_logs','startup_problems','events',
    'contacts','learning_resources','weekly_reviews','monthly_reviews','portfolio_items',
    'skills','attachments','activity_history','topic_progress_history','weekly_snapshots',
    'import_jobs'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "%I own select" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%I own insert" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%I own update" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%I own delete" on public.%I', table_name, table_name);
    execute format('create policy "%I own select" on public.%I for select using (auth.uid() = owner_id)', table_name, table_name);
    execute format('create policy "%I own insert" on public.%I for insert with check (auth.uid() = owner_id)', table_name, table_name);
    execute format('create policy "%I own update" on public.%I for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id)', table_name, table_name);
    execute format('create policy "%I own delete" on public.%I for delete using (auth.uid() = owner_id)', table_name, table_name);
  end loop;
end $$;

drop policy if exists "public published projects" on public.projects;
create policy "public published projects"
on public.projects for select
using (publish_to_portfolio = true and is_deleted = false);

drop policy if exists "public portfolio items" on public.portfolio_items;
create policy "public portfolio items"
on public.portfolio_items for select
using (visibility = 'public' and is_deleted = false);

create index if not exists subjects_owner_idx on public.subjects(owner_id);
create index if not exists topics_subject_idx on public.topics(subject_id);
create index if not exists topics_owner_idx on public.topics(owner_id);
create index if not exists daily_plans_owner_date_idx on public.daily_plans(owner_id, plan_date);
create index if not exists daily_tasks_plan_idx on public.daily_tasks(daily_plan_id);
create index if not exists study_sessions_owner_date_idx on public.study_sessions(owner_id, session_date);
create index if not exists exams_owner_date_idx on public.exams(owner_id, completed_on);
create index if not exists exam_errors_subject_date_idx on public.exam_errors(subject_id, error_date);
create index if not exists exam_errors_topic_idx on public.exam_errors(topic_id);
create index if not exists journal_entries_owner_date_idx on public.journal_entries(owner_id, entry_date);
create index if not exists project_logs_project_date_idx on public.project_logs(project_id, log_date);
create index if not exists events_owner_date_idx on public.events(owner_id, event_date);
create index if not exists activity_history_owner_changed_idx on public.activity_history(owner_id, changed_at desc);
create index if not exists weekly_snapshots_owner_week_idx on public.weekly_snapshots(owner_id, week_start);

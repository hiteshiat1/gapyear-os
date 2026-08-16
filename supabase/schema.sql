create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'student',
  created_at timestamptz not null default now()
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  short_name text not null,
  achieved_grade text,
  target_grade text,
  estimated_grade text,
  latest_mock_grade text,
  syllabus_completion integer not null default 0 check (syllabus_completion between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  name text not null,
  status text not null default 'Not Started',
  confidence integer check (confidence between 1 and 5),
  accuracy integer check (accuracy between 0 and 100),
  error_count integer not null default 0,
  last_revised date,
  priority text not null default 'Medium',
  notes text,
  tutor_feedback text,
  created_at timestamptz not null default now()
);

create table if not exists daily_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  plan_date date not null,
  energy integer check (energy between 1 and 5),
  focus integer check (focus between 1 and 5),
  motivation integer check (motivation between 1 and 5),
  sleep_hours numeric(4,2),
  academic_goal text,
  personal_goal text,
  total_focused_hours numeric(5,2),
  evening_reflection jsonb,
  unique(owner_id, plan_date)
);

create table if not exists daily_tasks (
  id uuid primary key default gen_random_uuid(),
  daily_plan_id uuid not null references daily_plans(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  task text not null,
  category text not null,
  topic text,
  starts_at time,
  ends_at time,
  estimated_duration numeric(5,2),
  actual_duration numeric(5,2),
  status text not null default 'Planned',
  difficulty integer check (difficulty between 1 and 5),
  confidence_before integer check (confidence_before between 1 and 5),
  confidence_after integer check (confidence_after between 1 and 5),
  notes text
);

create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  topic_id uuid references topics(id) on delete set null,
  session_date date not null,
  duration_hours numeric(5,2) not null,
  session_type text not null,
  notes text
);

create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  exam_type text not null,
  exam_board text,
  paper text not null,
  paper_year text,
  completed_on date not null,
  duration_minutes integer,
  timed boolean not null default true,
  raw_marks integer not null,
  max_marks integer not null,
  percentage numeric(5,2) generated always as ((raw_marks::numeric / nullif(max_marks, 0)::numeric) * 100) stored,
  grade text,
  target_grade text,
  next_boundary integer,
  target_boundary integer,
  time_remaining_minutes integer,
  cycle_status text not null default 'Needs error review',
  notes text
);

create table if not exists exam_errors (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  topic_id uuid references topics(id) on delete set null,
  error_date date not null,
  question_number text,
  marks_available integer,
  marks_lost integer not null,
  category text not null,
  description text,
  correct_approach text,
  lesson_learned text,
  corrective_action text,
  retest_date date,
  retest_result text,
  resolved boolean not null default false
);

create table if not exists tutors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  subject_id uuid references subjects(id) on delete set null,
  contact text,
  frequency text,
  lesson_duration_minutes integer,
  notes text
);

create table if not exists tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  session_date timestamptz not null,
  subject_id uuid references subjects(id) on delete set null,
  topics_covered text,
  problems_identified text,
  recommendations text,
  homework_assigned text,
  homework_completed boolean default false,
  confidence_before integer check (confidence_before between 1 and 5),
  confidence_after integer check (confidence_after between 1 and 5)
);

create table if not exists tutor_questions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  question text not null,
  status text not null default 'Unanswered',
  created_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  timeframe text not null,
  area text not null,
  title text not null,
  progress integer not null default 0 check (progress between 0 and 100)
);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  entry_date date not null,
  sections jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  publish_to_portfolio boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  problem text,
  description text,
  why_it_matters text,
  technologies text[],
  engineering_concepts text[],
  status text not null default 'Problem',
  started_on date,
  ended_on date,
  github_url text,
  demo_url text,
  publish_to_portfolio boolean not null default false
);

create table if not exists project_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  log_date date not null,
  objective text,
  test_performed text,
  result text,
  unexpected_behaviour text,
  hypothesis text,
  modification text,
  lesson text
);

create table if not exists startup_experiences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  company text,
  mentor text,
  starts_on date,
  ends_on date,
  department text,
  objectives text
);

create table if not exists startup_problems (
  id uuid primary key default gen_random_uuid(),
  startup_experience_id uuid not null references startup_experiences(id) on delete cascade,
  problem text not null,
  who_experiences_it text,
  frequency text,
  impact text,
  existing_solution text,
  possible_improvement text
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  event_name text not null,
  event_date date,
  venue text,
  topic text,
  speakers text,
  people_met text,
  company text,
  notes text,
  reflection jsonb,
  publish_to_portfolio boolean not null default false
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  company text,
  role text,
  where_met text,
  met_on date,
  linkedin_url text,
  email text,
  topics_discussed text,
  follow_up text,
  next_action text
);

create table if not exists learning_resources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  url text,
  category text,
  subject text,
  why_saved text,
  completed boolean not null default false,
  key_takeaway text
);

create table if not exists weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  week_start date not null,
  review jsonb not null default '{}'::jsonb
);

create table if not exists monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  month_start date not null,
  review jsonb not null default '{}'::jsonb
);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  item_type text not null,
  source_id uuid,
  title text not null,
  summary text,
  visibility text not null default 'private'
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  category text,
  evidence text,
  acquired boolean not null default false
);

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  linked_table text not null,
  linked_id uuid not null,
  file_url text not null,
  file_type text,
  caption text,
  publish_to_portfolio boolean not null default false
);

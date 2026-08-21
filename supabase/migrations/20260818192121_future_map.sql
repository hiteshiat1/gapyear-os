create table if not exists public.interest_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  broad_interests text[] not null default '{}',
  free_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(owner_id)
);

create table if not exists public.course_interests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  course_name text not null,
  interest_level integer not null default 3 check (interest_level between 1 and 5),
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.student_university_choices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  university text not null,
  course text not null,
  entry_year text,
  typical_entry_requirements text,
  required_subjects text,
  contextual_requirements text,
  admissions_tests text,
  interest_level integer not null default 3 check (interest_level between 1 and 5),
  status text not null default 'exploring' check (status in ('exploring', 'shortlist', 'aspirational', 'realistic', 'safety', 'applied', 'offer', 'rejected', 'withdrawn')),
  notes text,
  source_url text,
  last_checked date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.career_families (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  example_roles text[] not null default '{}',
  skills text[] not null default '{}',
  typical_degree_routes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);

create table if not exists public.student_career_interests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  career_family_id uuid not null references public.career_families(id) on delete cascade,
  interest_level integer not null default 3 check (interest_level between 1 and 5),
  reason text,
  status text not null default 'exploring',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  is_deleted boolean not null default false,
  unique(owner_id, career_family_id)
);

create table if not exists public.evidence_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  course_interest_id uuid references public.course_interests(id) on delete set null,
  university_choice_id uuid references public.student_university_choices(id) on delete set null,
  career_family_id uuid references public.career_families(id) on delete set null,
  skills text[] not null default '{}',
  ucas_category text,
  reflection_strength text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.future_maps (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Future Map',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  unique(owner_id)
);

create table if not exists public.future_map_nodes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  future_map_id uuid references public.future_maps(id) on delete cascade,
  node_type text not null,
  label text not null,
  reference_id uuid,
  metadata jsonb,
  position_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  is_deleted boolean not null default false
);

create table if not exists public.future_map_edges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  future_map_id uuid references public.future_maps(id) on delete cascade,
  from_node_id uuid references public.future_map_nodes(id) on delete cascade,
  to_node_id uuid references public.future_map_nodes(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  is_deleted boolean not null default false
);

alter table public.interest_profiles enable row level security;
alter table public.course_interests enable row level security;
alter table public.student_university_choices enable row level security;
alter table public.career_families enable row level security;
alter table public.student_career_interests enable row level security;
alter table public.evidence_links enable row level security;
alter table public.future_maps enable row level security;
alter table public.future_map_nodes enable row level security;
alter table public.future_map_edges enable row level security;

drop policy if exists "own interest profiles" on public.interest_profiles;
create policy "own interest profiles" on public.interest_profiles for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "own course interests" on public.course_interests;
create policy "own course interests" on public.course_interests for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "own university choices" on public.student_university_choices;
create policy "own university choices" on public.student_university_choices for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "read career families" on public.career_families;
create policy "read career families" on public.career_families for select to authenticated using (true);

drop policy if exists "own career interests" on public.student_career_interests;
create policy "own career interests" on public.student_career_interests for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "own evidence links" on public.evidence_links;
create policy "own evidence links" on public.evidence_links for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "own future maps" on public.future_maps;
create policy "own future maps" on public.future_maps for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "own future map nodes" on public.future_map_nodes;
create policy "own future map nodes" on public.future_map_nodes for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "own future map edges" on public.future_map_edges;
create policy "own future map edges" on public.future_map_edges for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create index if not exists course_interests_owner_idx on public.course_interests(owner_id, is_deleted);
create index if not exists university_choices_owner_status_idx on public.student_university_choices(owner_id, status, is_deleted);
create index if not exists student_career_interests_owner_idx on public.student_career_interests(owner_id, is_deleted);
create index if not exists evidence_links_owner_idx on public.evidence_links(owner_id, is_deleted);
create index if not exists future_map_nodes_owner_idx on public.future_map_nodes(owner_id, is_deleted);

insert into public.career_families(name, description, example_roles, skills, typical_degree_routes)
values
  ('Engineering & Manufacturing', 'Designing, building and improving physical systems.', array['Mechanical engineer', 'Electrical engineer', 'Manufacturing engineer'], array['CAD', 'systems thinking', 'testing', 'mathematics'], array['Engineering', 'Physics', 'Materials Science']),
  ('Software & AI', 'Building software systems, data products and AI-enabled tools.', array['Software engineer', 'Data scientist', 'AI engineer'], array['programming', 'logic', 'data analysis', 'product thinking'], array['Computer Science', 'Mathematics', 'Engineering']),
  ('Energy & Climate', 'Solving problems around energy systems, climate technology and infrastructure.', array['Renewable energy engineer', 'Climate analyst', 'Grid systems engineer'], array['modelling', 'physics', 'policy awareness', 'data analysis'], array['Engineering', 'Physics', 'Environmental Science']),
  ('Healthcare', 'Improving health through clinical practice, science, technology and systems.', array['Doctor', 'Biomedical scientist', 'Clinical engineer'], array['biology', 'communication', 'ethics', 'evidence analysis'], array['Medicine', 'Biomedical Sciences', 'Engineering']),
  ('Finance', 'Using quantitative, commercial and analytical skills in financial contexts.', array['Analyst', 'Quant researcher', 'Investment associate'], array['numeracy', 'modelling', 'commercial judgement'], array['Economics', 'Mathematics', 'Finance']),
  ('Research & Academia', 'Creating and testing knowledge through structured inquiry.', array['Researcher', 'Lab scientist', 'PhD student'], array['research design', 'writing', 'analysis'], array['Natural Sciences', 'Mathematics', 'Social Sciences']),
  ('Product & Design', 'Understanding users and shaping useful products or services.', array['Product manager', 'UX designer', 'Design engineer'], array['user research', 'prototyping', 'communication'], array['Design Engineering', 'Computer Science', 'Business']),
  ('Entrepreneurship', 'Finding problems, building solutions and creating organisations.', array['Founder', 'Operator', 'Venture builder'], array['experimentation', 'sales', 'resilience', 'product thinking'], array['Any degree route'])
on conflict (name) do update
set description = excluded.description,
    example_roles = excluded.example_roles,
    skills = excluded.skills,
    typical_degree_routes = excluded.typical_degree_routes;

do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    drop trigger if exists set_interest_profiles_updated_at on public.interest_profiles;
    create trigger set_interest_profiles_updated_at before update on public.interest_profiles for each row execute function public.set_updated_at();
    drop trigger if exists set_course_interests_updated_at on public.course_interests;
    create trigger set_course_interests_updated_at before update on public.course_interests for each row execute function public.set_updated_at();
    drop trigger if exists set_university_choices_updated_at on public.student_university_choices;
    create trigger set_university_choices_updated_at before update on public.student_university_choices for each row execute function public.set_updated_at();
    drop trigger if exists set_student_career_interests_updated_at on public.student_career_interests;
    create trigger set_student_career_interests_updated_at before update on public.student_career_interests for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.a_level_subjects
  add column if not exists student_selectable boolean not null default false;

create table if not exists public.subject_provisioning_status (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.a_level_subjects(id) on delete cascade,
  board_code text not null check (board_code in ('AQA', 'EDEXCEL')),
  status text not null check (status in ('ready', 'coming_soon', 'not_offered', 'error')),
  specification_id uuid references public.specifications(id) on delete set null,
  message text,
  provisioned_at timestamptz not null default now(),
  unique(subject_id, board_code)
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

alter table public.subject_provisioning_status enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "admin read provisioning status" on public.subject_provisioning_status;
create policy "admin read provisioning status" on public.subject_provisioning_status
  for select to authenticated using (public.is_admin(auth.uid()));
drop policy if exists "admin write provisioning status" on public.subject_provisioning_status;
create policy "admin write provisioning status" on public.subject_provisioning_status
  for insert to authenticated with check (public.is_admin(auth.uid()));
drop policy if exists "admin update provisioning status" on public.subject_provisioning_status;
create policy "admin update provisioning status" on public.subject_provisioning_status
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin read audit log" on public.audit_log;
create policy "admin read audit log" on public.audit_log
  for select to authenticated using (public.is_admin(auth.uid()));
drop policy if exists "own audit log insert" on public.audit_log;
create policy "own audit log insert" on public.audit_log
  for insert to authenticated with check (auth.uid() = actor_id);

create index if not exists subject_provisioning_status_subject_idx on public.subject_provisioning_status(subject_id);
create index if not exists audit_log_entity_idx on public.audit_log(entity_type, entity_id, created_at desc);

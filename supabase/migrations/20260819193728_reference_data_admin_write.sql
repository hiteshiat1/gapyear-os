-- Reference tables (exam_boards, a_level_subjects, board_subject_offerings,
-- specifications, specification_options, papers, grade_scales) only had
-- select policies for authenticated users. Seeding them via the app
-- (seedReferenceDataAction) was blocked by RLS with no insert/update policy
-- at all, for every user including admins.
--
-- Per issue 3, students must never be able to mutate canonical reference
-- data, so this does not open write access broadly. It adds insert/update
-- policies gated on profiles.role = 'admin' so an admin account can run the
-- "Load A Level Subjects" seed action from the app while regular students
-- remain read-only.

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

drop policy if exists "admin write exam boards" on public.exam_boards;
create policy "admin write exam boards" on public.exam_boards
  for insert to authenticated with check (public.is_admin(auth.uid()));
drop policy if exists "admin update exam boards" on public.exam_boards;
create policy "admin update exam boards" on public.exam_boards
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin write a level subjects" on public.a_level_subjects;
create policy "admin write a level subjects" on public.a_level_subjects
  for insert to authenticated with check (public.is_admin(auth.uid()));
drop policy if exists "admin update a level subjects" on public.a_level_subjects;
create policy "admin update a level subjects" on public.a_level_subjects
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin write board offerings" on public.board_subject_offerings;
create policy "admin write board offerings" on public.board_subject_offerings
  for insert to authenticated with check (public.is_admin(auth.uid()));
drop policy if exists "admin update board offerings" on public.board_subject_offerings;
create policy "admin update board offerings" on public.board_subject_offerings
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin write specifications" on public.specifications;
create policy "admin write specifications" on public.specifications
  for insert to authenticated with check (public.is_admin(auth.uid()));
drop policy if exists "admin update specifications" on public.specifications;
create policy "admin update specifications" on public.specifications
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin write specification options" on public.specification_options;
create policy "admin write specification options" on public.specification_options
  for insert to authenticated with check (public.is_admin(auth.uid()));
drop policy if exists "admin update specification options" on public.specification_options;
create policy "admin update specification options" on public.specification_options
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin write papers" on public.papers;
create policy "admin write papers" on public.papers
  for insert to authenticated with check (public.is_admin(auth.uid()));
drop policy if exists "admin update papers" on public.papers;
create policy "admin update papers" on public.papers
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin write grade scales" on public.grade_scales;
create policy "admin write grade scales" on public.grade_scales
  for insert to authenticated with check (public.is_admin(auth.uid()));
drop policy if exists "admin update grade scales" on public.grade_scales;
create policy "admin update grade scales" on public.grade_scales
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Admin platform management: an admin needs to see and change other users'
-- profiles (e.g. promote a user to admin, review who is on the platform).
-- profiles previously only allowed a user to see/update their own row.
drop policy if exists "admin read all profiles" on public.profiles;
create policy "admin read all profiles" on public.profiles
  for select to authenticated using (public.is_admin(auth.uid()));
drop policy if exists "admin update all profiles" on public.profiles;
create policy "admin update all profiles" on public.profiles
  for update to authenticated using (public.is_admin(auth.uid())) with check (true);

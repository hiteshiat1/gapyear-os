create or replace function public.seed_sachith_academic_data(target_owner uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, role)
  values (target_owner, 'Student', 'student')
  on conflict (id) do update set role = excluded.role;

  insert into public.subjects(owner_id, name, short_name, achieved_grade, target_grade, active)
  values
    (target_owner, 'Mathematics', 'Maths', 'B', 'A*', true),
    (target_owner, 'Further Mathematics', 'FM', 'C', 'A', true),
    (target_owner, 'Physics', 'Physics', 'D', 'A', true),
    (target_owner, 'Economics', 'Econ', 'B', 'B', false)
  on conflict do nothing;

  insert into public.goals(owner_id, timeframe, area, title, target, progress, status)
  values
    (target_owner, 'Annual', 'Academic', 'Mathematics B to A*', 'A*', 0, 'Active'),
    (target_owner, 'Annual', 'Academic', 'Further Mathematics C to A', 'A', 0, 'Active'),
    (target_owner, 'Annual', 'Academic', 'Physics D to A', 'A', 0, 'Active'),
    (target_owner, 'Annual', 'Engineering', 'Complete one substantial engineering project', 'Published evidence', 0, 'Active'),
    (target_owner, 'Annual', 'Portfolio', 'Build documented evidence of the gap year', 'Public showcase', 0, 'Active')
  on conflict do nothing;
end;
$$;

-- After creating the first auth user, run:
-- select public.seed_sachith_academic_data('PASTE_AUTH_USER_UUID_HERE');

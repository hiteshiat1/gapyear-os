alter table public.student_profiles
  add column if not exists visual_tone text not null default 'masculine';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'student_profiles_visual_tone_check'
  ) then
    alter table public.student_profiles
      add constraint student_profiles_visual_tone_check
      check (visual_tone in ('masculine', 'feminine'));
  end if;
end $$;

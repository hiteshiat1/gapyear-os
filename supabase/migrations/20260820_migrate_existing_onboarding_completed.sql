-- One-time backfill: any existing student who already has at least one active
-- student_subjects row is treated as having effectively completed onboarding,
-- even if onboarding_completed was never explicitly set true (e.g. data seeded
-- directly, or completed before the strict gate/student_selectable filter existed).
-- New users with zero student_subjects rows are untouched and still go through
-- the strict onboarding gate on next login.
update public.student_profiles
set onboarding_completed = true, onboarding_step = 3
where onboarding_completed = false
  and owner_id in (
    select distinct owner_id
    from public.student_subjects
    where active = true and is_deleted = false
  );

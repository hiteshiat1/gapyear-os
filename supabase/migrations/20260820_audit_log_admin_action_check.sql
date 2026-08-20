-- Tighten audit_log insert policy: admin-only action types (action LIKE 'admin_%')
-- can only be inserted by users who are actually admins, not just by anyone
-- claiming to be the actor. Student-facing action types remain self-insertable
-- as before. This closes a gap where a non-admin using the Supabase client
-- directly (bypassing the app's server actions) could otherwise insert a
-- fabricated audit_log row falsely attributed as an admin action.
drop policy if exists "own audit log insert" on public.audit_log;
create policy "own audit log insert" on public.audit_log
  for insert to authenticated
  with check (
    auth.uid() = actor_id
    and (action not like 'admin_%' or public.is_admin(auth.uid()))
  );

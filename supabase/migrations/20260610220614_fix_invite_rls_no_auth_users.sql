-- Fix: pending invites were invisible to shop owners/admins. The old invites_select
-- policy subqueried auth.users, which the authenticated role cannot read, so every
-- SELECT on workspace_invites failed with 42501 (surfaced as a PostgREST 403 and a
-- silently empty Pending Invites list). Policies now use the SECURITY DEFINER
-- is_workspace_admin() helper (owner OR admin, matching the Team UI) and the JWT
-- email claim instead of reading auth.users.

drop policy if exists invites_select on public.workspace_invites;
drop policy if exists invites_insert on public.workspace_invites;
drop policy if exists invites_delete on public.workspace_invites;

create policy invites_select on public.workspace_invites for select using (
  public.is_workspace_admin(workspace_id)
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy invites_insert on public.workspace_invites for insert with check (
  public.is_workspace_admin(workspace_id)
);

create policy invites_delete on public.workspace_invites for delete using (
  public.is_workspace_admin(workspace_id)
);

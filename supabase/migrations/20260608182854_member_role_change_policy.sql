-- Migration: member_role_change_policy
-- Version: 20260608182854
-- Applied to the live CabinetShop.io project (ref ibarpcoigmpnicljeyzu) on 2026-06-08 and
-- captured here. Adds the missing UPDATE policy on workspace_members so owner/admin can
-- change a member's role (admin/member/viewer). The owner row is protected and this path
-- can never mint a second owner.

drop policy if exists wm_update on public.workspace_members;
create policy wm_update on public.workspace_members for update
  using (public.is_workspace_admin(workspace_id) and role <> 'owner')
  with check (public.is_workspace_admin(workspace_id) and role in ('admin','member','viewer'));

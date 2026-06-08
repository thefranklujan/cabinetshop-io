-- Migration: security_pass_1_rls_with_check_and_rbac
-- Version: 20260608175010
-- Applied to the live CabinetShop.io project (ref ibarpcoigmpnicljeyzu) on 2026-06-08 and
-- captured here. Adds WITH CHECK to every workspace-scoped UPDATE policy and enforces the
-- workspace role model (owner/admin/member/viewer) at the RLS layer.
--
-- Role model:
--   owner/admin -> full access incl. delete + team/settings management
--   member      -> create/update operational rows, NO destructive delete
--   viewer      -> read-only (no insert/update/delete)
--
-- All helpers are SECURITY DEFINER + STABLE so they read workspace_members without
-- re-triggering RLS (mirrors current_workspaces() and avoids policy recursion).

create or replace function public.workspace_role(ws uuid) returns text
language sql security definer stable set search_path = public as $$
  select role from public.workspace_members
  where workspace_id = ws and user_id = auth.uid();
$$;

create or replace function public.is_workspace_admin(ws uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid() and role in ('owner','admin')
  );
$$;

create or replace function public.can_write_workspace(ws uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid() and role in ('owner','admin','member')
  );
$$;

-- Workspace-scoped operational tables: writers (owner/admin/member) may insert/update;
-- UPDATE gets WITH CHECK so a row cannot be moved into a workspace the caller can't write;
-- DELETE is restricted to owner/admin. SELECT policies (membership-based) are left intact.
do $$
declare t text;
begin
  for t in select unnest(array[
    'clients','projects','materials','cut_list_items',
    'purchase_orders','time_entries','schedule_events','invoices'
  ])
  loop
    execute format('drop policy if exists %I_insert on public.%I', t, t);
    execute format('create policy %I_insert on public.%I for insert with check (public.can_write_workspace(workspace_id))', t, t);

    execute format('drop policy if exists %I_update on public.%I', t, t);
    execute format('create policy %I_update on public.%I for update using (public.can_write_workspace(workspace_id)) with check (public.can_write_workspace(workspace_id))', t, t);

    execute format('drop policy if exists %I_delete on public.%I', t, t);
    execute format('create policy %I_delete on public.%I for delete using (public.is_workspace_admin(workspace_id))', t, t);
  end loop;
end$$;

-- workspaces: keep owner-only update, add WITH CHECK so the row must still be owned by the
-- caller after update (blocks silent ownership transfer via update).
alter policy ws_update on public.workspaces using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- workspace_invites: team management belongs to owner/admin (was owner-only).
drop policy if exists invites_insert on public.workspace_invites;
create policy invites_insert on public.workspace_invites for insert
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists invites_delete on public.workspace_invites;
create policy invites_delete on public.workspace_invites for delete
  using (public.is_workspace_admin(workspace_id));

drop policy if exists invites_select on public.workspace_invites;
create policy invites_select on public.workspace_invites for select using (
  public.is_workspace_admin(workspace_id)
  or email = (select email from auth.users where id = auth.uid())
);

-- workspace_members: owner/admin may add/remove members, but the 'owner' row is protected.
drop policy if exists wm_insert on public.workspace_members;
create policy wm_insert on public.workspace_members for insert with check (
  user_id = auth.uid() or public.is_workspace_admin(workspace_id)
);

drop policy if exists wm_delete on public.workspace_members;
create policy wm_delete on public.workspace_members for delete using (
  public.is_workspace_admin(workspace_id) and role <> 'owner'
);

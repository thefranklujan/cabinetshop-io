-- Migration: workspace_settings_columns_and_guard
-- Version: 20260608181638
-- Applied to the live CabinetShop.io project (ref ibarpcoigmpnicljeyzu) on 2026-06-08 and
-- captured here. Adds editable shop settings columns, lets owner/admin update workspace
-- settings, and freezes billing/identity columns against client (authenticated) updates.

alter table public.workspaces
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists hourly_rate numeric(10,2),
  add column if not exists tax_rate numeric(6,3),
  add column if not exists currency text not null default 'USD';

-- Settings management belongs to owner/admin (ws_update was owner-only, too narrow for admins).
alter policy ws_update on public.workspaces
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

-- Defense in depth: freeze billing/identity columns for client (authenticated) updates,
-- regardless of the payload sent. Service-role/admin connections (e.g. future billing) bypass.
create or replace function public.protect_workspace_columns() returns trigger
language plpgsql as $$
begin
  if current_user not in ('postgres','service_role','supabase_admin') then
    new.id := old.id;
    new.owner_id := old.owner_id;
    new.slug := old.slug;
    new.plan := old.plan;
    new.created_at := old.created_at;
  end if;
  return new;
end$$;

drop trigger if exists trg_protect_workspace_columns on public.workspaces;
create trigger trg_protect_workspace_columns
  before update on public.workspaces
  for each row execute function public.protect_workspace_columns();

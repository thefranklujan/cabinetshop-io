-- Migration: invites_and_platform_admin
-- Version: 20260408181156
-- Captured verbatim from the live CabinetShop.io Supabase project on 2026-06-08.
-- Adds workspace_invites + invite-aware handle_new_user(), and the platform_admins table
-- + is_platform_admin() helper used by the /platform console.
-- NOTE: the seeded platform-admin emails below are Frank's public business addresses, captured
-- as-applied. Rotate/parameterize if this repo's visibility ever changes.

-- Pending invites (workspace owner invites by email; the invitee gets added on their next sign-up/in)
create table workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin','member','viewer')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique (workspace_id, email)
);
create index on workspace_invites(email);
alter table workspace_invites enable row level security;

-- Owners of the workspace can manage invites
create policy invites_select on workspace_invites for select using (
  workspace_id in (select id from workspaces where owner_id = auth.uid())
  or email = (select email from auth.users where id = auth.uid())
);
create policy invites_insert on workspace_invites for insert with check (
  workspace_id in (select id from workspaces where owner_id = auth.uid())
);
create policy invites_delete on workspace_invites for delete using (
  workspace_id in (select id from workspaces where owner_id = auth.uid())
);

-- Replace handle_new_user: if there are pending invites for the email, attach to those workspaces
-- and DO NOT auto-create a new workspace. If no invites, create their own workspace from metadata.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  shop_name text;
  base_slug text;
  final_slug text;
  invite_count int;
begin
  select count(*) into invite_count from public.workspace_invites where lower(email) = lower(new.email);

  if invite_count > 0 then
    insert into public.workspace_members(workspace_id, user_id, role)
    select workspace_id, new.id, role from public.workspace_invites
    where lower(email) = lower(new.email);
    delete from public.workspace_invites where lower(email) = lower(new.email);
    return new;
  end if;

  shop_name := coalesce(new.raw_user_meta_data->>'shop_name', split_part(new.email, '@', 1) || '''s Shop');
  base_slug := lower(regexp_replace(shop_name, '[^a-z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug || '-' || substr(md5(random()::text), 1, 6);

  insert into public.workspaces(name, slug, owner_id) values (shop_name, final_slug, new.id);
  return new;
end$$;

-- Platform admin emails table (CabinetShop.io owner = Frank)
create table platform_admins (
  email text primary key,
  added_at timestamptz default now()
);

insert into platform_admins(email) values ('frank@craftedsystems.io'), ('frank+ck@craftedsystems.io');

alter table platform_admins enable row level security;
create policy pa_self on platform_admins for select using (
  email = (select email from auth.users where id = auth.uid())
);

-- Helper used by /platform server pages: returns true if current user is a platform admin
create or replace function is_platform_admin() returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.platform_admins
    where lower(email) = lower((select email from auth.users where id = auth.uid()))
  );
$$;

-- Migration: auto_create_workspace_on_signup
-- Version: 20260408155520
-- Captured verbatim from the live CabinetShop.io Supabase project on 2026-06-08.
-- NOTE: handle_new_user() is REPLACED by a later migration (20260408181156) that adds
-- invite-aware behavior. This file is the original applied version; kept for ledger fidelity.

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  shop_name text;
  base_slug text;
  final_slug text;
begin
  shop_name := coalesce(new.raw_user_meta_data->>'shop_name', split_part(new.email, '@', 1) || '''s Shop');
  base_slug := lower(regexp_replace(shop_name, '[^a-z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug || '-' || substr(md5(random()::text), 1, 6);

  insert into public.workspaces(name, slug, owner_id) values (shop_name, final_slug, new.id);
  return new;
end$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

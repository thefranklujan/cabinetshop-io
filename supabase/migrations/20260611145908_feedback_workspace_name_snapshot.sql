-- Denormalized shop name so the platform console can display reports without
-- widening workspaces RLS (ws_select is member-only by design).
alter table public.feedback add column if not exists workspace_name text;

-- Phase 1 of the lean plan (docs/LEAN_PLAN_2026_06_10.md): approval gates, job
-- readiness checklist, and an append-only activity log. Additive only — no
-- existing column is altered. RLS mirrors the proven workspace pattern:
-- select = current_workspaces(), write = can_write_workspace(), delete = admin.
-- Gates are workflow guardrails, not tenant-security boundaries; tenant
-- isolation remains enforced by the workspace RLS exactly as before.

create table public.gates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  gate_key text not null,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','waiting_external','approved','declined','n_a')),
  mode text not null default 'warn' check (mode in ('block','warn')),
  blocks_stage text,
  owner_user_id uuid references auth.users(id) on delete set null,
  due_date date,
  fields jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (project_id, gate_key)
);
create index gates_workspace_idx on public.gates(workspace_id);
create index gates_project_idx on public.gates(project_id);
alter table public.gates enable row level security;

create policy gates_select on public.gates for select
  using (workspace_id in (select public.current_workspaces()));
create policy gates_insert on public.gates for insert
  with check (public.can_write_workspace(workspace_id));
create policy gates_update on public.gates for update
  using (public.can_write_workspace(workspace_id))
  with check (public.can_write_workspace(workspace_id));
create policy gates_delete on public.gates for delete
  using (public.is_workspace_admin(workspace_id));

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  item_key text not null,
  label text not null,
  status text not null default 'pending'
    check (status in ('pending','done','n_a')),
  required_for_release boolean not null default true,
  auto_source text,
  owner_user_id uuid references auth.users(id) on delete set null,
  done_at timestamptz,
  done_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (project_id, item_key)
);
create index checklist_workspace_idx on public.checklist_items(workspace_id);
create index checklist_project_idx on public.checklist_items(project_id);
alter table public.checklist_items enable row level security;

create policy checklist_select on public.checklist_items for select
  using (workspace_id in (select public.current_workspaces()));
create policy checklist_insert on public.checklist_items for insert
  with check (public.can_write_workspace(workspace_id));
create policy checklist_update on public.checklist_items for update
  using (public.can_write_workspace(workspace_id))
  with check (public.can_write_workspace(workspace_id));
create policy checklist_delete on public.checklist_items for delete
  using (public.is_workspace_admin(workspace_id));

-- Append-only: gate changes and overrides. No update/delete policies on purpose,
-- so the approval/override record cannot be rewritten from the app.
create table public.activity (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  verb text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_workspace_idx on public.activity(workspace_id);
create index activity_project_idx on public.activity(project_id);
alter table public.activity enable row level security;

create policy activity_select on public.activity for select
  using (workspace_id in (select public.current_workspaces()));
create policy activity_insert on public.activity for insert
  with check (public.can_write_workspace(workspace_id));

-- Additive columns used by readiness derivation
alter table public.projects add column if not exists released_to_production_at timestamptz;
alter table public.invoices add column if not exists is_deposit boolean not null default false;

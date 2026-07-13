-- Phase 4 of the lean plan (docs/LEAN_PLAN_2026_06_10.md §10): standard work
-- templates. Workspace-owned, DB-backed, edited in Settings (operational content
-- is never hardcoded). Applying a template COPIES rows onto the job — editing a
-- template never rewrites history on live jobs.

create table public.job_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  job_type text not null default 'general',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index job_templates_workspace_idx on public.job_templates(workspace_id);
alter table public.job_templates enable row level security;

create policy job_templates_select on public.job_templates for select
  using (workspace_id in (select public.current_workspaces()));
create policy job_templates_insert on public.job_templates for insert
  with check (public.is_workspace_admin(workspace_id));
create policy job_templates_update on public.job_templates for update
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));
create policy job_templates_delete on public.job_templates for delete
  using (public.is_workspace_admin(workspace_id));

-- kind 'task'      payload: {title, team?, offsetDays?, priority?}
-- kind 'checklist' payload: {label, required?}          (custom readiness item)
-- kind 'gate'      payload: {key, mode?, status?}       (override default gate)
create table public.template_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_id uuid not null references public.job_templates(id) on delete cascade,
  kind text not null check (kind in ('task','checklist','gate')),
  payload jsonb not null default '{}'::jsonb,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index template_items_workspace_idx on public.template_items(workspace_id);
create index template_items_template_idx on public.template_items(template_id);
alter table public.template_items enable row level security;

create policy template_items_select on public.template_items for select
  using (workspace_id in (select public.current_workspaces()));
create policy template_items_insert on public.template_items for insert
  with check (public.is_workspace_admin(workspace_id));
create policy template_items_update on public.template_items for update
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));
create policy template_items_delete on public.template_items for delete
  using (public.is_workspace_admin(workspace_id));

alter table public.projects add column if not exists template_id uuid references public.job_templates(id) on delete set null;

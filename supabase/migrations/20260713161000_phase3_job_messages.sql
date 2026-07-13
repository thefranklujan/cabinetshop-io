-- Phase 3 of the lean plan (docs/LEAN_PLAN_2026_06_10.md §9): per-job message
-- timeline — the defensible record of asks, approvals, and responses. Append-only
-- by policy (no UPDATE policy at all), so the record cannot be rewritten from the
-- app. Not chat, not email: typed entries on one timeline.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null
    check (kind in ('internal_note','client_note','approval_request','client_response','system')),
  body text not null,
  gate_id uuid references public.gates(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index messages_workspace_idx on public.messages(workspace_id);
create index messages_project_idx on public.messages(project_id);
alter table public.messages enable row level security;

create policy messages_select on public.messages for select
  using (workspace_id in (select public.current_workspaces()));
-- Author must be the caller: the approval record is only trustworthy if nobody
-- can write entries as someone else.
create policy messages_insert on public.messages for insert
  with check (public.can_write_workspace(workspace_id) and author_user_id = auth.uid());
-- No UPDATE policy on purpose (append-only). Admin may delete a mistaken entry.
create policy messages_delete on public.messages for delete
  using (public.is_workspace_admin(workspace_id));

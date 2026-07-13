-- Phase 2 of the lean plan (docs/LEAN_PLAN_2026_06_10.md): tasks + constraints.
-- Additive only. RLS mirrors the proven workspace pattern: select =
-- current_workspaces(), insert/update = can_write_workspace(), delete = admin.
-- Also adds workspace_member_emails() so task owners and the Team page can show
-- real emails instead of truncated user ids (Phase 2 prereq in the plan).

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  owner_user_id uuid references auth.users(id) on delete set null,
  team text check (team in ('office','shop','field','design')),
  due_date date,
  status text not null default 'open'
    check (status in ('open','in_progress','done','canceled')),
  priority text not null default 'Normal'
    check (priority in ('Low','Normal','High','Rush')),
  is_blocker boolean not null default false,
  waiting_on text
    check (waiting_on in ('client','design','material','vendor','install_date','internal')),
  stage text,
  template_item_id uuid,
  done_at timestamptz,
  created_at timestamptz not null default now()
);
create index tasks_workspace_idx on public.tasks(workspace_id);
create index tasks_project_idx on public.tasks(project_id);
alter table public.tasks enable row level security;

create policy tasks_select on public.tasks for select
  using (workspace_id in (select public.current_workspaces()));
create policy tasks_insert on public.tasks for insert
  with check (public.can_write_workspace(workspace_id));
create policy tasks_update on public.tasks for update
  using (public.can_write_workspace(workspace_id))
  with check (public.can_write_workspace(workspace_id));
create policy tasks_delete on public.tasks for delete
  using (public.is_workspace_admin(workspace_id));

-- Emails for members of a workspace the caller belongs to. SECURITY DEFINER so it
-- can read auth.users, guarded by the same membership check RLS uses everywhere.
create or replace function public.workspace_member_emails(ws uuid)
returns table (user_id uuid, email text, role text, joined_at timestamptz)
language sql security definer stable set search_path = public as $$
  select m.user_id, u.email::text, m.role, m.joined_at
  from public.workspace_members m
  join auth.users u on u.id = m.user_id
  where m.workspace_id = ws
    and ws in (select public.current_workspaces())
  order by m.joined_at, m.user_id;
$$;

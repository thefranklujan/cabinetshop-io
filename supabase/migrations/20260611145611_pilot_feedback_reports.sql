-- In-app bug/feedback reports for the pilot. Any workspace member (including
-- viewers) can file one; only platform admins read and triage them. Reporters
-- can read back their own reports. No app-side delete.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  page text,
  kind text not null default 'bug' check (kind in ('bug','idea','question')),
  message text not null,
  status text not null default 'new' check (status in ('new','seen','fixed','closed')),
  created_at timestamptz not null default now()
);
create index feedback_workspace_idx on public.feedback(workspace_id);
create index feedback_status_idx on public.feedback(status);
alter table public.feedback enable row level security;

create policy feedback_insert on public.feedback for insert
  with check (
    workspace_id in (select public.current_workspaces())
    and user_id = auth.uid()
  );
create policy feedback_select on public.feedback for select
  using (public.is_platform_admin() or user_id = auth.uid());
create policy feedback_update on public.feedback for update
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

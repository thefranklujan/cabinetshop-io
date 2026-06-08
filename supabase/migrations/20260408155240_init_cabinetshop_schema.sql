-- Migration: init_cabinetshop_schema
-- Version: 20260408155240
-- Captured verbatim from the live CabinetShop.io Supabase project (ref ibarpcoigmpnicljeyzu)
-- on 2026-06-08 via `supabase_migrations.schema_migrations`. Do not hand-edit; treat as the
-- applied baseline. Tenant isolation is enforced here via current_workspaces() + per-table RLS.

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'starter',
  created_at timestamptz default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  invited_email text,
  joined_at timestamptz default now(),
  primary key (workspace_id, user_id)
);
create index on workspace_members(user_id);

create or replace function current_workspaces() returns setof uuid
language sql security definer stable as $$
  select workspace_id from workspace_members where user_id = auth.uid();
$$;

create table clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  type text not null default 'Homeowner',
  email text, phone text, address text, notes text,
  created_at timestamptz default now()
);
create index on clients(workspace_id);

create table projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  job_number text,
  name text not null,
  client_id uuid references clients(id) on delete set null,
  stage text not null default 'Quote',
  contract_total numeric(12,2) default 0,
  paid numeric(12,2) default 0,
  start_date date, due_date date,
  description text, wood_species text, finish text, hardware text,
  square_feet int, cabinet_count int,
  priority text default 'Normal',
  created_at timestamptz default now()
);
create index on projects(workspace_id);
create index on projects(client_id);

create table materials (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  sku text, name text not null,
  category text not null default 'Misc',
  unit text default 'ea',
  cost_per_unit numeric(12,2) default 0,
  in_stock numeric(12,2) default 0,
  reorder_at numeric(12,2) default 0,
  supplier text,
  created_at timestamptz default now()
);
create index on materials(workspace_id);

create table cut_list_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  part text not null, material text,
  qty int default 1,
  length numeric(8,2), width numeric(8,2), thickness numeric(8,3),
  done boolean default false,
  created_at timestamptz default now()
);
create index on cut_list_items(workspace_id);
create index on cut_list_items(project_id);

create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  po_number text, supplier text not null,
  project_id uuid references projects(id) on delete set null,
  status text not null default 'Draft',
  total numeric(12,2) default 0,
  items jsonb default '[]'::jsonb,
  expected_date date,
  created_at timestamptz default now()
);
create index on purchase_orders(workspace_id);

create table time_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  worker_name text not null,
  project_id uuid references projects(id) on delete set null,
  stage text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  hours numeric(6,2)
);
create index on time_entries(workspace_id);

create table schedule_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  type text not null, date date not null, notes text
);
create index on schedule_events(workspace_id);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  invoice_number text,
  project_id uuid references projects(id) on delete set null,
  amount numeric(12,2) default 0,
  status text not null default 'Draft',
  due_date date, issued_at date,
  created_at timestamptz default now()
);
create index on invoices(workspace_id);

alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table materials enable row level security;
alter table cut_list_items enable row level security;
alter table purchase_orders enable row level security;
alter table time_entries enable row level security;
alter table schedule_events enable row level security;
alter table invoices enable row level security;

create policy ws_select on workspaces for select using (id in (select current_workspaces()));
create policy ws_insert on workspaces for insert with check (owner_id = auth.uid());
create policy ws_update on workspaces for update using (owner_id = auth.uid());
create policy ws_delete on workspaces for delete using (owner_id = auth.uid());

create policy wm_select on workspace_members for select using (workspace_id in (select current_workspaces()));
create policy wm_insert on workspace_members for insert with check (
  user_id = auth.uid() or workspace_id in (select id from workspaces where owner_id = auth.uid())
);
create policy wm_delete on workspace_members for delete using (
  workspace_id in (select id from workspaces where owner_id = auth.uid())
);

do $$
declare t text;
begin
  for t in select unnest(array['clients','projects','materials','cut_list_items','purchase_orders','time_entries','schedule_events','invoices'])
  loop
    execute format('create policy %I_select on %I for select using (workspace_id in (select current_workspaces()))', t, t);
    execute format('create policy %I_insert on %I for insert with check (workspace_id in (select current_workspaces()))', t, t);
    execute format('create policy %I_update on %I for update using (workspace_id in (select current_workspaces()))', t, t);
    execute format('create policy %I_delete on %I for delete using (workspace_id in (select current_workspaces()))', t, t);
  end loop;
end$$;

create or replace function add_owner_as_member() returns trigger
language plpgsql security definer as $$
begin
  insert into workspace_members(workspace_id, user_id, role) values (new.id, new.owner_id, 'owner');
  return new;
end$$;

create trigger trg_add_owner_member after insert on workspaces
for each row execute function add_owner_as_member();

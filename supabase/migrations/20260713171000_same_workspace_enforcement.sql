-- Stabilization pass: same-workspace integrity for every child reference.
-- RLS pins each ROW to a workspace the writer belongs to, but nothing stopped a
-- row from referencing a parent in a DIFFERENT workspace (e.g. a task in shop A
-- pointing at shop B's project — also a UUID-existence oracle via FK errors).
-- One generic BEFORE trigger closes this for old and new tables alike.

create or replace function public.enforce_same_workspace() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  col text := tg_argv[0];        -- referencing column on the child row
  parent_tbl text := tg_argv[1]; -- parent table (must have id + workspace_id)
  child_ref uuid;
  parent_ws uuid;
begin
  execute format('select ($1).%I', col) into child_ref using new;
  if child_ref is null then
    return new;
  end if;
  execute format('select workspace_id from public.%I where id = $1', parent_tbl)
    into parent_ws using child_ref;
  -- Missing parent: let the FK produce its own error.
  if parent_ws is not null and parent_ws is distinct from new.workspace_id then
    raise exception '% must reference a % in the same workspace', tg_table_name, parent_tbl;
  end if;
  return new;
end;
$$;

-- Legacy relationships
create trigger same_ws_projects_client before insert or update of client_id on public.projects
  for each row execute function public.enforce_same_workspace('client_id', 'clients');
create trigger same_ws_cutlist_project before insert or update of project_id on public.cut_list_items
  for each row execute function public.enforce_same_workspace('project_id', 'projects');
create trigger same_ws_po_project before insert or update of project_id on public.purchase_orders
  for each row execute function public.enforce_same_workspace('project_id', 'projects');
create trigger same_ws_time_project before insert or update of project_id on public.time_entries
  for each row execute function public.enforce_same_workspace('project_id', 'projects');
create trigger same_ws_schedule_project before insert or update of project_id on public.schedule_events
  for each row execute function public.enforce_same_workspace('project_id', 'projects');
create trigger same_ws_invoice_project before insert or update of project_id on public.invoices
  for each row execute function public.enforce_same_workspace('project_id', 'projects');
create trigger same_ws_gate_project before insert or update of project_id on public.gates
  for each row execute function public.enforce_same_workspace('project_id', 'projects');
create trigger same_ws_checklist_project before insert or update of project_id on public.checklist_items
  for each row execute function public.enforce_same_workspace('project_id', 'projects');
create trigger same_ws_activity_project before insert or update of project_id on public.activity
  for each row execute function public.enforce_same_workspace('project_id', 'projects');

-- July 13 relationships (tasks/messages/templates land in the preceding migrations)
create trigger same_ws_task_project before insert or update of project_id on public.tasks
  for each row execute function public.enforce_same_workspace('project_id', 'projects');
create trigger same_ws_message_project before insert or update of project_id on public.messages
  for each row execute function public.enforce_same_workspace('project_id', 'projects');
create trigger same_ws_message_gate before insert or update of gate_id on public.messages
  for each row execute function public.enforce_same_workspace('gate_id', 'gates');
create trigger same_ws_message_task before insert or update of task_id on public.messages
  for each row execute function public.enforce_same_workspace('task_id', 'tasks');
create trigger same_ws_template_item before insert or update of template_id on public.template_items
  for each row execute function public.enforce_same_workspace('template_id', 'job_templates');
create trigger same_ws_project_template before insert or update of template_id on public.projects
  for each row execute function public.enforce_same_workspace('template_id', 'job_templates');

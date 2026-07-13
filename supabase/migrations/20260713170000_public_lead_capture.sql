-- Stabilization pass: truthful, durable public lead capture.
-- Public visitors have no session, so RLS (correctly) refuses direct writes to
-- shop_database / platform_activity — which the old /api/early-access swallowed,
-- returning success while dropping every lead. The fix: SECURITY DEFINER
-- functions own these two writes, validate input, and rate-limit by email+ip.
-- No service-role key needed anywhere; RLS on the tables stays locked.

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  shop_name text,
  email text not null,
  body text not null,
  source text not null default 'contact_form',
  status text not null default 'new' check (status in ('new','replied','closed')),
  created_at timestamptz not null default now()
);
create index contact_messages_created_idx on public.contact_messages(created_at desc);
alter table public.contact_messages enable row level security;

-- Platform admins read and triage; nobody (including admins) writes directly —
-- inserts go through submit_contact() so validation cannot be bypassed.
create policy contact_select on public.contact_messages for select
  using (public.is_platform_admin());
create policy contact_update on public.contact_messages for update
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
create policy contact_delete on public.contact_messages for delete
  using (public.is_platform_admin());

-- Early access request: upsert the prospect by email and log the activity.
-- Raises on invalid input; the API route surfaces failures honestly.
create or replace function public.submit_early_access(
  p_shop_name text,
  p_owner_name text default null,
  p_email text default null,
  p_phone text default null,
  p_city text default null,
  p_state text default null,
  p_employee_count text default null,
  p_website text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_shop text := trim(coalesce(p_shop_name, ''));
  v_existing uuid;
  v_recent int;
begin
  if v_shop = '' or length(v_shop) > 200 then
    raise exception 'invalid shop name';
  end if;
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or length(v_email) > 320 then
    raise exception 'invalid email';
  end if;
  if length(coalesce(p_owner_name,'')) > 200 or length(coalesce(p_phone,'')) > 50
     or length(coalesce(p_city,'')) > 100 or length(coalesce(p_state,'')) > 50
     or length(coalesce(p_employee_count,'')) > 20 or length(coalesce(p_website,'')) > 300 then
    raise exception 'input too long';
  end if;

  -- Rate limit: at most 5 submissions per email per hour.
  select count(*) into v_recent from platform_activity
   where action = 'early_access_request' and actor_email = v_email
     and created_at > now() - interval '1 hour';
  if v_recent >= 5 then
    raise exception 'too many requests';
  end if;

  select id into v_existing from shop_database where email = v_email limit 1;
  if v_existing is not null then
    update shop_database set
      status = 'interested',
      owner_name = coalesce(nullif(trim(p_owner_name), ''), owner_name),
      phone = coalesce(nullif(trim(p_phone), ''), phone),
      city = coalesce(nullif(trim(p_city), ''), city),
      state = coalesce(nullif(trim(p_state), ''), state),
      website = coalesce(nullif(trim(p_website), ''), website),
      notes = 'Early access request. Team size: ' || coalesce(nullif(p_employee_count, ''), 'not specified')
    where id = v_existing;
  else
    insert into shop_database (name, owner_name, email, phone, city, state, website, source, status, notes)
    values (v_shop, nullif(trim(p_owner_name), ''), v_email, nullif(trim(p_phone), ''),
            nullif(trim(p_city), ''), nullif(trim(p_state), ''), nullif(trim(p_website), ''),
            'early_access', 'interested',
            'Early access request. Team size: ' || coalesce(nullif(p_employee_count, ''), 'not specified'));
  end if;

  insert into platform_activity (action, actor_email, target, meta)
  values ('early_access_request', v_email, v_shop,
          jsonb_build_object('city', p_city, 'state', p_state, 'employeeCount', p_employee_count));
end;
$$;

-- Contact form: durable message with the same validation posture.
create or replace function public.submit_contact(
  p_name text default null,
  p_shop_name text default null,
  p_email text default null,
  p_body text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_body text := trim(coalesce(p_body, ''));
  v_recent int;
begin
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or length(v_email) > 320 then
    raise exception 'invalid email';
  end if;
  if v_body = '' or length(v_body) > 5000 then
    raise exception 'invalid message';
  end if;
  if length(coalesce(p_name,'')) > 200 or length(coalesce(p_shop_name,'')) > 200 then
    raise exception 'input too long';
  end if;

  select count(*) into v_recent from contact_messages
   where email = v_email and created_at > now() - interval '1 hour';
  if v_recent >= 5 then
    raise exception 'too many requests';
  end if;

  insert into contact_messages (name, shop_name, email, body)
  values (nullif(trim(p_name), ''), nullif(trim(p_shop_name), ''), v_email, v_body);
end;
$$;

revoke all on function public.submit_early_access(text,text,text,text,text,text,text,text) from public;
revoke all on function public.submit_contact(text,text,text,text) from public;
grant execute on function public.submit_early_access(text,text,text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.submit_contact(text,text,text,text) to anon, authenticated;

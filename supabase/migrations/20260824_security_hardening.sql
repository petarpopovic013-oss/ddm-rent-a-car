create table if not exists public.rc_rate_limits (
  scope text not null,
  key_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (scope, key_hash),
  constraint rc_rate_limits_scope_check check (char_length(scope) between 1 and 80),
  constraint rc_rate_limits_key_hash_check check (char_length(key_hash) = 64),
  constraint rc_rate_limits_request_count_check check (request_count between 1 and 1000000)
);

create index if not exists rc_rate_limits_updated_at_idx
  on public.rc_rate_limits (updated_at);

create index if not exists rc_reservations_active_vehicle_period_idx
  on public.rc_reservations (vehicle_id, pickup_date, return_date)
  where status = 'accepted' and withdrawn_at is null and vehicle_id is not null;

create index if not exists rc_reservations_status_created_at_idx
  on public.rc_reservations (status, created_at desc);

create index if not exists rc_vehicles_active_sort_idx
  on public.rc_vehicles (sort_order, make, model)
  where status = 'active';

create or replace function public.rc_consume_rate_limit(
  p_scope text,
  p_key_hash text,
  p_window_seconds integer,
  p_max_attempts integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_allowed boolean;
begin
  if char_length(p_scope) not between 1 and 80
    or char_length(p_key_hash) <> 64
    or p_window_seconds not between 1 and 86400
    or p_max_attempts not between 1 and 10000
  then
    raise exception 'Invalid rate limit parameters' using errcode = '22023';
  end if;

  insert into public.rc_rate_limits as rate_limit (
    scope,
    key_hash,
    window_started_at,
    request_count,
    updated_at
  ) values (
    p_scope,
    p_key_hash,
    v_now,
    1,
    v_now
  )
  on conflict (scope, key_hash) do update
  set
    request_count = case
      when rate_limit.window_started_at <= v_now - make_interval(secs => p_window_seconds)
        then 1
      else rate_limit.request_count + 1
    end,
    window_started_at = case
      when rate_limit.window_started_at <= v_now - make_interval(secs => p_window_seconds)
        then v_now
      else rate_limit.window_started_at
    end,
    updated_at = v_now
  returning request_count <= p_max_attempts into v_allowed;

  if random() < 0.01 then
    delete from public.rc_rate_limits
    where updated_at < v_now - interval '7 days';
  end if;

  return v_allowed;
end;
$$;

alter table public.rc_vehicles enable row level security;
alter table public.rc_vehicle_pricing_tiers enable row level security;
alter table public.rc_vehicle_images enable row level security;
alter table public.rc_reservations enable row level security;
alter table public.rc_rate_limits enable row level security;

revoke all privileges on table public.rc_vehicles from public, anon, authenticated;
revoke all privileges on table public.rc_vehicle_pricing_tiers from public, anon, authenticated;
revoke all privileges on table public.rc_vehicle_images from public, anon, authenticated;
revoke all privileges on table public.rc_reservations from public, anon, authenticated;
revoke all privileges on table public.rc_rate_limits from public, anon, authenticated;

grant select, insert, update, delete on table public.rc_vehicles to service_role;
grant select, insert, update, delete on table public.rc_vehicle_pricing_tiers to service_role;
grant select, insert, update, delete on table public.rc_vehicle_images to service_role;
grant select, insert, update, delete on table public.rc_reservations to service_role;
grant select, insert, update, delete on table public.rc_rate_limits to service_role;

revoke execute on function public.rc_consume_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.rc_consume_rate_limit(text, text, integer, integer)
  to service_role;

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

do $$
declare
  protected_table regclass;
begin
  foreach protected_table in array array[
    'public.rc_vehicles'::regclass,
    'public.rc_vehicle_pricing_tiers'::regclass,
    'public.rc_vehicle_images'::regclass,
    'public.rc_reservations'::regclass,
    'public.rc_rate_limits'::regclass
  ] loop
    if not (select relrowsecurity from pg_class where oid = protected_table) then
      raise exception 'RLS is not enabled for %', protected_table;
    end if;

    if has_table_privilege('anon', protected_table, 'select')
      or has_table_privilege('anon', protected_table, 'insert')
      or has_table_privilege('anon', protected_table, 'update')
      or has_table_privilege('anon', protected_table, 'delete')
      or has_table_privilege('authenticated', protected_table, 'select')
      or has_table_privilege('authenticated', protected_table, 'insert')
      or has_table_privilege('authenticated', protected_table, 'update')
      or has_table_privilege('authenticated', protected_table, 'delete')
    then
      raise exception 'Public Data API privileges remain on %', protected_table;
    end if;
  end loop;

  if not public.rc_consume_rate_limit(
    'migration-test',
    repeat('0', 64),
    60,
    1
  ) then
    raise exception 'Rate limit self-test failed';
  end if;

  delete from public.rc_rate_limits
  where scope = 'migration-test' and key_hash = repeat('0', 64);
end;
$$;

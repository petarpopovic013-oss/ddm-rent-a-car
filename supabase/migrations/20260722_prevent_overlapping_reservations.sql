create extension if not exists btree_gist;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rc_reservations_no_accepted_vehicle_overlap'
      and conrelid = 'public.rc_reservations'::regclass
  ) then
    alter table public.rc_reservations
      add constraint rc_reservations_no_accepted_vehicle_overlap
      exclude using gist (
        vehicle_id with =,
        daterange(pickup_date, return_date, '[]') with &&
      )
      where (
        status = 'accepted'
        and withdrawn_at is null
        and vehicle_id is not null
      );
  end if;
end
$$;

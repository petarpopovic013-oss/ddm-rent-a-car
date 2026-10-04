update public.rc_vehicles
set body_type = 'minivan'::public.rc_vehicle_body_type
where slug = 'citroen-xsara-picasso';

do $$
begin
  if not exists (
    select 1
    from public.rc_vehicles
    where slug = 'citroen-xsara-picasso'
      and body_type = 'minivan'::public.rc_vehicle_body_type
  ) then
    raise exception 'Citroen Xsara Picasso was not updated to minivan';
  end if;
end $$;

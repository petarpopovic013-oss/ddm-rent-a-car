update public.rc_vehicle_pricing_tiers
set max_days = 25
where min_days = 11
  and max_days = 29
  and pricing_mode = 'daily';

-- Fixed rows stay stored as a single 30-day marker to satisfy the existing
-- database constraint. The application applies that fixed monthly price to
-- every rental period from 26 through 31 days.

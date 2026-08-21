CREATE TYPE public.rc_vehicle_type AS ENUM ('car', 'motorcycle');

ALTER TABLE public.rc_vehicles
  ADD COLUMN type public.rc_vehicle_type NOT NULL DEFAULT 'car',
  ADD COLUMN power_kw smallint,
  ADD COLUMN license_category text,
  ADD COLUMN weight_kg smallint,
  ADD COLUMN seat_height_mm smallint;

-- Drop NOT NULL from car specific columns
ALTER TABLE public.rc_vehicles
  ALTER COLUMN body_type DROP NOT NULL,
  ALTER COLUMN air_conditioning DROP NOT NULL,
  ALTER COLUMN cruise_control DROP NOT NULL;

-- Add a CHECK constraint to ensure required fields for each type
ALTER TABLE public.rc_vehicles
  ADD CONSTRAINT rc_vehicles_type_data_check
  CHECK (
    (type = 'car' AND body_type IS NOT NULL AND air_conditioning IS NOT NULL AND cruise_control IS NOT NULL)
    OR
    (type = 'motorcycle' AND power_kw IS NOT NULL AND license_category IS NOT NULL)
  );

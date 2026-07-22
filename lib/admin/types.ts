export type VehicleStatus = "active" | "hidden" | "service" | "archived";
export type ReservationStatus = "pending" | "accepted" | "rejected";
export type PricingMode = "daily" | "fixed";
export type BodyType =
  | "hatchback"
  | "sedan"
  | "wagon"
  | "suv"
  | "van"
  | "coupe"
  | "convertible"
  | "pickup"
  | "other";

export type PricingTier = {
  id: string;
  vehicle_id: string;
  min_days: number;
  max_days: number | null;
  price_rsd: number;
  pricing_mode: PricingMode;
};

export type VehicleImage = {
  id: string;
  vehicle_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
};

export type Vehicle = {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number | null;
  category: string;
  description: string | null;
  engine: string;
  fuel_type: "petrol" | "diesel" | "hybrid" | "electric" | "lpg";
  transmission: "manual" | "automatic";
  body_type: BodyType;
  seats: number;
  doors: number | null;
  air_conditioning: boolean;
  cruise_control: boolean;
  primary_image_path: string | null;
  image_position: string | null;
  status: VehicleStatus;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  rc_vehicle_pricing_tiers?: PricingTier[];
  rc_vehicle_images?: VehicleImage[];
};

export type Reservation = {
  id: string;
  vehicle_id: string | null;
  requested_vehicle: string | null;
  status: ReservationStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_date: string;
  return_date: string;
  rental_days: number;
  price_snapshot_rsd: number | null;
  pricing_mode_snapshot: PricingMode | null;
  estimated_total_rsd: number | null;
  pickup_location_snapshot: string;
  customer_note: string | null;
  admin_note: string | null;
  withdrawn_at: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
  rc_vehicles?: Pick<Vehicle, "id" | "make" | "model" | "slug"> | null;
};

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  active: "Aktivno",
  hidden: "Sakriveno",
  service: "Servis",
  archived: "Arhivirano",
};

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  pending: "Novi upit",
  accepted: "Prihvaćeno",
  rejected: "Odbijeno",
};

export const bodyTypeLabels: Record<BodyType, string> = {
  hatchback: "Hečbek",
  sedan: "Limuzina",
  wagon: "Karavan",
  suv: "SUV",
  van: "Kombi",
  coupe: "Kupe",
  convertible: "Kabriolet",
  pickup: "Pickup",
  other: "Drugo",
};

export const fuelLabels: Record<Vehicle["fuel_type"], string> = {
  petrol: "Benzin",
  diesel: "Dizel",
  hybrid: "Hibrid",
  electric: "Električni",
  lpg: "LPG",
};

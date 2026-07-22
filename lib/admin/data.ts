import "server-only";

import { getSupabaseAdmin, VEHICLE_IMAGE_BUCKET } from "@/lib/supabase/admin";
import type { PricingTier, Reservation, Vehicle } from "@/lib/admin/types";

export type VehicleAvailabilityPeriod = {
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
};

export function unavailablePeriodsForVehicle(
  periods: VehicleAvailabilityPeriod[],
  vehicleId: string,
) {
  return periods
    .filter((period) => period.vehicle_id === vehicleId)
    .map((period) => ({
      pickupDate: period.pickup_date,
      returnDate: period.return_date,
    }));
}

function unwrap<T>(data: T | null, error: { message: string } | null, fallback: T) {
  if (error) throw new Error(error.message);
  return data ?? fallback;
}

export function vehicleImageUrl(path: string | null | undefined) {
  if (!path) return null;
  return getSupabaseAdmin().storage.from(VEHICLE_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function getVehicles() {
  const response = await getSupabaseAdmin()
    .from("rc_vehicles")
    .select("*, rc_vehicle_pricing_tiers(*), rc_vehicle_images(*)")
    .order("sort_order")
    .order("make")
    .order("model");
  return unwrap(response.data as Vehicle[] | null, response.error, []);
}

export async function getPublicVehicles() {
  const response = await getSupabaseAdmin()
    .from("rc_vehicles")
    .select("*, rc_vehicle_pricing_tiers(*)")
    .eq("status", "active")
    .order("sort_order")
    .order("make")
    .order("model");
  return unwrap(response.data as Vehicle[] | null, response.error, []);
}

export async function getAcceptedReservationPeriods() {
  const response = await getSupabaseAdmin()
    .from("rc_reservations")
    .select("vehicle_id, pickup_date, return_date")
    .eq("status", "accepted")
    .is("withdrawn_at", null)
    .not("vehicle_id", "is", null)
    .order("pickup_date");
  return unwrap(
    response.data as VehicleAvailabilityPeriod[] | null,
    response.error,
    [],
  );
}

export async function ensureVehicleAvailable(
  vehicleId: string,
  pickupDate: string,
  returnDate: string,
  excludeReservationId?: string,
) {
  let query = getSupabaseAdmin()
    .from("rc_reservations")
    .select("id")
    .eq("vehicle_id", vehicleId)
    .eq("status", "accepted")
    .is("withdrawn_at", null)
    .lte("pickup_date", returnDate)
    .gte("return_date", pickupDate)
    .limit(1);

  if (excludeReservationId) query = query.neq("id", excludeReservationId);
  const response = await query.maybeSingle();
  if (response.error) throw new Error(response.error.message);
  if (response.data) {
    throw new Error("Vozilo je već rezervisano u izabranom terminu.");
  }
}

export async function getFeaturedPublicVehicles() {
  const response = await getSupabaseAdmin()
    .from("rc_vehicles")
    .select("*, rc_vehicle_pricing_tiers(*)")
    .eq("status", "active")
    .eq("featured", true)
    .order("sort_order")
    .order("make")
    .order("model");
  return unwrap(response.data as Vehicle[] | null, response.error, []);
}

export async function getPublicVehicleBySlug(slug: string) {
  const response = await getSupabaseAdmin()
    .from("rc_vehicles")
    .select("*, rc_vehicle_pricing_tiers(*), rc_vehicle_images(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  return unwrap(response.data as Vehicle | null, response.error, null as Vehicle | null);
}

export async function getVehicle(id: string) {
  const response = await getSupabaseAdmin()
    .from("rc_vehicles")
    .select("*, rc_vehicle_pricing_tiers(*), rc_vehicle_images(*)")
    .eq("id", id)
    .maybeSingle();
  return unwrap(response.data as Vehicle | null, response.error, null as Vehicle | null);
}

export async function getReservations(filters?: { status?: string; query?: string }) {
  let request = getSupabaseAdmin()
    .from("rc_reservations")
    .select("*, rc_vehicles(id, make, model, slug)")
    .order("created_at", { ascending: false });

  if (filters?.status && ["pending", "accepted", "rejected"].includes(filters.status)) {
    request = request.eq("status", filters.status);
  }

  if (filters?.query?.trim()) {
    const safeQuery = filters.query.trim().replace(/[^a-zA-Z0-9À-ž@+._ -]/g, " ");
    request = request.or(
      `customer_name.ilike.%${safeQuery}%,customer_email.ilike.%${safeQuery}%,customer_phone.ilike.%${safeQuery}%`,
    );
  }

  const response = await request;
  return unwrap(response.data as Reservation[] | null, response.error, []);
}

export async function getReservation(id: string) {
  const response = await getSupabaseAdmin()
    .from("rc_reservations")
    .select("*, rc_vehicles(id, make, model, slug)")
    .eq("id", id)
    .maybeSingle();
  return unwrap(response.data as Reservation | null, response.error, null as Reservation | null);
}

export async function getPricingForPeriod(vehicleId: string, pickupDate: string, returnDate: string) {
  const start = new Date(`${pickupDate}T12:00:00Z`);
  const end = new Date(`${returnDate}T12:00:00Z`);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (!Number.isInteger(days) || days < 1 || days > 30) {
    throw new Error("Period najma mora biti između 1 i 30 dana.");
  }

  const response = await getSupabaseAdmin()
    .from("rc_vehicle_pricing_tiers")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .lte("min_days", days)
    .or(`max_days.gte.${days},max_days.is.null`)
    .limit(1)
    .maybeSingle();
  const tier = unwrap(response.data as PricingTier | null, response.error, null as PricingTier | null);
  if (!tier) throw new Error("Vozilo nema cenu za izabrani period.");
  return { tier, days };
}

export async function getDashboardData() {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const [vehicles, active, pending, acceptedUpcoming, acceptedRows, recent] = await Promise.all([
    supabase.from("rc_vehicles").select("id", { count: "exact", head: true }),
    supabase.from("rc_vehicles").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("rc_reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .is("withdrawn_at", null),
    supabase
      .from("rc_reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted")
      .gte("return_date", today),
    supabase
      .from("rc_reservations")
      .select("estimated_total_rsd")
      .eq("status", "accepted"),
    supabase
      .from("rc_reservations")
      .select("*, rc_vehicles(id, make, model, slug)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  for (const result of [vehicles, active, pending, acceptedUpcoming, acceptedRows, recent]) {
    if (result.error) throw new Error(result.error.message);
  }

  const revenue = (acceptedRows.data ?? []).reduce(
    (sum, row) => sum + (row.estimated_total_rsd ?? 0),
    0,
  );

  return {
    totalVehicles: vehicles.count ?? 0,
    activeVehicles: active.count ?? 0,
    pendingReservations: pending.count ?? 0,
    upcomingReservations: acceptedUpcoming.count ?? 0,
    acceptedRevenue: revenue,
    recentReservations: (recent.data ?? []) as Reservation[],
  };
}

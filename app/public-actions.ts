"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ensureVehicleAvailable, getPricingForPeriod } from "@/lib/admin/data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type InquiryState = {
  status: "idle" | "success" | "error";
  message: string;
};

const inquirySchema = z.object({
  vehicle_slug: z.string().trim().min(1).max(100),
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().toLowerCase().email().max(254),
  customer_phone: z.string().trim().min(6).max(30),
  pickup_date: z.iso.date(),
  return_date: z.iso.date(),
  customer_note: z.string().trim().max(2000),
  privacy: z.literal("on"),
  website: z.string().max(0),
});

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function submitInquiryAction(
  _previousState: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  if (formValue(formData, "website")) {
    return { status: "success", message: "Upit je poslat." };
  }

  const parsed = inquirySchema.safeParse({
    vehicle_slug: formValue(formData, "vehicle_slug"),
    customer_name: formValue(formData, "customer_name"),
    customer_email: formValue(formData, "customer_email"),
    customer_phone: formValue(formData, "customer_phone"),
    pickup_date: formValue(formData, "pickup_date"),
    return_date: formValue(formData, "return_date"),
    customer_note: formValue(formData, "customer_note"),
    privacy: formValue(formData, "privacy"),
    website: formValue(formData, "website"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Proverite obavezna polja i pokušajte ponovo." };
  }

  const data = parsed.data;
  const start = new Date(`${data.pickup_date}T12:00:00Z`);
  const end = new Date(`${data.return_date}T12:00:00Z`);
  const rentalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const today = new Date().toISOString().slice(0, 10);
  if (data.pickup_date < today) {
    return { status: "error", message: "Datum preuzimanja ne može biti u prošlosti." };
  }
  if (!Number.isInteger(rentalDays) || rentalDays < 1 || rentalDays > 30) {
    return { status: "error", message: "Period najma mora biti između 1 i 30 dana." };
  }

  try {
    const supabase = getSupabaseAdmin();
    let vehicleId: string | null = null;
    let requestedVehicle = "Drugo vozilo / potrebna preporuka";
    let priceRsd: number | null = null;
    let pricingMode: "daily" | "fixed" | null = null;

    if (data.vehicle_slug !== "other") {
      const vehicle = await supabase
        .from("rc_vehicles")
        .select("id, make, model")
        .eq("slug", data.vehicle_slug)
        .eq("status", "active")
        .maybeSingle();
      if (vehicle.error) throw new Error(vehicle.error.message);
      if (!vehicle.data) {
        return { status: "error", message: "Izabrano vozilo više nije dostupno." };
      }
      const selectedVehicleId = vehicle.data.id;
      vehicleId = selectedVehicleId;
      requestedVehicle = `${vehicle.data.make} ${vehicle.data.model}`;

      try {
        await ensureVehicleAvailable(selectedVehicleId, data.pickup_date, data.return_date);
      } catch {
        return {
          status: "error",
          message: "Vozilo je već rezervisano u izabranom terminu. Izaberite drugi termin ili vozilo.",
        };
      }

      try {
        const { tier } = await getPricingForPeriod(selectedVehicleId, data.pickup_date, data.return_date);
        priceRsd = tier.price_rsd;
        pricingMode = tier.pricing_mode;
      } catch {
        priceRsd = null;
        pricingMode = null;
      }
    }

    const acceptedAt = new Date().toISOString();
    const result = await supabase.from("rc_reservations").insert({
      vehicle_id: vehicleId,
      requested_vehicle: requestedVehicle,
      status: "pending",
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      pickup_date: data.pickup_date,
      return_date: data.return_date,
      price_snapshot_rsd: priceRsd,
      pricing_mode_snapshot: pricingMode,
      pickup_location_snapshot: "Dr Svetislava Kasapinovića 9, Novi Sad",
      customer_note: data.customer_note || null,
      admin_note: null,
      privacy_accepted_at: acceptedAt,
      terms_accepted_at: acceptedAt,
      management_token_hash: null,
      management_token_expires_at: null,
      withdrawn_at: null,
      decided_at: null,
    });
    if (result.error) throw new Error(result.error.message);

    revalidatePath("/admin");
    revalidatePath("/admin/rezervacije");
    return {
      status: "success",
      message: "Upit je poslat. DDM tim će vam se javiti sa potvrdom dostupnosti i detaljima preuzimanja.",
    };
  } catch {
    return {
      status: "error",
      message: "Upit trenutno nije moguće poslati. Pokušajte ponovo ili nas pozovite.",
    };
  }
}

"use server";

import { compare } from "bcryptjs";
import sharp from "sharp";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSession, deleteAdminSession, requireAdmin } from "@/lib/admin/session";
import { ensureVehicleAvailable, getPricingForPeriod, getReservation, getVehicle } from "@/lib/admin/data";
import { getSupabaseAdmin, VEHICLE_IMAGE_BUCKET } from "@/lib/supabase/admin";

const optionalInteger = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === "" || value == null ? null : Number(value)),
    z.number().int().min(min).max(max).nullable(),
  );

const vehicleSchema = z.object({
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  year: optionalInteger(1990, 2100),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().max(4000).nullable(),
  engine: z.string().trim().min(1).max(60),
  fuel_type: z.enum(["petrol", "diesel", "hybrid", "electric", "lpg"]),
  transmission: z.enum(["manual", "automatic"]),
  body_type: z.enum([
    "hatchback",
    "sedan",
    "wagon",
    "suv",
    "van",
    "coupe",
    "convertible",
    "pickup",
    "other",
  ]),
  seats: z.coerce.number().int().min(1).max(20),
  doors: optionalInteger(1, 10),
  air_conditioning: z.boolean(),
  cruise_control: z.boolean(),
  status: z.enum(["active", "hidden", "service", "archived"]),
  featured: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999),
  price_1_3: z.coerce.number().int().positive(),
  price_4_10: z.coerce.number().int().positive(),
  price_11_29: z.coerce.number().int().positive(),
  price_30: z.coerce.number().int().positive(),
});

const reservationSchema = z.object({
  vehicle_id: z.preprocess(
    (value) => (value === "" || value == null ? null : value),
    z.string().uuid().nullable(),
  ),
  requested_vehicle: z.string().trim().max(120).nullable(),
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().toLowerCase().email().max(254),
  customer_phone: z.string().trim().min(6).max(30),
  pickup_date: z.iso.date(),
  return_date: z.iso.date(),
  status: z.enum(["pending", "accepted", "rejected"]),
  customer_note: z.string().trim().max(4000).nullable(),
  admin_note: z.string().trim().max(4000).nullable(),
}).refine((data) => data.vehicle_id || data.requested_vehicle, {
  message: "Izaberite vozilo ili sačuvajte naziv vozila iz javnog upita.",
});

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function nullableValue(formData: FormData, key: string) {
  const result = value(formData, key).trim();
  return result || null;
}

function errorText(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "Proverite unete podatke.";
  if (error instanceof Error) {
    if (error.message.includes("exclusion") || error.message.includes("conflict")) {
      return "Vozilo već ima prihvaćenu rezervaciju u izabranom terminu.";
    }
    return error.message;
  }
  return "Došlo je do neočekivane greške.";
}

function destination(path: string, type: "success" | "error", message: string) {
  return `${path}?${type}=${encodeURIComponent(message)}`;
}

function parseVehicle(formData: FormData) {
  return vehicleSchema.parse({
    make: value(formData, "make"),
    model: value(formData, "model"),
    year: value(formData, "year"),
    category: value(formData, "category"),
    description: nullableValue(formData, "description"),
    engine: value(formData, "engine"),
    fuel_type: value(formData, "fuel_type"),
    transmission: value(formData, "transmission"),
    body_type: value(formData, "body_type"),
    seats: value(formData, "seats"),
    doors: value(formData, "doors"),
    air_conditioning: formData.get("air_conditioning") === "on",
    cruise_control: formData.get("cruise_control") === "on",
    status: value(formData, "status"),
    featured: formData.get("featured") === "on",
    sort_order: value(formData, "sort_order"),
    price_1_3: value(formData, "price_1_3"),
    price_4_10: value(formData, "price_4_10"),
    price_11_29: value(formData, "price_11_29"),
    price_30: value(formData, "price_30"),
  });
}

function vehicleSlug(make: string, model: string) {
  return `${make}-${model}`
    .toLocaleLowerCase("sr-Latn")
    .replaceAll("đ", "dj")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueVehicleSlug(make: string, model: string, excludeId?: string) {
  const base = vehicleSlug(make, model) || "vozilo";
  let query = getSupabaseAdmin()
    .from("rc_vehicles")
    .select("slug")
    .like("slug", `${base}%`);

  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const existing = new Set((data ?? []).map((vehicle) => vehicle.slug));
  if (!existing.has(base)) return base;

  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function parseReservation(formData: FormData) {
  const decision = value(formData, "decision");
  return reservationSchema.parse({
    vehicle_id: value(formData, "vehicle_id"),
    requested_vehicle: nullableValue(formData, "requested_vehicle"),
    customer_name: value(formData, "customer_name"),
    customer_email: value(formData, "customer_email"),
    customer_phone: value(formData, "customer_phone"),
    pickup_date: value(formData, "pickup_date"),
    return_date: value(formData, "return_date"),
    status: decision || value(formData, "status"),
    customer_note: nullableValue(formData, "customer_note"),
    admin_note: nullableValue(formData, "admin_note"),
  });
}

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const MAX_GALLERY_FILES = 20;

function files(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function validateImageBatch(images: File[], galleryCount: number) {
  if (galleryCount > MAX_GALLERY_FILES) {
    throw new Error(`Možete dodati najviše ${MAX_GALLERY_FILES} galerijskih slika odjednom.`);
  }
  const totalSize = images.reduce((total, image) => total + image.size, 0);
  if (totalSize > MAX_UPLOAD_BYTES) {
    throw new Error("Sve izabrane slike zajedno ne smeju biti veće od 50 MB.");
  }
}

async function uploadVehicleImage(vehicleId: string, file: File) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Slika mora biti JPEG, PNG ili WebP.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Pojedinačna slika ne sme biti veća od 12 MB.");

  let optimized: Buffer;
  try {
    optimized = await sharp(new Uint8Array(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 1440, height: 1080, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 68, effort: 6, smartSubsample: true })
      .toBuffer();
  } catch {
    throw new Error("Jedna od izabranih slika nije ispravna ili nije podržana.");
  }

  const path = `${vehicleId}/${crypto.randomUUID()}.webp`;
  const { error } = await getSupabaseAdmin().storage
    .from(VEHICLE_IMAGE_BUCKET)
    .upload(path, optimized, {
      contentType: "image/webp",
      upsert: false,
    });
  if (error) throw new Error(error.message);
  return path;
}

async function uploadVehicleImages(vehicleId: string, images: File[]) {
  const paths: string[] = [];
  try {
    for (const image of images) paths.push(await uploadVehicleImage(vehicleId, image));
    return paths;
  } catch (error) {
    if (paths.length) {
      await getSupabaseAdmin().storage.from(VEHICLE_IMAGE_BUCKET).remove(paths);
    }
    throw error;
  }
}

function vehicleRecord(
  data: z.infer<typeof vehicleSchema>,
  primaryImagePath: string | null,
  slug: string,
) {
  return {
    slug,
    make: data.make,
    model: data.model,
    year: data.year,
    category: data.category,
    description: data.description,
    engine: data.engine,
    fuel_type: data.fuel_type,
    transmission: data.transmission,
    body_type: data.body_type,
    seats: data.seats,
    doors: data.doors,
    air_conditioning: data.air_conditioning,
    cruise_control: data.cruise_control,
    primary_image_path: primaryImagePath,
    status: data.status,
    featured: data.featured,
    sort_order: data.sort_order,
  };
}

function pricingRecords(vehicleId: string, data: z.infer<typeof vehicleSchema>) {
  return [
    { vehicle_id: vehicleId, min_days: 1, max_days: 3, price_rsd: data.price_1_3, pricing_mode: "daily" },
    { vehicle_id: vehicleId, min_days: 4, max_days: 10, price_rsd: data.price_4_10, pricing_mode: "daily" },
    { vehicle_id: vehicleId, min_days: 11, max_days: 29, price_rsd: data.price_11_29, pricing_mode: "daily" },
    { vehicle_id: vehicleId, min_days: 30, max_days: 30, price_rsd: data.price_30, pricing_mode: "fixed" },
  ];
}

export async function loginAction(formData: FormData) {
  const password = value(formData, "password");
  const hash = process.env.ADMIN_PASSWORD_HASH;
  let next = "/admin/login";

  try {
    if (!hash) throw new Error("ADMIN_PASSWORD_HASH nije podešen.");
    if (!(await compare(password, hash))) throw new Error("Pogrešna administratorska šifra.");
    await createAdminSession();
    next = "/admin";
  } catch (error) {
    next = destination("/admin/login", "error", errorText(error));
  }

  redirect(next);
}

export async function logoutAction() {
  await deleteAdminSession();
  redirect("/admin/login");
}

export async function createVehicleAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const uploadedPaths: string[] = [];
  let next = "/admin/vozila";

  try {
    const data = parseVehicle(formData);
    const slug = await uniqueVehicleSlug(data.make, data.model);
    const primaryImages = files(formData, "image");
    const galleryImages = files(formData, "gallery_images");
    if (!primaryImages[0]) throw new Error("Glavna fotografija je obavezna.");
    validateImageBatch([...primaryImages, ...galleryImages], galleryImages.length);
    const uploadedPath = await uploadVehicleImage(id, primaryImages[0]);
    uploadedPaths.push(uploadedPath);
    const galleryPaths = await uploadVehicleImages(id, galleryImages);
    uploadedPaths.push(...galleryPaths);

    const vehicle = await supabase
      .from("rc_vehicles")
      .insert({ id, ...vehicleRecord(data, uploadedPath, slug) });
    if (vehicle.error) throw new Error(vehicle.error.message);

    const prices = await supabase.from("rc_vehicle_pricing_tiers").insert(pricingRecords(id, data));
    if (prices.error) {
      await supabase.from("rc_vehicles").delete().eq("id", id);
      throw new Error(prices.error.message);
    }

    if (galleryPaths.length) {
      const gallery = await supabase.from("rc_vehicle_images").insert(
        galleryPaths.map((storagePath, index) => ({
          vehicle_id: id,
          storage_path: storagePath,
          sort_order: index,
        })),
      );
      if (gallery.error) {
        await supabase.from("rc_vehicles").delete().eq("id", id);
        throw new Error(gallery.error.message);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/vozila");
    revalidatePath("/");
    revalidatePath("/vozila");
    next = destination(`/admin/vozila/${id}`, "success", "Vozilo je uspešno dodato.");
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from(VEHICLE_IMAGE_BUCKET).remove(uploadedPaths);
    }
    next = destination("/admin/vozila/novo", "error", errorText(error));
  }

  redirect(next);
}

export async function updateVehicleAction(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  let next = `/admin/vozila/${id}`;
  let newImagePath: string | null = null;
  let newGalleryPaths: string[] = [];

  try {
    const current = await getVehicle(id);
    if (!current) throw new Error("Vozilo nije pronađeno.");
    const data = parseVehicle(formData);
    const slug = await uniqueVehicleSlug(data.make, data.model, id);
    const primaryImages = files(formData, "image");
    const galleryImages = files(formData, "gallery_images");
    validateImageBatch([...primaryImages, ...galleryImages], galleryImages.length);
    if (primaryImages[0]) newImagePath = await uploadVehicleImage(id, primaryImages[0]);
    newGalleryPaths = await uploadVehicleImages(id, galleryImages);
    const primaryImagePath = newImagePath ?? current.primary_image_path;
    if (!primaryImagePath) throw new Error("Glavna fotografija je obavezna.");

    const prices = await supabase
      .from("rc_vehicle_pricing_tiers")
      .upsert(pricingRecords(id, data), { onConflict: "vehicle_id,min_days" });
    if (prices.error) throw new Error(prices.error.message);

    if (newGalleryPaths.length) {
      const highestSortOrder = (current.rc_vehicle_images ?? []).reduce(
        (highest, image) => Math.max(highest, image.sort_order),
        -1,
      );
      const gallery = await supabase.from("rc_vehicle_images").insert(
        newGalleryPaths.map((storagePath, index) => ({
          vehicle_id: id,
          storage_path: storagePath,
          sort_order: highestSortOrder + index + 1,
        })),
      );
      if (gallery.error) throw new Error(gallery.error.message);
    }

    const vehicle = await supabase
      .from("rc_vehicles")
      .update(vehicleRecord(data, primaryImagePath, slug))
      .eq("id", id);
    if (vehicle.error) throw new Error(vehicle.error.message);

    if (newImagePath && current.primary_image_path) {
      await supabase.storage.from(VEHICLE_IMAGE_BUCKET).remove([current.primary_image_path]);
    }

    const removeIds = new Set(formData.getAll("remove_gallery_image").map(String));
    const removedImages = (current.rc_vehicle_images ?? []).filter((image) => removeIds.has(image.id));
    if (removedImages.length) {
      await supabase.from("rc_vehicle_images").delete().in("id", removedImages.map((image) => image.id));
      await supabase.storage
        .from(VEHICLE_IMAGE_BUCKET)
        .remove(removedImages.map((image) => image.storage_path));
    }

    revalidatePath("/admin");
    revalidatePath("/admin/vozila");
    revalidatePath("/");
    revalidatePath("/vozila");
    revalidatePath(`/vozila/${current.slug}`);
    revalidatePath(`/vozila/${slug}`);
    next = destination(next, "success", "Izmene su sačuvane.");
  } catch (error) {
    if (newGalleryPaths.length) {
      await supabase.from("rc_vehicle_images").delete().in("storage_path", newGalleryPaths);
    }
    const failedUploads = [newImagePath, ...newGalleryPaths].filter((path): path is string => Boolean(path));
    if (failedUploads.length) {
      await supabase.storage.from(VEHICLE_IMAGE_BUCKET).remove(failedUploads);
    }
    next = destination(next, "error", errorText(error));
  }

  redirect(next);
}

export async function deleteVehicleAction(id: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  let next = "/admin/vozila";
  try {
    const current = await getVehicle(id);
    if (!current) throw new Error("Vozilo nije pronađeno.");
    const result = await supabase.from("rc_vehicles").delete().eq("id", id);
    if (result.error) throw new Error("Vozilo sa rezervacijama ne može biti obrisano; arhivirajte ga.");
    const imagePaths = [
      current.primary_image_path,
      ...(current.rc_vehicle_images ?? []).map((image) => image.storage_path),
    ].filter((path): path is string => Boolean(path));
    if (imagePaths.length) {
      await supabase.storage.from(VEHICLE_IMAGE_BUCKET).remove(imagePaths);
    }
    revalidatePath("/admin");
    revalidatePath("/admin/vozila");
    revalidatePath("/");
    revalidatePath("/vozila");
    revalidatePath(`/vozila/${current.slug}`);
    next = destination(next, "success", "Vozilo je obrisano.");
  } catch (error) {
    next = destination(next, "error", errorText(error));
  }
  redirect(next);
}

function reservationRecord(
  data: z.infer<typeof reservationSchema>,
  price: { price_rsd: number | null; pricing_mode: "daily" | "fixed" | null },
) {
  return {
    vehicle_id: data.vehicle_id,
    requested_vehicle: data.requested_vehicle,
    status: data.status,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    pickup_date: data.pickup_date,
    return_date: data.return_date,
    price_snapshot_rsd: price.price_rsd,
    pricing_mode_snapshot: price.pricing_mode,
    pickup_location_snapshot: "Dr Svetislava Kasapinovića 9, Novi Sad",
    customer_note: data.customer_note,
    admin_note: data.admin_note,
    decided_at: data.status === "pending" ? null : new Date().toISOString(),
    withdrawn_at: null,
    management_token_hash: null,
  };
}

export async function createReservationAction(formData: FormData) {
  await requireAdmin();
  let next = "/admin/rezervacije/nova";
  try {
    const data = parseReservation(formData);
    if (!data.vehicle_id) throw new Error("Izaberite vozilo.");
    if (data.status === "accepted") {
      await ensureVehicleAvailable(data.vehicle_id, data.pickup_date, data.return_date);
    }
    const { tier } = await getPricingForPeriod(data.vehicle_id, data.pickup_date, data.return_date);
    const result = await getSupabaseAdmin().from("rc_reservations").insert({
      ...reservationRecord(data, tier),
      privacy_accepted_at: new Date().toISOString(),
      terms_accepted_at: new Date().toISOString(),
    });
    if (result.error) throw new Error(result.error.message);
    revalidatePath("/admin");
    revalidatePath("/admin/rezervacije");
    revalidatePath("/");
    revalidatePath("/vozila");
    revalidatePath("/vozila/[slug]", "page");
    next = destination("/admin/rezervacije", "success", "Rezervacija je kreirana.");
  } catch (error) {
    next = destination(next, "error", errorText(error));
  }
  redirect(next);
}

export async function updateReservationAction(id: string, formData: FormData) {
  await requireAdmin();
  let next = `/admin/rezervacije/${id}`;
  try {
    const decision = value(formData, "decision");
    const data = parseReservation(formData);
    const current = await getReservation(id);
    if (!current) throw new Error("Rezervacija nije pronađena.");
    if (data.status === "accepted") {
      if (!data.vehicle_id) throw new Error("Pre prihvatanja upita izaberite konkretno vozilo.");
      await ensureVehicleAvailable(data.vehicle_id, data.pickup_date, data.return_date, id);
    }
    const tier = data.vehicle_id
      ? (await getPricingForPeriod(data.vehicle_id, data.pickup_date, data.return_date)).tier
      : {
          price_rsd: current.price_snapshot_rsd,
          pricing_mode: current.pricing_mode_snapshot,
        };
    const result = await getSupabaseAdmin()
      .from("rc_reservations")
      .update(reservationRecord(data, tier))
      .eq("id", id);
    if (result.error) throw new Error(result.error.message);
    revalidatePath("/admin");
    revalidatePath("/admin/rezervacije");
    revalidatePath("/");
    revalidatePath("/vozila");
    revalidatePath("/vozila/[slug]", "page");
    const message = decision === "accepted"
      ? "Upit je prihvaćen i rezervacija je potvrđena."
      : decision === "rejected"
        ? "Upit je odbijen."
        : "Izmene rezervacije su sačuvane.";
    next = destination(next, "success", message);
  } catch (error) {
    next = destination(next, "error", errorText(error));
  }
  redirect(next);
}

export async function deleteReservationAction(id: string) {
  await requireAdmin();
  let next = "/admin/rezervacije";
  try {
    const result = await getSupabaseAdmin().from("rc_reservations").delete().eq("id", id);
    if (result.error) throw new Error(result.error.message);
    revalidatePath("/admin");
    revalidatePath("/admin/rezervacije");
    revalidatePath("/");
    revalidatePath("/vozila");
    revalidatePath("/vozila/[slug]", "page");
    next = destination(next, "success", "Rezervacija je obrisana.");
  } catch (error) {
    next = destination(next, "error", errorText(error));
  }
  redirect(next);
}

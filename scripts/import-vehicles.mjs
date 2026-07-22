import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SECRET_KEY moraju biti podešeni.");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const imageBucket = "rc-vehicle-images";
const sourceRoot = path.resolve("Slike");

const vehicles = [
  {
    folder: "Fiat Panda",
    primary: "WhatsApp Image 2026-07-15 at 15.34.05.jpeg",
    slug: "fiat-panda",
    make: "Fiat",
    model: "Panda",
    category: "Gradski automobil",
    description: "Mala i pregledna Panda lako se snalazi po gradu i ne traži mnogo prostora za parkiranje. Dobar je izbor za kraće relacije i svakodnevne obaveze.",
    engine: "1.2",
    fuel_type: "diesel",
    body_type: "hatchback",
    seats: 5,
    doors: 5,
    cruise_control: false,
    prices: [2950, 2710, 2360, 60180],
  },
  {
    folder: "Mitsubishi Space",
    primary: "WhatsApp Image 2026-07-15 at 15.34.12.jpeg",
    slug: "mitsubishi-space-star",
    make: "Mitsubishi",
    model: "Space Star",
    category: "Gradski automobil",
    description: "Space Star je lagan i štedljiv gradski auto. Odgovara vožnji po gradu, kraćim putovanjima i vozačima kojima je važna jednostavnost.",
    engine: "1.0",
    fuel_type: "petrol",
    body_type: "hatchback",
    seats: 5,
    doors: 5,
    cruise_control: false,
    prices: [2950, 2710, 2360, 60180],
  },
  {
    folder: "Peugot 207",
    primary: "WhatsApp Image 2026-07-15 at 15.34.02 (1).jpeg",
    slug: "peugeot-207",
    make: "Peugeot",
    model: "207",
    category: "Gradski automobil",
    description: "Peugeot 207 je kompaktan auto za grad i kraće relacije. Male dimenzije čine ga praktičnim za svakodnevnu vožnju.",
    engine: "1.6",
    fuel_type: "diesel",
    body_type: "hatchback",
    seats: 5,
    doors: 5,
    cruise_control: false,
    prices: [3300, 3070, 2710, 70800],
  },
  {
    folder: "Lada Viesta",
    primary: "WhatsApp Image 2026-07-15 at 15.34.04.jpeg",
    slug: "lada-vesta",
    make: "Lada",
    model: "Vesta",
    category: "Kompaktna limuzina",
    description: "Vesta nudi više prostora od klasičnog gradskog automobila, a i dalje je laka za svakodnevnu vožnju. Pogodna je za grad i otvoren put.",
    engine: "1.6",
    fuel_type: "petrol",
    body_type: "sedan",
    seats: 5,
    doors: 4,
    cruise_control: true,
    prices: [3300, 3070, 2710, 70800],
  },
  {
    folder: "Skoda Rapid",
    primary: "WhatsApp Image 2026-07-15 at 15.34.07 (1).jpeg",
    excluded: [
      "WhatsApp Image 2026-07-15 at 15.34.11 (2).jpeg",
      "WhatsApp Image 2026-07-15 at 15.34.11 (3).jpeg",
      "WhatsApp Image 2026-07-15 at 15.34.12 (1).jpeg",
      "WhatsApp Image 2026-07-15 at 15.34.12.jpeg",
    ],
    slug: "skoda-rapid",
    make: "Škoda",
    model: "Rapid",
    category: "Kompaktna limuzina",
    description: "Rapid je prostrana limuzina koja se dobro snalazi u svakodnevnoj vožnji i na dužim relacijama.",
    engine: "1.6",
    fuel_type: "diesel",
    body_type: "sedan",
    seats: 5,
    doors: 5,
    cruise_control: true,
    prices: [3540, 3300, 2950, 74340],
  },
  {
    folder: "Citroen Picasso",
    primary: "WhatsApp Image 2026-07-15 at 15.34.06 (2).jpeg",
    slug: "citroen-xsara-picasso",
    make: "Citroën",
    model: "Xsara Picasso",
    category: "Porodični minivan",
    description: "Xsara Picasso ima visoku i prostranu kabinu sa dosta mesta za putnike. Praktičan je za porodice i duža putovanja.",
    engine: "1.6",
    fuel_type: "diesel",
    body_type: "van",
    seats: 5,
    doors: 5,
    cruise_control: false,
    prices: [3900, 3660, 3300, 84960],
  },
  {
    folder: "VW Golf 6",
    primary: "WhatsApp Image 2026-07-15 at 15.33.57 (2).jpeg",
    slug: "volkswagen-golf-6",
    make: "Volkswagen",
    model: "Golf 6",
    category: "Karavan",
    description: "Golf 6 karavan nudi više prostora od standardnog hečbeka i dobro se snalazi na dužim relacijama. Pogodan je za porodice i putovanja sa više stvari.",
    engine: "1.6",
    fuel_type: "diesel",
    body_type: "wagon",
    seats: 5,
    doors: 5,
    cruise_control: false,
    prices: [3900, 3660, 3300, 84960],
  },
  {
    folder: "VW Golf 7",
    primary: "WhatsApp Image 2026-07-15 at 15.34.11.jpeg",
    slug: "volkswagen-golf-7",
    make: "Volkswagen",
    model: "Golf 7",
    category: "Kompaktna klasa",
    description: "Golf 7 je jednostavan za grad, ali dovoljno udoban i za duže relacije. Dobar je izbor kada vam treba univerzalan automobil.",
    engine: "1.6",
    fuel_type: "diesel",
    body_type: "hatchback",
    seats: 5,
    doors: 5,
    cruise_control: false,
    prices: [4370, 4130, 3900, 102660],
  },
  {
    folder: "Skoda Octavia",
    primary: "WhatsApp Image 2026-07-15 at 15.34.00 (2).jpeg",
    slug: "skoda-octavia-a7",
    make: "Škoda",
    model: "Octavia A7",
    category: "Porodična limuzina",
    description: "Octavia A7 je prostrana i udobna limuzina za svakodnevnu vožnju i duža putovanja. Odgovara porodicama i poslovnim korisnicima.",
    engine: "1.6",
    fuel_type: "diesel",
    body_type: "sedan",
    seats: 5,
    doors: 5,
    cruise_control: true,
    prices: [4370, 4130, 3900, 102660],
  },
  {
    folder: "Opel Astra",
    primary: "WhatsApp Image 2026-07-15 at 15.34.10 (2).jpeg",
    slug: "opel-astra",
    make: "Opel",
    model: "Astra",
    category: "Karavan",
    description: "Astra karavan je praktična za porodice, duža putovanja i situacije kada vam treba više prostora.",
    engine: "1.5",
    fuel_type: "diesel",
    body_type: "wagon",
    seats: 5,
    doors: 5,
    cruise_control: true,
    prices: [4600, 4370, 4130, 109740],
  },
  {
    folder: "Opel Insignia",
    primary: "WhatsApp Image 2026-07-15 at 15.34.08 (2).jpeg",
    slug: "opel-insignia",
    make: "Opel",
    model: "Insignia",
    category: "Poslovna limuzina",
    description: "Insignia je veća i udobnija limuzina, namenjena dužim relacijama i vozačima kojima je važan komfor.",
    engine: "1.6",
    fuel_type: "diesel",
    body_type: "sedan",
    seats: 5,
    doors: 5,
    cruise_control: true,
    prices: [4960, 4720, 4370, 116820],
  },
  {
    folder: "Hyundai H1",
    primary: "WhatsApp Image 2026-07-15 at 15.33.55.jpeg",
    slug: "hyundai-h1",
    make: "Hyundai",
    model: "H1",
    category: "Putnički kombi",
    description: "Hyundai H1 ima osam sedišta i namenjen je većim porodicama, grupama i zajedničkim putovanjima.",
    engine: "2.5",
    fuel_type: "diesel",
    body_type: "van",
    seats: 8,
    doors: 5,
    cruise_control: false,
    prices: [7670, 7080, 6490, 177000],
  },
];

const featuredSlugs = new Set([
  "fiat-panda",
  "skoda-rapid",
  "volkswagen-golf-7",
  "opel-astra",
  "opel-insignia",
  "hyundai-h1",
]);

async function optimizedImage(filePath) {
  return sharp(filePath)
    .rotate()
    .resize({ width: 1440, height: 1080, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 68, effort: 6, smartSubsample: true })
    .toBuffer();
}

function pricingRows(vehicleId, prices) {
  return [
    { vehicle_id: vehicleId, min_days: 1, max_days: 3, price_rsd: prices[0], pricing_mode: "daily" },
    { vehicle_id: vehicleId, min_days: 4, max_days: 10, price_rsd: prices[1], pricing_mode: "daily" },
    { vehicle_id: vehicleId, min_days: 11, max_days: 29, price_rsd: prices[2], pricing_mode: "daily" },
    { vehicle_id: vehicleId, min_days: 30, max_days: 30, price_rsd: prices[3], pricing_mode: "fixed" },
  ];
}

async function upload(pathname, contents) {
  const { error } = await supabase.storage.from(imageBucket).upload(pathname, contents, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw error;
}

async function importVehicle(vehicle, sortOrder) {
  const { data: existing, error: lookupError } = await supabase
    .from("rc_vehicles")
    .select("id, primary_image_path, rc_vehicle_images(storage_path)")
    .eq("slug", vehicle.slug)
    .maybeSingle();
  if (lookupError) throw lookupError;

  const id = existing?.id ?? randomUUID();
  const folderPath = path.join(sourceRoot, vehicle.folder);
  const excluded = new Set(vehicle.excluded ?? []);
  const sourceFiles = (await readdir(folderPath))
    .filter((filename) => /\.jpe?g$/i.test(filename) && !excluded.has(filename))
    .sort((a, b) => a.localeCompare(b, "sr"));

  if (!sourceFiles.includes(vehicle.primary)) {
    throw new Error(`Glavna fotografija nije pronađena: ${vehicle.folder}/${vehicle.primary}`);
  }

  const galleryFiles = sourceFiles.filter((filename) => filename !== vehicle.primary);
  const primaryPath = `${id}/primary.webp`;
  const galleryPaths = galleryFiles.map((_, index) => `${id}/gallery-${String(index + 1).padStart(2, "0")}.webp`);
  const uploadedPaths = [primaryPath, ...galleryPaths];

  try {
    await upload(primaryPath, await optimizedImage(path.join(folderPath, vehicle.primary)));
    for (const [index, filename] of galleryFiles.entries()) {
      await upload(galleryPaths[index], await optimizedImage(path.join(folderPath, filename)));
    }

    const { error: vehicleError } = await supabase.from("rc_vehicles").upsert({
      id,
      slug: vehicle.slug,
      make: vehicle.make,
      model: vehicle.model,
      year: null,
      category: vehicle.category,
      description: vehicle.description,
      engine: vehicle.engine,
      fuel_type: vehicle.fuel_type,
      transmission: "manual",
      body_type: vehicle.body_type,
      seats: vehicle.seats,
      doors: vehicle.doors,
      air_conditioning: true,
      cruise_control: vehicle.cruise_control,
      primary_image_path: primaryPath,
      image_position: "center center",
      status: "active",
      featured: featuredSlugs.has(vehicle.slug),
      sort_order: sortOrder,
    }, { onConflict: "slug" });
    if (vehicleError) throw vehicleError;

    const { error: pricingError } = await supabase
      .from("rc_vehicle_pricing_tiers")
      .upsert(pricingRows(id, vehicle.prices), { onConflict: "vehicle_id,min_days" });
    if (pricingError) throw pricingError;

    const { error: deleteGalleryError } = await supabase
      .from("rc_vehicle_images")
      .delete()
      .eq("vehicle_id", id);
    if (deleteGalleryError) throw deleteGalleryError;

    if (galleryPaths.length) {
      const { error: galleryError } = await supabase.from("rc_vehicle_images").insert(
        galleryPaths.map((storagePath, index) => ({
          vehicle_id: id,
          storage_path: storagePath,
          sort_order: index,
        })),
      );
      if (galleryError) throw galleryError;
    }

    const oldPaths = [
      existing?.primary_image_path,
      ...(existing?.rc_vehicle_images ?? []).map((image) => image.storage_path),
    ].filter((oldPath) => oldPath && !uploadedPaths.includes(oldPath));
    if (oldPaths.length) await supabase.storage.from(imageBucket).remove(oldPaths);

    console.log(`Imported ${vehicle.make} ${vehicle.model}: 1 primary + ${galleryPaths.length} gallery images`);
  } catch (error) {
    if (!existing) {
      await supabase.from("rc_vehicles").delete().eq("id", id);
      await supabase.storage.from(imageBucket).remove(uploadedPaths);
    }
    throw error;
  }
}

for (const [index, vehicle] of vehicles.entries()) {
  await importVehicle(vehicle, (index + 1) * 10);
}

console.log(`Completed import of ${vehicles.length} vehicles.`);

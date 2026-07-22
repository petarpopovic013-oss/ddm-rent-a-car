import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Supabase nije podešen. Dodajte NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SECRET_KEY u .env.local.",
    );
  }

  client ??= createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return client;
}

export const VEHICLE_IMAGE_BUCKET = "rc-vehicle-images";

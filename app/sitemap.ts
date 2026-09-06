import type { MetadataRoute } from "next";
import { getPublicVehicles, vehicleImageUrl } from "@/lib/admin/data";
import { localeConfig, localizedPath, locales, type Locale } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/i18n/seo";

function absolutePath(locale: Locale, path: string) {
  return new URL(localizedPath(locale, path), siteUrl).toString();
}

function alternates(path: string) {
  return Object.fromEntries([
    ...locales.map((locale) => [localeConfig[locale].hreflang, absolutePath(locale, path)]),
    ["x-default", absolutePath("sr", path)],
  ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let vehicles: Awaited<ReturnType<typeof getPublicVehicles>> = [];
  try {
    vehicles = await getPublicVehicles();
  } catch (error) {
    console.error("Failed to load vehicles for sitemap:", error);
  }
  const generatedAt = new Date();
  const staticPaths = ["/", "/vozila"];

  return [
    ...staticPaths.flatMap((path) => locales.map((locale) => ({
      url: absolutePath(locale, path),
      lastModified: generatedAt,
      changeFrequency: path === "/" ? "weekly" as const : "daily" as const,
      priority: path === "/" ? 1 : 0.9,
      alternates: { languages: alternates(path) },
    }))),
    ...vehicles.flatMap((vehicle) => {
      const path = `/vozila/${vehicle.slug}`;
      return locales.map((locale) => ({
        url: absolutePath(locale, path),
        lastModified: vehicle.updated_at ? new Date(vehicle.updated_at) : generatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: { languages: alternates(path) },
        images: vehicle.primary_image_path ? [vehicleImageUrl(vehicle.primary_image_path)!] : undefined,
      }));
    }),
  ];
}

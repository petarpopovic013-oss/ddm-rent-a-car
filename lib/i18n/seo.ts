import type { Metadata } from "next";
import { localeConfig, localizedPath, locales, type Locale } from "./config";
import { getDictionary } from "./translations";

export const siteUrl = "https://rentacarddm.rs";

export function languageAlternates(path: string) {
  return Object.fromEntries([
    ...locales.map((locale) => [localeConfig[locale].hreflang, localizedPath(locale, path)]),
    ["x-default", localizedPath("sr", path)],
  ]);
}

export function localeMetadata(locale: Locale, path: string): Metadata {
  const dictionary = getDictionary(locale);
  const isHome = path === "/";
  const title = isHome
    ? dictionary["metadata.home.title"]
    : dictionary["metadata.catalog.title"];
  const description = isHome
    ? dictionary["metadata.home.description"]
    : dictionary["metadata.catalog.description"];
  const url = localizedPath(locale, path);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      locale: localeConfig[locale].ogLocale,
      alternateLocale: locales
        .filter((item) => item !== locale)
        .map((item) => localeConfig[item].ogLocale),
      url,
      siteName: "DDM Rent a Car",
      title: isHome ? dictionary["metadata.home.ogTitle"] : title,
      description: isHome ? dictionary["metadata.home.ogDescription"] : description,
      images: [{
        url: "/Logo/DDM-RC.png",
        width: 946,
        height: 392,
        alt: "DDM Rent a Car Novi Sad",
      }],
    },
    robots: { index: true, follow: true },
  };
}

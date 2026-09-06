import { Barlow_Semi_Condensed, IBM_Plex_Sans, Roboto_Condensed } from "next/font/google";
import type { Locale } from "@/lib/i18n/config";

const latinDisplayFont = Barlow_Semi_Condensed({
  subsets: ["latin-ext"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

const cyrillicDisplayFont = Roboto_Condensed({
  subsets: ["cyrillic", "latin-ext"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["cyrillic-ext", "latin-ext"],
  display: "swap",
  variable: "--font-body",
});

export function fontClasses(locale: Locale) {
  const displayFont = locale === "ru" ? cyrillicDisplayFont : latinDisplayFont;
  return `${displayFont.variable} ${bodyFont.variable}`;
}

export const locales = ["sr", "en", "de", "ru"] as const;
export const translatedLocales = ["en", "de", "ru"] as const;

export type Locale = (typeof locales)[number];
export type TranslatedLocale = (typeof translatedLocales)[number];

export const localeConfig: Record<Locale, {
  htmlLang: string;
  intlLocale: string;
  hreflang: string;
  ogLocale: string;
  label: string;
  shortLabel: string;
}> = {
  sr: {
    htmlLang: "sr-Latn",
    intlLocale: "sr-Latn-RS",
    hreflang: "sr-Latn-RS",
    ogLocale: "sr_RS",
    label: "Srpski",
    shortLabel: "SR",
  },
  en: {
    htmlLang: "en",
    intlLocale: "en-GB",
    hreflang: "en",
    ogLocale: "en_GB",
    label: "English",
    shortLabel: "EN",
  },
  de: {
    htmlLang: "de",
    intlLocale: "de-DE",
    hreflang: "de",
    ogLocale: "de_DE",
    label: "Deutsch",
    shortLabel: "DE",
  },
  ru: {
    htmlLang: "ru",
    intlLocale: "ru-RU",
    hreflang: "ru",
    ogLocale: "ru_RU",
    label: "Русский",
    shortLabel: "RU",
  },
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isTranslatedLocale(value: string): value is TranslatedLocale {
  return translatedLocales.includes(value as TranslatedLocale);
}

export function localePrefix(locale: Locale) {
  return locale === "sr" ? "" : `/${locale}`;
}

export function localizedPath(locale: Locale, path = "/") {
  const suffixIndex = path.search(/[?#]/);
  const pathname = suffixIndex === -1 ? path : path.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : path.slice(suffixIndex);
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const prefix = localePrefix(locale);
  const localized = normalizedPath === "/" ? prefix || "/" : `${prefix}${normalizedPath}`;
  return `${localized}${suffix}`;
}

export function stripLocalePrefix(pathname: string) {
  const match = pathname.match(/^\/(en|de|ru)(?=\/|$)/);
  if (!match) return pathname || "/";
  const stripped = pathname.slice(match[0].length);
  return stripped || "/";
}

export function localeFromPathname(pathname: string): Locale {
  const match = pathname.match(/^\/(en|de|ru)(?=\/|$)/);
  return isLocale(match?.[1] ?? "") ? (match?.[1] as Locale) : "sr";
}

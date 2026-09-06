import { notFound } from "next/navigation";
import { fontClasses } from "@/app/fonts";
import {
  isTranslatedLocale,
  localeConfig,
  translatedLocales,
} from "@/lib/i18n/config";
import "@/app/globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return translatedLocales.map((locale) => ({ locale }));
}

export default async function LocalizedRootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isTranslatedLocale(locale)) notFound();

  return (
    <html lang={localeConfig[locale].htmlLang} className={fontClasses(locale)}>
      <body>{children}</body>
    </html>
  );
}

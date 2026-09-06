import { notFound } from "next/navigation";
import VehiclesPage from "@/app/_public/vehicles-page";
import { isTranslatedLocale } from "@/lib/i18n/config";
import { localeMetadata } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isTranslatedLocale(locale)) return {};
  return localeMetadata(locale, "/vozila");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isTranslatedLocale(locale)) notFound();
  return <VehiclesPage locale={locale} />;
}

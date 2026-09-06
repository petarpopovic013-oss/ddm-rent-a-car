import { notFound } from "next/navigation";
import HomePage from "@/app/_public/home-page";
import { isTranslatedLocale } from "@/lib/i18n/config";
import { localeMetadata } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isTranslatedLocale(locale)) return {};
  return localeMetadata(locale, "/");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isTranslatedLocale(locale)) notFound();
  return <HomePage locale={locale} />;
}

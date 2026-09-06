import { notFound } from "next/navigation";
import VehiclePage, {
  generateVehicleMetadata,
  getVehicleStaticParams,
} from "@/app/_public/vehicle-page";
import { isTranslatedLocale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const generateStaticParams = getVehicleStaticParams;

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isTranslatedLocale(locale)) return {};
  return generateVehicleMetadata(locale, slug);
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  if (!isTranslatedLocale(locale)) notFound();
  return <VehiclePage params={Promise.resolve({ slug })} locale={locale} />;
}

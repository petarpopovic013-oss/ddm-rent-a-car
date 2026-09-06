import VehiclesPage from "@/app/_public/vehicles-page";
import { localeMetadata } from "@/lib/i18n/seo";

export const metadata = localeMetadata("sr", "/vozila");

export default function Page() {
  return <VehiclesPage locale="sr" />;
}

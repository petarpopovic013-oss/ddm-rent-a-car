import HomePage from "@/app/_public/home-page";
import { localeMetadata } from "@/lib/i18n/seo";

export const metadata = localeMetadata("sr", "/");

export default function Page() {
  return <HomePage locale="sr" />;
}

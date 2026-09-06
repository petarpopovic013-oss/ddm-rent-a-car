import VehiclePage, {
  generateVehicleMetadata,
  getVehicleStaticParams,
} from "@/app/_public/vehicle-page";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = getVehicleStaticParams;

export async function generateMetadata({ params }: Props) {
  return generateVehicleMetadata("sr", (await params).slug);
}

export default function Page({ params }: Props) {
  return <VehiclePage params={params} locale="sr" />;
}

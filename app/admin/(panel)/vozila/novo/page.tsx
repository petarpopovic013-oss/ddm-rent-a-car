import { createVehicleAction } from "../../../actions";
import VehicleForm from "../../../components/vehicle-form";
import { MessageBanner, PageHeader } from "../../../components/ui";

export default async function NewVehiclePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="admin-main"><PageHeader eyebrow="Flota / novo vozilo" title="Dodaj vozilo" copy="Unesite podatke redom; vozilo možete prvo sačuvati kao skriveno." /><MessageBanner error={error} /><VehicleForm action={createVehicleAction} /></main>;
}

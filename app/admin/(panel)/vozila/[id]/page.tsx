import { notFound } from "next/navigation";
import { deleteVehicleAction, updateVehicleAction } from "@/app/admin/actions";
import { getVehicle } from "@/lib/admin/data";
import VehicleForm from "@/app/admin/components/vehicle-form";
import { ConfirmForm } from "@/app/admin/components/form-controls";
import { MessageBanner, PageHeader } from "@/app/admin/components/ui";

export default async function EditVehiclePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string; error?: string }> }) {
  const [{ id }, messages] = await Promise.all([params, searchParams]);
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();
  const updateAction = updateVehicleAction.bind(null, id);
  const deleteAction = deleteVehicleAction.bind(null, id);
  return <main className="admin-main"><PageHeader eyebrow="Flota / uređivanje" title={`${vehicle.make} ${vehicle.model}`} copy="Izmenite specifikacije, cene, fotografiju ili status vozila." /><MessageBanner success={messages.success} error={messages.error} /><VehicleForm action={updateAction} vehicle={vehicle} /><div className="admin-danger-zone"><div><span>Opasna zona</span><p>Vozilo sa rezervacijama ne može se obrisati; umesto toga ga arhivirajte.</p></div><ConfirmForm action={deleteAction} message="Da li sigurno želite trajno da obrišete ovo vozilo?"><button className="admin-button admin-button--danger" type="submit">Obriši vozilo</button></ConfirmForm></div></main>;
}

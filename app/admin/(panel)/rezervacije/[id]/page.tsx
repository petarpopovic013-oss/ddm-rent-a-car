import { notFound } from "next/navigation";
import { deleteReservationAction, updateReservationAction } from "@/app/admin/actions";
import { getReservation, getVehicles } from "@/lib/admin/data";
import { formatDateTime, formatRsd } from "@/lib/admin/format";
import ReservationForm from "@/app/admin/components/reservation-form";
import { ConfirmForm } from "@/app/admin/components/form-controls";
import { MessageBanner, PageHeader, ReservationStatusBadge } from "@/app/admin/components/ui";

export default async function EditReservationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string; error?: string }> }) {
  const [{ id }, messages] = await Promise.all([params, searchParams]);
  const [reservation, vehicles] = await Promise.all([getReservation(id), getVehicles()]);
  if (!reservation) notFound();
  const updateAction = updateReservationAction.bind(null, id);
  const deleteAction = deleteReservationAction.bind(null, id);
  return <main className="admin-main"><PageHeader eyebrow="Rezervacije / detalj" title={reservation.customer_name} copy={`Upit kreiran ${formatDateTime(reservation.created_at)} · ${reservation.rc_vehicles ? `${reservation.rc_vehicles.make} ${reservation.rc_vehicles.model}` : reservation.requested_vehicle ?? "vozilo"}`} /><MessageBanner success={messages.success} error={messages.error} />
    <div className="admin-reservation-summary"><div><span>Trenutni status</span><ReservationStatusBadge status={reservation.status} /></div><div><span>Broj dana</span><strong>{reservation.rental_days}</strong></div><div><span>Iznos</span><strong>{formatRsd(reservation.estimated_total_rsd)}</strong></div></div>
    <ReservationForm action={updateAction} vehicles={vehicles} reservation={reservation} />
    <div className="admin-danger-zone"><div><span>Opasna zona</span><p>Brisanje uklanja rezervaciju i njene kontakt podatke iz baze.</p></div><ConfirmForm action={deleteAction} message="Da li sigurno želite trajno da obrišete ovu rezervaciju?"><button className="admin-button admin-button--danger" type="submit">Obriši rezervaciju</button></ConfirmForm></div>
  </main>;
}

import { createReservationAction } from "../../../actions";
import { getVehicles } from "@/lib/admin/data";
import ReservationForm from "../../../components/reservation-form";
import { MessageBanner, PageHeader } from "../../../components/ui";

export default async function NewReservationPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [vehicles, messages] = await Promise.all([getVehicles(), searchParams]);
  return <main className="admin-main"><PageHeader eyebrow="Rezervacije / ručni unos" title="Nova rezervacija" copy="Za telefonske i direktne upite koje admin unosi ručno." /><MessageBanner error={messages.error} />{vehicles.length ? <ReservationForm action={createReservationAction} vehicles={vehicles} /> : <div className="admin-empty admin-empty--large"><strong>Prvo dodajte vozilo i cenovnik.</strong><p>Rezervacija ne može postojati bez vozila.</p></div>}</main>;
}

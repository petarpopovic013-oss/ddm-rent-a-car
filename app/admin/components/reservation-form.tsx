import Link from "next/link";
import type { Reservation, Vehicle } from "@/lib/admin/types";
import { SubmitButton } from "./form-controls";

export default function ReservationForm({
  action,
  vehicles,
  reservation,
}: {
  action: (formData: FormData) => void | Promise<void>;
  vehicles: Vehicle[];
  reservation?: Reservation | null;
}) {
  return (
    <form action={action} className="admin-editor">
      {reservation?.requested_vehicle && <input type="hidden" name="requested_vehicle" value={reservation.requested_vehicle} />}
      <section className="admin-form-section">
        <div className="admin-form-section__intro"><span>01</span><div><h2>Klijent i vozilo</h2><p>Kontakt podaci i automobil za koji se vodi upit.</p></div></div>
        <div className="admin-form-grid">
          <label className="admin-field--full"><span>Vozilo *</span><select name="vehicle_id" defaultValue={reservation?.vehicle_id ?? ""} required={!reservation?.requested_vehicle}><option value="">{reservation?.requested_vehicle ? `Nepovezano — ${reservation.requested_vehicle}` : "Izaberite vozilo"}</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>)}</select></label>
          <label><span>Ime i prezime *</span><input name="customer_name" defaultValue={reservation?.customer_name} required /></label>
          <label><span>Telefon *</span><input name="customer_phone" defaultValue={reservation?.customer_phone} required /></label>
          <label className="admin-field--full"><span>Email *</span><input name="customer_email" type="email" defaultValue={reservation?.customer_email} required /></label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-section__intro"><span>02</span><div><h2>Termin i odluka</h2><p>Iznos se automatski računa prema vozilu i izabranom periodu.</p></div></div>
        <div className="admin-form-grid">
          <label><span>Datum preuzimanja *</span><input name="pickup_date" type="date" defaultValue={reservation?.pickup_date} required /></label>
          <label><span>Datum vraćanja *</span><input name="return_date" type="date" defaultValue={reservation?.return_date} required /></label>
          {reservation ? (
            <input type="hidden" name="status" value={reservation.status} />
          ) : (
            <label><span>Status *</span><select name="status" defaultValue="pending"><option value="pending">Novi upit</option><option value="accepted">Prihvaćeno</option><option value="rejected">Odbijeno</option></select></label>
          )}
          <label className="admin-field--full"><span>Napomena klijenta</span><textarea name="customer_note" rows={4} defaultValue={reservation?.customer_note ?? ""} /></label>
          <label className="admin-field--full"><span>Interna admin napomena</span><textarea name="admin_note" rows={4} defaultValue={reservation?.admin_note ?? ""} /></label>
        </div>
      </section>

      <div className="admin-editor__actions">
        <Link href="/admin/rezervacije" className="admin-button admin-button--ghost">Otkaži</Link>
        <div className="admin-editor__decision-actions">
          <SubmitButton className="admin-button admin-button--ghost">{reservation ? "Sačuvaj izmene" : "Kreiraj rezervaciju"}</SubmitButton>
          {reservation && reservation.status !== "rejected" && (
            <SubmitButton
              className="admin-button admin-button--danger"
              name="decision"
              value="rejected"
              confirmation="Da li sigurno želite da odbijete ovaj upit? Sve izmene u formi biće sačuvane."
            >
              Odbij upit
            </SubmitButton>
          )}
          {reservation && reservation.status !== "accepted" && (
            <SubmitButton className="admin-button admin-button--accept" name="decision" value="accepted">
              Prihvati upit
            </SubmitButton>
          )}
        </div>
      </div>
    </form>
  );
}

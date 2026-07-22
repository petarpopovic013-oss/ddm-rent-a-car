import Link from "next/link";
import { getDashboardData } from "@/lib/admin/data";
import { formatDate, formatDateTime, formatRsd } from "@/lib/admin/format";
import { ReservationStatusBadge } from "../components/ui";

export default async function AdminDashboardPage() {
  const stats = await getDashboardData();
  return (
    <main className="admin-main">
      <div className="admin-dashboard-hero">
        <div>
          <p className="admin-eyebrow">Operativni pregled</p>
          <h1>Dobro jutro, DDM.</h1>
          <p>Najvažnije informacije o floti i upitima, bez suvišnih koraka.</p>
        </div>
        <div className="admin-dashboard-hero__date"><span>Danas</span><strong>{new Intl.DateTimeFormat("sr-Latn-RS", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</strong></div>
      </div>

      <section className="admin-stats" aria-label="Statistika">
        <article><span>01 / Flota</span><strong>{stats.activeVehicles}<small> / {stats.totalVehicles}</small></strong><p>aktivnih vozila</p></article>
        <article className="admin-stat--accent"><span>02 / Novi upiti</span><strong>{stats.pendingReservations}</strong><p>čeka odgovor</p></article>
        <article><span>03 / Predstojeće</span><strong>{stats.upcomingReservations}</strong><p>prihvaćenih termina</p></article>
        <article><span>04 / Potvrđeno</span><strong className="admin-stat__money">{formatRsd(stats.acceptedRevenue)}</strong><p>ukupna vrednost</p></article>
      </section>

      <section className="admin-dashboard-grid">
        <div className="admin-panel">
          <div className="admin-panel__header"><div><span>Poslednja aktivnost</span><h2>Novi upiti</h2></div><Link href="/admin/rezervacije">Sve rezervacije ↗</Link></div>
          {stats.recentReservations.length ? (
            <div className="admin-table-wrap"><table className="admin-table admin-table--dashboard"><thead><tr><th>Klijent</th><th>Vozilo</th><th>Termin</th><th>Status</th><th /></tr></thead><tbody>{stats.recentReservations.map((reservation) => <tr key={reservation.id}><td><strong>{reservation.customer_name}</strong><small>{formatDateTime(reservation.created_at)}</small></td><td>{reservation.rc_vehicles ? `${reservation.rc_vehicles.make} ${reservation.rc_vehicles.model}` : "—"}</td><td>{formatDate(reservation.pickup_date)} – {formatDate(reservation.return_date)}</td><td><ReservationStatusBadge status={reservation.status} /></td><td><Link href={`/admin/rezervacije/${reservation.id}`} aria-label={`Otvori ${reservation.customer_name}`}>Otvori ↗</Link></td></tr>)}</tbody></table></div>
          ) : <div className="admin-empty"><strong>Još nema upita.</strong><p>Nove rezervacije će se pojaviti ovde.</p></div>}
        </div>
        <aside className="admin-quick-actions">
          <span>Brze akcije</span>
          <h2>Šta radimo sledeće?</h2>
          <Link href="/admin/vozila/novo"><b>01</b><span>Dodaj novo vozilo<small>Podaci, cenovnik i fotografija</small></span><i>↗</i></Link>
          <Link href="/admin/rezervacije/nova"><b>02</b><span>Nova rezervacija<small>Ručni unos telefonskog upita</small></span><i>↗</i></Link>
          <Link href="/admin/rezervacije?status=pending"><b>03</b><span>Obradi nove upite<small>{stats.pendingReservations} trenutno na čekanju</small></span><i>↗</i></Link>
        </aside>
      </section>
    </main>
  );
}

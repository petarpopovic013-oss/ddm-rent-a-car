import Image from "next/image";
import Link from "next/link";
import { getVehicles, vehicleImageUrl } from "@/lib/admin/data";
import { formatRsd } from "@/lib/admin/format";
import { fuelLabels } from "@/lib/admin/types";
import { MessageBanner, PageHeader, VehicleStatusBadge } from "../../components/ui";

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [vehicles, messages] = await Promise.all([getVehicles(), searchParams]);
  return (
    <main className="admin-main">
      <PageHeader eyebrow="Flota / upravljanje" title="Vozila" copy="Cene, specifikacije i vidljivost kompletne rent-a-car ponude." actionHref="/admin/vozila/novo" actionLabel="Dodaj vozilo" />
      <MessageBanner success={messages.success} error={messages.error} />
      {vehicles.length ? <section className="admin-vehicle-grid">{vehicles.map((vehicle, index) => {
        const image = vehicleImageUrl(vehicle.primary_image_path);
        const startingPrice = [...(vehicle.rc_vehicle_pricing_tiers ?? [])].filter((tier) => tier.pricing_mode === "daily").sort((a, b) => a.price_rsd - b.price_rsd)[0]?.price_rsd;
        return <article className="admin-vehicle-card" key={vehicle.id}>
          <div className="admin-vehicle-card__image">{image ? <Image src={image} alt={`${vehicle.make} ${vehicle.model}`} fill sizes="(max-width: 800px) 100vw, 33vw" style={{ objectPosition: vehicle.image_position ?? "center" }} /> : <span>DDM / {String(index + 1).padStart(2, "0")}</span>}<VehicleStatusBadge status={vehicle.status} /></div>
          <div className="admin-vehicle-card__body"><div><small>{vehicle.make}</small><h2>{vehicle.model}</h2></div><strong>{formatRsd(startingPrice)}<small> / dan</small></strong></div>
          <ul><li>{vehicle.engine} {fuelLabels[vehicle.fuel_type].toLowerCase()}</li><li>{vehicle.transmission === "manual" ? "Manuelni" : "Automatski"}</li><li>{vehicle.seats} sedišta</li></ul>
          <div className="admin-vehicle-card__footer"><span>{vehicle.category}</span><Link href={`/admin/vozila/${vehicle.id}`}>Uredi vozilo ↗</Link></div>
        </article>;
      })}</section> : <div className="admin-empty admin-empty--large"><strong>Flota je spremna za prvi unos.</strong><p>Dodajte vozilo, cenovne rangove i glavnu fotografiju.</p><Link href="/admin/vozila/novo" className="admin-button">Dodaj prvo vozilo ↗</Link></div>}
    </main>
  );
}

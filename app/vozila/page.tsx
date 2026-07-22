import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquiryModal from "@/app/components/inquiry-modal";
import FloatingInquiryButton from "@/app/components/floating-inquiry-button";
import SiteFooter from "@/app/components/site-footer";
import SiteHeader from "@/app/components/site-header";
import { getAcceptedReservationPeriods, getPublicVehicles, unavailablePeriodsForVehicle, vehicleImageUrl } from "@/lib/admin/data";
import { fuelLabels } from "@/lib/admin/types";

export const metadata: Metadata = {
  title: "Vozila za iznajmljivanje | DDM Rent a Car Novi Sad",
  description: "Pregledajte DDM Rent a Car flotu, karakteristike i cene vozila za iznajmljivanje u Novom Sadu.",
  alternates: { canonical: "/vozila" },
};

function price(value: number) {
  return new Intl.NumberFormat("sr-RS").format(value);
}

export default async function VehiclesPage() {
  const [vehicles, unavailablePeriods] = await Promise.all([
    getPublicVehicles(),
    getAcceptedReservationPeriods(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="catalog-page">
        <section className="catalog-hero">
          <div className="page-shell catalog-hero__inner">
            <div>
              <p className="eyebrow">DDM flota</p>
              <h1>Izaberite vozilo za svoj put.</h1>
            </div>
            <p>Pregledajte fotografije, specifikacije i cenovnik svakog vozila.</p>
          </div>
        </section>

        <section className="catalog-section">
          <div className="page-shell">
            {vehicles.length ? (
              <div className="catalog-grid">
                {vehicles.map((vehicle, index) => {
                  const image = vehicleImageUrl(vehicle.primary_image_path);
                  const lowestDaily = Math.min(
                    ...(vehicle.rc_vehicle_pricing_tiers ?? [])
                      .filter((tier) => tier.pricing_mode === "daily")
                      .map((tier) => tier.price_rsd),
                  );

                  return (
                    <article className="catalog-card" key={vehicle.id}>
                      <Link className="catalog-card__image" href={`/vozila/${vehicle.slug}`}>
                        {image ? (
                          <>
                            <Image
                              className="vehicle-cover__backdrop"
                              src={image}
                              alt=""
                              aria-hidden="true"
                              fill
                              sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                            />
                            <Image
                              className="vehicle-cover__image"
                              src={image}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              fill
                              sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                              style={{ objectPosition: vehicle.image_position ?? "center" }}
                            />
                          </>
                        ) : (
                          <span>DDM / fotografija vozila</span>
                        )}
                        <b>{String(index + 1).padStart(2, "0")}</b>
                      </Link>
                      <div className="catalog-card__body">
                        <span>{vehicle.category}</span>
                        <h2><Link href={`/vozila/${vehicle.slug}`}>{vehicle.make} {vehicle.model}</Link></h2>
                        <ul>
                          <li>{vehicle.engine} {fuelLabels[vehicle.fuel_type].toLocaleLowerCase("sr-Latn")}</li>
                          <li>{vehicle.transmission === "manual" ? "Manuelni" : "Automatski"}</li>
                          <li>{vehicle.seats} sedišta</li>
                        </ul>
                        <div className="catalog-card__footer">
                          <div><small>od</small><strong>{price(lowestDaily)} RSD</strong><span>/ dan</span></div>
                          <Link className="button button--small" href={`/vozila/${vehicle.slug}`}>Pogledaj vozilo <b>↗</b></Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="fleet-empty"><strong>Ponuda se trenutno osvežava.</strong><span>Kontaktirajte DDM tim za dostupna vozila.</span></div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingInquiryButton />
      <InquiryModal vehicles={vehicles.map((vehicle) => ({
        slug: vehicle.slug,
        label: `${vehicle.make} ${vehicle.model}`,
        pricing: (vehicle.rc_vehicle_pricing_tiers ?? []).map((tier) => ({
          minDays: tier.min_days,
          maxDays: tier.max_days,
          priceRsd: tier.price_rsd,
          pricingMode: tier.pricing_mode,
        })),
        unavailablePeriods: unavailablePeriodsForVehicle(unavailablePeriods, vehicle.id),
      }))} />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import InquiryModal from "@/app/components/inquiry-modal";
import FloatingInquiryButton from "@/app/components/floating-inquiry-button";
import SiteFooter from "@/app/components/site-footer";
import SiteHeader from "@/app/components/site-header";
import VehicleGallery from "@/app/components/vehicle-gallery";
import { getAcceptedReservationPeriods, getPublicVehicleBySlug, getPublicVehicles, unavailablePeriodsForVehicle, vehicleImageUrl } from "@/lib/admin/data";
import { bodyTypeLabels, fuelLabels } from "@/lib/admin/types";

type VehiclePageProps = { params: Promise<{ slug: string }> };

function price(value: number) {
  return new Intl.NumberFormat("sr-RS").format(value);
}

function tierLabel(minDays: number) {
  if (minDays === 1) return "1-3 dana";
  if (minDays === 4) return "4-10 dana";
  if (minDays === 11) return "11-29 dana";
  return "30 dana";
}

export async function generateStaticParams() {
  const vehicles = await getPublicVehicles();
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getPublicVehicleBySlug(slug);
  if (!vehicle) return { title: "Vozilo nije pronađeno | DDM Rent a Car" };
  const image = vehicleImageUrl(vehicle.primary_image_path);

  return {
    title: `${vehicle.make} ${vehicle.model} | DDM Rent a Car Novi Sad`,
    description: vehicle.description ?? `${vehicle.make} ${vehicle.model} za iznajmljivanje u Novom Sadu.`,
    alternates: { canonical: `/vozila/${vehicle.slug}` },
    openGraph: image ? { images: [{ url: image, alt: `${vehicle.make} ${vehicle.model}` }] } : undefined,
  };
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { slug } = await params;
  const [vehicle, allVehicles, unavailablePeriods] = await Promise.all([
    getPublicVehicleBySlug(slug),
    getPublicVehicles(),
    getAcceptedReservationPeriods(),
  ]);
  if (!vehicle) notFound();

  const primaryImage = vehicleImageUrl(vehicle.primary_image_path);
  const gallery = (vehicle.rc_vehicle_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => vehicleImageUrl(image.storage_path))
    .filter((image): image is string => Boolean(image));
  const images = primaryImage ? [primaryImage, ...gallery.filter((image) => image !== primaryImage)] : gallery;
  const tiers = (vehicle.rc_vehicle_pricing_tiers ?? []).slice().sort((a, b) => a.min_days - b.min_days);

  return (
    <>
      <SiteHeader />
      <main className="vehicle-detail">
        <div className="page-shell vehicle-detail__breadcrumb">
          <Link href="/vozila">Vozila</Link><span>/</span><strong>{vehicle.make} {vehicle.model}</strong>
        </div>

        <section className="page-shell vehicle-detail__hero">
          <div className="vehicle-detail__main-image">
            {images.length ? (
              <VehicleGallery images={images} vehicleName={`${vehicle.make} ${vehicle.model}`} />
            ) : (
              <span>DDM / fotografija vozila</span>
            )}
          </div>
          <div className="vehicle-detail__intro">
            <p className="eyebrow">{vehicle.category}</p>
            <h1><span>{vehicle.make}</span>{vehicle.model}</h1>
            <p>{vehicle.description}</p>
            <div className="vehicle-detail__quick-facts">
              <div><span>Motor</span><strong>{vehicle.engine} {fuelLabels[vehicle.fuel_type].toLocaleLowerCase("sr-Latn")}</strong></div>
              <div><span>Menjač</span><strong>{vehicle.transmission === "manual" ? "Manuelni" : "Automatski"}</strong></div>
              <div><span>Sedišta</span><strong>{vehicle.seats}</strong></div>
            </div>
            <button className="button" type="button" data-inquiry-trigger data-vehicle-slug={vehicle.slug}>Pošalji upit za ovo vozilo <span>↗</span></button>
          </div>
        </section>

        <section className="vehicle-detail__information">
          <div className="page-shell vehicle-detail__information-grid">
            <div>
              <p className="eyebrow">Specifikacije</p>
              <h2>Podaci o vozilu</h2>
              <dl className="vehicle-specs">
                <div><dt>Karoserija</dt><dd>{bodyTypeLabels[vehicle.body_type]}</dd></div>
                <div><dt>Gorivo</dt><dd>{fuelLabels[vehicle.fuel_type]}</dd></div>
                <div><dt>Motor</dt><dd>{vehicle.engine}</dd></div>
                <div><dt>Menjač</dt><dd>{vehicle.transmission === "manual" ? "Manuelni" : "Automatski"}</dd></div>
                <div><dt>Broj sedišta</dt><dd>{vehicle.seats}</dd></div>
                <div><dt>Broj vrata</dt><dd>{vehicle.doors ?? "Nije navedeno"}</dd></div>
                <div><dt>Klima</dt><dd>{vehicle.air_conditioning ? "Da" : "Ne"}</dd></div>
                {vehicle.cruise_control && <div><dt>Tempomat</dt><dd>Da</dd></div>}
              </dl>
            </div>
            <div>
              <p className="eyebrow">Cenovnik</p>
              <h2>Cena prema periodu</h2>
              <div className="vehicle-pricing">
                {tiers.map((tier) => (
                  <div key={tier.id}>
                    <span>{tierLabel(tier.min_days)}</span>
                    <strong>{price(tier.price_rsd)} RSD</strong>
                    <small>{tier.pricing_mode === "fixed" ? "fiksno" : "po danu"}</small>
                  </div>
                ))}
              </div>
              <p className="vehicle-pricing__note">Iznos se računa prema broju dana. Dostupnost potvrđuje DDM tim nakon slanja upita.</p>
            </div>
          </div>
        </section>

        <section className="vehicle-detail__cta">
          <div className="page-shell"><div><p className="eyebrow eyebrow--light">Termin i dostupnost</p><h2>Proverite da li je {vehicle.make} {vehicle.model} slobodan.</h2></div><button className="button button--white" type="button" data-inquiry-trigger data-vehicle-slug={vehicle.slug}>Pošalji upit <span>↗</span></button></div>
        </section>
      </main>
      <SiteFooter />
      <FloatingInquiryButton vehicleSlug={vehicle.slug} />
      <InquiryModal vehicles={allVehicles.map((item) => ({
        slug: item.slug,
        label: `${item.make} ${item.model}`,
        pricing: (item.rc_vehicle_pricing_tiers ?? []).map((tier) => ({
          minDays: tier.min_days,
          maxDays: tier.max_days,
          priceRsd: tier.price_rsd,
          pricingMode: tier.pricing_mode,
        })),
        unavailablePeriods: unavailablePeriodsForVehicle(unavailablePeriods, item.id),
      }))} />
    </>
  );
}

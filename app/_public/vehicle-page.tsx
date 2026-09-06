import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import InquiryModal from "@/app/components/inquiry-modal";
import FloatingInquiryButton from "@/app/components/floating-inquiry-button";
import SiteFooter from "@/app/components/site-footer";
import SiteHeader from "@/app/components/site-header";
import VehicleGallery from "@/app/components/vehicle-gallery";
import { getAcceptedReservationPeriods, getPublicVehicleBySlug, getPublicVehicles, unavailablePeriodsForVehicle, vehicleImageUrl } from "@/lib/admin/data";
import type { Locale } from "@/lib/i18n/config";
import { localeConfig, localizedPath, locales } from "@/lib/i18n/config";
import { getDictionary, formatMessage } from "@/lib/i18n/translations";
import { languageAlternates, siteUrl } from "@/lib/i18n/seo";
import { localizedBodyType, localizedFuel, localizedTransmission, localizedVehicleCopy } from "@/lib/i18n/vehicle";

type VehiclePageProps = { params: Promise<{ slug: string }> };

function tierLabel(minDays: number, locale: Locale) {
  const range = minDays === 1 ? "1–3" : minDays === 4 ? "4–10" : minDays === 11 ? "11–25" : "26–31";
  const unit = locale === "sr" ? "dana" : locale === "en" ? "days" : locale === "de" ? "Tage" : "дней";
  return `${range} ${unit}`;
}

export async function getVehicleStaticParams() {
  const vehicles = await getPublicVehicles();
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateVehicleMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const dictionary = getDictionary(locale);
  const vehicle = await getPublicVehicleBySlug(slug);
  if (!vehicle) return { title: `${dictionary["vehicle.detail.notFound"]} | DDM Rent a Car` };
  const image = vehicleImageUrl(vehicle.primary_image_path);
  const copy = localizedVehicleCopy(vehicle, locale, dictionary);
  const vehicleName = `${vehicle.make} ${vehicle.model}`;
  const path = `/vozila/${vehicle.slug}`;
  const url = localizedPath(locale, path);

  return {
    metadataBase: new URL(siteUrl),
    title: `${vehicleName} | DDM Rent a Car Novi Sad`,
    description: copy.description || formatMessage(dictionary["metadata.vehicle.description"], { vehicle: vehicleName }),
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      locale: localeConfig[locale].ogLocale,
      alternateLocale: locales.filter((item) => item !== locale).map((item) => localeConfig[item].ogLocale),
      url,
      siteName: "DDM Rent a Car",
      title: `${vehicleName} | DDM Rent a Car Novi Sad`,
      description: copy.description,
      images: image ? [{ url: image, alt: vehicleName }] : undefined,
    },
  };
}

export default async function VehiclePage({ params, locale }: VehiclePageProps & { locale: Locale }) {
  const { slug } = await params;
  const dictionary = getDictionary(locale);
  const formatPrice = new Intl.NumberFormat(localeConfig[locale].intlLocale);
  const [vehicle, allVehicles, unavailablePeriods] = await Promise.all([
    getPublicVehicleBySlug(slug),
    getPublicVehicles(),
    getAcceptedReservationPeriods(),
  ]);
  if (!vehicle) notFound();
  const copy = localizedVehicleCopy(vehicle, locale, dictionary);
  const fuel = localizedFuel(vehicle, dictionary);
  const transmission = localizedTransmission(vehicle, dictionary);
  const availabilitySuffix = dictionary["vehicle.detail.checkSuffix"];
  const availabilitySeparator = /^[.,!?]/.test(availabilitySuffix) ? "" : " ";
  const availabilityTitle = `${dictionary["vehicle.detail.checkPrefix"]} ${vehicle.make} ${vehicle.model}${availabilitySeparator}${availabilitySuffix}`;

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
      <SiteHeader locale={locale} dictionary={dictionary} />
      <main className="vehicle-detail">
        <div className="page-shell vehicle-detail__breadcrumb">
          <Link href={localizedPath(locale, "/vozila")}>{dictionary["vehicle.detail.breadcrumb"]}</Link><span>/</span><strong>{vehicle.make} {vehicle.model}</strong>
        </div>

        <section className="page-shell vehicle-detail__hero">
          <div className="vehicle-detail__main-image">
            {images.length ? (
              <VehicleGallery images={images} vehicleName={`${vehicle.make} ${vehicle.model}`} dictionary={dictionary} />
            ) : (
              <span>{dictionary["common.vehiclePhoto"]}</span>
            )}
          </div>
          <div className="vehicle-detail__intro">
            <p className="eyebrow">{copy.category}</p>
            <h1><span>{vehicle.make}</span>{vehicle.model}</h1>
            <p>{copy.description}</p>
            <div className="vehicle-detail__quick-facts">
              <div><span>{dictionary["vehicle.engine"]}</span><strong>{vehicle.engine} {fuel.toLocaleLowerCase()}</strong></div>
              {vehicle.type === "motorcycle" ? (
                <>
                  <div><span>{dictionary["vehicle.power"]}</span><strong>{vehicle.power_kw} kW</strong></div>
                  <div><span>{dictionary["vehicle.license"]}</span><strong>{vehicle.license_category}</strong></div>
                </>
              ) : (
                <>
                  <div><span>{dictionary["vehicle.transmission"]}</span><strong>{transmission}</strong></div>
                  <div><span>{dictionary["vehicle.detail.seatCount"]}</span><strong>{vehicle.seats}</strong></div>
                </>
              )}
            </div>
            <button className="button" type="button" data-inquiry-trigger data-vehicle-slug={vehicle.slug}>{dictionary["vehicle.detail.inquiry"]} <span>↗</span></button>
          </div>
        </section>

        <section className="vehicle-detail__information">
          <div className="page-shell vehicle-detail__information-grid">
            <div>
              <p className="eyebrow">{dictionary["vehicle.detail.specEyebrow"]}</p>
              <h2>{dictionary["vehicle.detail.specTitle"]}</h2>
              <dl className="vehicle-specs">
                {vehicle.type === "car" ? (
                  <>
                    {vehicle.body_type && <div><dt>{dictionary["vehicle.detail.body"]}</dt><dd>{localizedBodyType(vehicle.body_type, dictionary)}</dd></div>}
                    <div><dt>{dictionary["vehicle.detail.fuel"]}</dt><dd>{fuel}</dd></div>
                    <div><dt>{dictionary["vehicle.engine"]}</dt><dd>{vehicle.engine}</dd></div>
                    <div><dt>{dictionary["vehicle.transmission"]}</dt><dd>{transmission}</dd></div>
                    <div><dt>{dictionary["vehicle.detail.seatCount"]}</dt><dd>{vehicle.seats}</dd></div>
                    {vehicle.doors && <div><dt>{dictionary["vehicle.detail.doorCount"]}</dt><dd>{vehicle.doors}</dd></div>}
                    <div><dt>{dictionary["vehicle.detail.airConditioning"]}</dt><dd>{vehicle.air_conditioning ? dictionary["common.yes"] : dictionary["common.no"]}</dd></div>
                    {vehicle.cruise_control && <div><dt>{dictionary["vehicle.detail.cruise"]}</dt><dd>{dictionary["common.yes"]}</dd></div>}
                  </>
                ) : (
                  <>
                    <div><dt>{dictionary["vehicle.detail.license"]}</dt><dd>{vehicle.license_category}</dd></div>
                    <div><dt>{dictionary["vehicle.detail.fuel"]}</dt><dd>{fuel}</dd></div>
                    <div><dt>{dictionary["vehicle.engine"]}</dt><dd>{vehicle.engine}</dd></div>
                    <div><dt>{dictionary["vehicle.power"]}</dt><dd>{vehicle.power_kw} kW</dd></div>
                    <div><dt>{dictionary["vehicle.transmission"]}</dt><dd>{transmission}</dd></div>
                    <div><dt>{dictionary["vehicle.detail.seatCount"]}</dt><dd>{vehicle.seats}</dd></div>
                    {vehicle.weight_kg && <div><dt>{dictionary["vehicle.detail.weight"]}</dt><dd>{vehicle.weight_kg} kg</dd></div>}
                    {vehicle.seat_height_mm && <div><dt>{dictionary["vehicle.detail.seatHeight"]}</dt><dd>{vehicle.seat_height_mm} mm</dd></div>}
                  </>
                )}
              </dl>
            </div>
            <div>
              <p className="eyebrow">{dictionary["vehicle.detail.pricingEyebrow"]}</p>
              <h2>{dictionary["vehicle.detail.pricingTitle"]}</h2>
              <div className="vehicle-pricing">
                {tiers.map((tier) => (
                  <div key={tier.id}>
                    <span>{tierLabel(tier.min_days, locale)}</span>
                    <strong>{formatPrice.format(tier.price_rsd)} RSD</strong>
                    <small>{dictionary[tier.pricing_mode === "fixed" ? "vehicle.detail.fixed" : "vehicle.detail.daily"]}</small>
                  </div>
                ))}
              </div>
              <p className="vehicle-pricing__note">{dictionary["vehicle.detail.priceNote"]}</p>
            </div>
          </div>
        </section>

        <section className="vehicle-detail__cta">
          <div className="page-shell"><div><p className="eyebrow eyebrow--light">{dictionary["vehicle.detail.availability"]}</p><h2>{availabilityTitle}</h2></div><button className="button button--white" type="button" data-inquiry-trigger data-vehicle-slug={vehicle.slug}>{dictionary["action.inquiry"]} <span>↗</span></button></div>
        </section>
      </main>
      <SiteFooter locale={locale} dictionary={dictionary} />
      <FloatingInquiryButton vehicleSlug={vehicle.slug} dictionary={dictionary} />
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
      }))} locale={locale} dictionary={dictionary} />
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import InquiryModal from "@/app/components/inquiry-modal";
import FloatingInquiryButton from "@/app/components/floating-inquiry-button";
import SiteFooter from "@/app/components/site-footer";
import SiteHeader from "@/app/components/site-header";
import { getAcceptedReservationPeriods, getPublicVehicles, unavailablePeriodsForVehicle, vehicleImageUrl } from "@/lib/admin/data";
import type { Locale } from "@/lib/i18n/config";
import { localeConfig, localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/translations";
import { localizedFuel, localizedTransmission, localizedVehicleCopy } from "@/lib/i18n/vehicle";

export default async function VehiclesPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const formatPrice = new Intl.NumberFormat(localeConfig[locale].intlLocale);
  let vehicles: Awaited<ReturnType<typeof getPublicVehicles>> = [];
  let unavailablePeriods: Awaited<ReturnType<typeof getAcceptedReservationPeriods>> = [];

  try {
    [vehicles, unavailablePeriods] = await Promise.all([
      getPublicVehicles(),
      getAcceptedReservationPeriods(),
    ]);
  } catch (error) {
    console.error("Public vehicles catalog could not be loaded:", error);
  }

  return (
    <>
      <SiteHeader locale={locale} dictionary={dictionary} />
      <main className="catalog-page">
        <section className="catalog-hero">
          <div className="page-shell catalog-hero__inner">
            <div>
              <p className="eyebrow">{dictionary["catalog.eyebrow"]}</p>
              <h1>{dictionary["catalog.title"]}</h1>
            </div>
            <p>{dictionary["catalog.copy"]}</p>
          </div>
        </section>

        <section className="catalog-section">
          <div className="page-shell">
            {vehicles.length ? (
              <div className="catalog-grid">
                {vehicles.map((vehicle, index) => {
                  const image = vehicleImageUrl(vehicle.primary_image_path);
                  const copy = localizedVehicleCopy(vehicle, locale, dictionary);
                  const href = localizedPath(locale, `/vozila/${vehicle.slug}`);
                  const lowestDaily = Math.min(
                    ...(vehicle.rc_vehicle_pricing_tiers ?? [])
                      .filter((tier) => tier.pricing_mode === "daily")
                      .map((tier) => tier.price_rsd),
                  );

                  return (
                    <article className="catalog-card" key={vehicle.id}>
                      <Link className="catalog-card__image" href={href}>
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
                          <span>{dictionary["common.vehiclePhoto"]}</span>
                        )}
                        <b>{String(index + 1).padStart(2, "0")}</b>
                      </Link>
                      <div className="catalog-card__body">
                        <span>{copy.category}</span>
                        <h2><Link href={href}>{vehicle.make} {vehicle.model}</Link></h2>
                        <ul>
                          <li>{vehicle.engine} {localizedFuel(vehicle, dictionary).toLocaleLowerCase()}</li>
                          {vehicle.type === "motorcycle" ? (
                            <>
                              <li>{vehicle.power_kw} kW</li>
                              <li>{dictionary["vehicle.licenseShort"]} {vehicle.license_category}</li>
                            </>
                          ) : (
                            <>
                              <li>{localizedTransmission(vehicle, dictionary)}</li>
                              <li>{vehicle.seats} {dictionary["vehicle.seats"]}</li>
                            </>
                          )}
                        </ul>
                        <div className="catalog-card__footer">
                          <div><small>{dictionary["common.from"]}</small><strong>{formatPrice.format(lowestDaily)} RSD</strong><span>{dictionary["common.perDay"]}</span></div>
                          <Link className="button button--small" href={href}>{dictionary["action.viewVehicle"]} <b>↗</b></Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="fleet-empty"><strong>{dictionary["catalog.emptyTitle"]}</strong><span>{dictionary["catalog.emptyCopy"]}</span></div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} dictionary={dictionary} />
      <FloatingInquiryButton dictionary={dictionary} />
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
      }))} locale={locale} dictionary={dictionary} />
    </>
  );
}

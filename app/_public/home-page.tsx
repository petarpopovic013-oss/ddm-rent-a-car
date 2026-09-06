import Image from "next/image";
import Link from "next/link";
import { getAcceptedReservationPeriods, getFeaturedPublicVehicles, getPublicVehicles, unavailablePeriodsForVehicle, vehicleImageUrl } from "@/lib/admin/data";
import type { Vehicle as DatabaseVehicle } from "@/lib/admin/types";
import type { Locale } from "@/lib/i18n/config";
import { localeConfig, localizedPath } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/translations";
import { localizedFuel, localizedTransmission } from "@/lib/i18n/vehicle";
import FAQ from "@/app/components/faq";
import FloatingInquiryButton from "@/app/components/floating-inquiry-button";
import InquiryModal, { type InquiryVehicle } from "@/app/components/inquiry-modal";
import SiteFooter from "@/app/components/site-footer";
import SiteHeader from "@/app/components/site-header";

const phoneDisplay = "+381 64 133 4589";
const email = "ddmcompany@gmail.com";
const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Dr+Svetislava+Kasapinovi%C4%87a+9%2C+Novi+Sad";
const reviewsUrl =
  "https://www.google.com/search?q=ddm+rent+a+car#lrd=0x475b104b45f5f5c5:0x6c66637da08d85d7,1,,,,";

type LandingVehicle = {
  slug: string;
  make: string;
  model: string;
  category: string;
  dailyPrice: number;
  image: string | null;
  imagePosition?: string;
  facts: string[];
};

function toLandingVehicle(vehicle: DatabaseVehicle, dictionary: Dictionary): LandingVehicle | null {
  const dailyPrices = (vehicle.rc_vehicle_pricing_tiers ?? [])
    .filter((tier) => tier.pricing_mode === "daily")
    .map((tier) => tier.price_rsd);
  const image = vehicleImageUrl(vehicle.primary_image_path);
  if (!dailyPrices.length || !image) return null;

  return {
    slug: vehicle.slug,
    make: vehicle.make,
    model: vehicle.model,
    category: vehicle.category,
    dailyPrice: Math.min(...dailyPrices),
    image,
    imagePosition: vehicle.image_position ?? undefined,
    facts: vehicle.type === "motorcycle"
      ? [
          `${vehicle.engine} ${localizedFuel(vehicle, dictionary).toLocaleLowerCase()}`,
          `${vehicle.power_kw} kW`,
          `${dictionary["vehicle.license"]} ${vehicle.license_category}`,
        ]
      : [
          `${vehicle.engine} ${localizedFuel(vehicle, dictionary).toLocaleLowerCase()}`,
          localizedTransmission(vehicle, dictionary),
          `${vehicle.seats} ${dictionary["vehicle.seats"]}`,
        ],
  };
}

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

function SectionIntro({
  eyebrow,
  title,
  copy,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "section-intro section-intro--center" : "section-intro"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-copy">{copy}</p>
    </div>
  );
}

function VehicleCard({ vehicle, locale, dictionary }: { vehicle: LandingVehicle; locale: Locale; dictionary: Dictionary }) {
  const href = localizedPath(locale, `/vozila/${vehicle.slug}`);
  const displayPrice = new Intl.NumberFormat(localeConfig[locale].intlLocale).format(vehicle.dailyPrice);
  return (
    <article className="vehicle-card" id={vehicle.slug}>
      <Link className="vehicle-card__image" href={href} aria-label={`${dictionary["action.viewVehicle"]}: ${vehicle.make} ${vehicle.model}`}>
        {vehicle.image ? (
          <>
            <Image
              className="vehicle-cover__backdrop"
              src={vehicle.image}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
            />
            <Image
              className="vehicle-cover__image"
              src={vehicle.image}
              alt={`${vehicle.make} ${vehicle.model} — DDM Rent a Car`}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
              style={{ objectPosition: vehicle.imagePosition ?? "center" }}
            />
          </>
        ) : (
          <span className="vehicle-card__image-placeholder">{dictionary["common.vehiclePhoto"]}</span>
        )}
      </Link>
      <div className="vehicle-card__body">
        <div className="vehicle-card__heading">
          <div>
            <span>{vehicle.make}</span>
            <h3>{vehicle.model}</h3>
          </div>
          <div className="vehicle-card__price">
            <small>{dictionary["common.from"]}</small>
            <strong>{displayPrice} RSD</strong>
            <span>{dictionary["common.perDay"]}</span>
          </div>
        </div>
        <ul className="vehicle-card__facts" aria-label={dictionary["vehicle.features"]}>
          {vehicle.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        <div className="vehicle-card__actions">
          <Link className="button button--small" href={href}>
            {dictionary["action.viewVehicle"]} <ArrowIcon />
          </Link>
          <button
            className="vehicle-card__inquiry"
            type="button"
            data-inquiry-trigger
            data-vehicle-slug={vehicle.slug}
          >
            {dictionary["action.inquiry"]}
          </button>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const benefits = [1, 2, 3, 4].map((item) => ({
    number: String(item).padStart(2, "0"),
    title: dictionary[`home.benefits.item${item}Title` as keyof Dictionary],
    copy: dictionary[`home.benefits.item${item}Copy` as keyof Dictionary],
  }));
  const faqItems = [1, 2, 3, 4, 5, 6, 7, 8].map((item) => ({
    question: dictionary[`faq.q${item}` as keyof Dictionary],
    answer: dictionary[`faq.a${item}` as keyof Dictionary],
  }));
  let vehicles: LandingVehicle[] = [];
  let inquiryVehicles: InquiryVehicle[] = [];
  try {
    const [featuredVehicles, publicVehicles, unavailablePeriods] = await Promise.all([
      getFeaturedPublicVehicles(),
      getPublicVehicles(),
      getAcceptedReservationPeriods(),
    ]);
    vehicles = featuredVehicles
      .map((vehicle) => toLandingVehicle(vehicle, dictionary))
      .filter((vehicle): vehicle is LandingVehicle => vehicle !== null);
    inquiryVehicles = publicVehicles.map((vehicle) => ({
      slug: vehicle.slug,
      label: `${vehicle.make} ${vehicle.model}`,
      pricing: (vehicle.rc_vehicle_pricing_tiers ?? []).map((tier) => ({
        minDays: tier.min_days,
        maxDays: tier.max_days,
        priceRsd: tier.price_rsd,
        pricingMode: tier.pricing_mode,
      })),
      unavailablePeriods: unavailablePeriodsForVehicle(unavailablePeriods, vehicle.id),
    }));
  } catch (error) {
    console.error("Public vehicle catalog could not be loaded", error);
  }

  const vehiclesBySlug = new Map(vehicles.map((vehicle) => [vehicle.slug, vehicle]));
  const reviewVehicle = vehiclesBySlug.get("opel-insignia") ?? vehicles[2] ?? vehicles[0];
  const contactVehicle = vehiclesBySlug.get("skoda-rapid") ?? vehicles[0];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoRental"],
    name: "DDM Rent a Car",
    inLanguage: localeConfig[locale].htmlLang,
    image: "https://rentacarddm.rs/Logo/DDM-RC.png",
    url: new URL(localizedPath(locale), "https://rentacarddm.rs").toString(),
    telephone: "+381641334589",
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dr Svetislava Kasapinovića 9",
      addressLocality: "Novi Sad",
      postalCode: "21000",
      addressCountry: "RS",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "16:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "14:00",
      },
    ],
    sameAs: [
      "https://www.instagram.com/rentacarddm/",
      "https://www.facebook.com/ddmcompany/?locale=sr_RS",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteHeader locale={locale} dictionary={dictionary} />
      <main>
        <section className="hero" id="pocetna">
          <div className="hero__grid" aria-hidden="true" />
          <div className="page-shell hero__stage">
            <div className="hero__content">
              <p className="hero__kicker"><span>DDM Rent a Car</span> {dictionary["home.hero.kicker"]}</p>
              <h1>
                <span>{dictionary["home.hero.line1a"]} <i>{dictionary["home.hero.line1b"]}</i></span>
                <span className="hero__headline-dark">{dictionary["home.hero.line2a"]} <i>{dictionary["home.hero.line2b"]}</i></span>
              </h1>
              <p className="hero__copy">{dictionary["home.hero.copy"]}</p>
              <div className="hero__actions">
                <button className="button" type="button" data-inquiry-trigger>
                  {dictionary["action.inquiry"]} <ArrowIcon />
                </button>
                <div className="hero__phone">
                  <span>{dictionary["home.hero.quick"]}</span>
                  {dictionary["home.hero.noRegistration"]}
                </div>
              </div>
            </div>
            <div className="hero__vehicle">
              <div className="hero__vehicle-label" aria-hidden="true">
                <span>Golf 7</span>
                <small>{dictionary["home.hero.fleetLabel"]}</small>
              </div>
              <Image
                src="/golf7hero.png"
                alt="Volkswagen Golf 7 — DDM Rent a Car"
                width={1200}
                height={732}
                priority
                sizes="(max-width: 820px) 100vw, 62vw"
              />
              <span className="hero__ground" aria-hidden="true" />
            </div>
          </div>
          <div className="hero__information" aria-label={dictionary["home.info.label"]}>
            <div className="page-shell hero__information-inner">
            <div>
              <span>{dictionary["home.info.location"]}</span>
              <strong>Dr Svetislava Kasapinovića 9, Novi Sad</strong>
            </div>
            <div>
              <span>{dictionary["home.info.hours"]}</span>
              <strong>{dictionary["home.info.weekdays"]}<br />{dictionary["home.info.saturday"]}</strong>
            </div>
            <div>
              <span>{dictionary["home.info.inquiries"]}</span>
              <strong>{phoneDisplay}</strong>
            </div>
              <button type="button" data-inquiry-trigger>{dictionary["action.inquiry"]} <ArrowIcon /></button>
            </div>
          </div>
        </section>

        <section className="section section--fleet" id="vozila" data-index="01">
          <div className="page-shell">
            <div className="fleet-heading">
              <SectionIntro
                eyebrow={dictionary["home.fleet.eyebrow"]}
                title={dictionary["home.fleet.title"]}
                copy={dictionary["home.fleet.copy"]}
              />
              <p className="fleet-note">{dictionary["home.fleet.note"]}</p>
            </div>
            <div className="vehicle-grid">
              {vehicles.length ? (
                vehicles.map((vehicle) => <VehicleCard key={vehicle.slug} vehicle={vehicle} locale={locale} dictionary={dictionary} />)
              ) : (
                <div className="fleet-empty">
                  <strong>{dictionary["home.fleet.emptyTitle"]}</strong>
                  <span>{dictionary["home.fleet.emptyCopy"]}</span>
                </div>
              )}
            </div>
            <div className="fleet-cta">
              <p>{dictionary["home.fleet.partial"]}</p>
              <div className="fleet-cta__actions">
                <Link className="button button--small" href={localizedPath(locale, "/vozila")}>{dictionary["action.viewFleet"]} <ArrowIcon /></Link>
                <button className="text-link" type="button" data-inquiry-trigger>{dictionary["home.fleet.other"]} <ArrowIcon /></button>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--process" id="kako-funkcionise" data-index="02">
          <div className="page-shell">
            <SectionIntro
              eyebrow={dictionary["home.process.eyebrow"]}
              title={dictionary["home.process.title"]}
              copy={dictionary["home.process.copy"]}
            />
            <ol className="process-grid">
              <li>
                <span>01</span>
                <h3>{dictionary["home.process.step1Title"]}</h3>
                <p>{dictionary["home.process.step1Copy"]}</p>
              </li>
              <li>
                <span>02</span>
                <h3>{dictionary["home.process.step2Title"]}</h3>
                <p>{dictionary["home.process.step2Copy"]}</p>
              </li>
              <li>
                <span>03</span>
                <h3>{dictionary["home.process.step3Title"]}</h3>
                <p>{dictionary["home.process.step3Copy"]}</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="section section--benefits" id="prednosti" data-index="03">
          <div className="page-shell benefits-layout">
            <div className="benefits-copy">
              <SectionIntro
                eyebrow={dictionary["home.benefits.eyebrow"]}
                title={dictionary["home.benefits.title"]}
                copy={dictionary["home.benefits.copy"]}
              />
              <div className="benefit-list">
                {benefits.map((benefit) => (
                  <article key={benefit.number}>
                    <span aria-hidden="true">{benefit.number}</span>
                    <div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="benefits-collage" aria-label={dictionary["home.benefits.galleryLabel"]}>
              <div className="benefits-collage__main">
                <Image src="/team1.jpg" alt={dictionary["home.benefits.mainAlt"]} fill sizes="(max-width: 900px) 90vw, 31vw" />
              </div>
              <div className="benefits-collage__small">
                <Image src="/team.jpeg" alt={dictionary["home.benefits.smallAlt"]} fill sizes="(max-width: 900px) 90vw, 18vw" />
              </div>
            </div>
          </div>
        </section>

        <section className="section section--about" data-index="04">
          <div className="page-shell about-layout">
            <div className="about-image">
              <Image
                src="/slikaprostor1.JPG"
                alt={dictionary["home.about.alt"]}
                fill
                sizes="(max-width: 900px) 92vw, 46vw"
              />
            </div>
            <div className="about-copy">
              <p className="eyebrow">{dictionary["home.about.eyebrow"]}</p>
              <h2>{dictionary["home.about.title"]}</h2>
              <p className="section-copy">{dictionary["home.about.copy1"]}</p>
              <p className="section-copy">{dictionary["home.about.copy2"]}</p>
              <button className="button" type="button" data-inquiry-trigger>{dictionary["action.inquiry"]} <ArrowIcon /></button>
            </div>
          </div>
        </section>

        <section className="section section--review" aria-labelledby="review-title" data-index="05">
          <div className="page-shell review-layout">
            <div className="review-image">
              {reviewVehicle?.image ? (
                <Image src={reviewVehicle.image} alt={`${reviewVehicle.make} ${reviewVehicle.model} ${dictionary["home.review.imageAlt"]}`} fill sizes="(max-width: 900px) 92vw, 40vw" style={{ objectPosition: reviewVehicle.imagePosition ?? "center" }} />
              ) : (
                <span className="media-placeholder">{dictionary["common.fleet"]}</span>
              )}
            </div>
            <figure>
              <p className="eyebrow">{dictionary["home.review.eyebrow"]}</p>
              <h2 id="review-title">{dictionary["home.review.title"]}</h2>
              <div className="review-stars" aria-label={dictionary["home.review.stars"]}>★★★★★</div>
              <blockquote>{dictionary["home.review.quote"]}</blockquote>
              <figcaption>
                <strong>Aleksandr</strong>
                <span>{dictionary["home.review.source"]}</span>
              </figcaption>
              <a className="text-link" href={reviewsUrl} target="_blank" rel="noreferrer">
                {dictionary["home.review.link"]} <ArrowIcon />
              </a>
            </figure>
          </div>
        </section>

        <section className="section section--faq" id="faq" data-index="06">
          <div className="page-shell faq-panel">
          <div className="faq-layout">
            <div className="faq-intro-shell">
              <div className="faq-intro">
                <p className="eyebrow">{dictionary["home.faq.eyebrow"]}</p>
                <h2>{dictionary["home.faq.title"]}</h2>
                <p className="section-copy">{dictionary["home.faq.copy"]}</p>
                <button className="text-link" type="button" data-inquiry-trigger>{dictionary["home.faq.other"]} <ArrowIcon /></button>
              </div>
            </div>
            <FAQ items={faqItems} />
          </div>
          </div>
        </section>

        <section className="section section--contact" id="kontakt" data-index="07">
          <div
            className="page-shell contact-card"
            style={contactVehicle?.image ? { backgroundImage: `url("${contactVehicle.image}")` } : undefined}
          >
            <div className="contact-card__backdrop" aria-hidden="true" />
            <div className="contact-card__intro">
              <p className="eyebrow eyebrow--light">{dictionary["home.contact.eyebrow"]}</p>
              <h2>{dictionary["home.contact.title"]}</h2>
              <p>{dictionary["home.contact.copy"]}</p>
              <div className="contact-card__actions">
                <button className="button button--white" type="button" data-inquiry-trigger>{dictionary["action.inquiry"]} <ArrowIcon /></button>
              </div>
            </div>
            <div className="contact-details">
              <article>
                <span>01 · {dictionary["home.contact.address"]}</span>
                <h3>Dr Svetislava Kasapinovića 9</h3>
                <p>{dictionary["home.contact.country"]}</p>
                <a href={mapsUrl} target="_blank" rel="noreferrer">{dictionary["home.contact.maps"]} <ArrowIcon /></a>
              </article>
              <article>
                <span>02 · {dictionary["home.contact.hours"]}</span>
                <h3>{dictionary["home.contact.weekdays"]}</h3>
                <p>{dictionary["home.contact.weekend"]}</p>
              </article>
              <article>
                <span>03 · {dictionary["home.contact.phones"]}</span>
                <a className="contact-details__phone" href="tel:+381212700017">+381 21 270 0017</a>
                <a className="contact-details__phone" href="tel:+381603001633">+381 60 300 1633</a>
              </article>
              <article>
                <span>04 · {dictionary["home.contact.follow"]}</span>
                <div className="social-links">
                  <a href="https://www.instagram.com/rentacarddm/" target="_blank" rel="noreferrer">Instagram <ArrowIcon /></a>
                  <a href="https://www.facebook.com/ddmcompany/?locale=sr_RS" target="_blank" rel="noreferrer">Facebook <ArrowIcon /></a>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} dictionary={dictionary} />
      <FloatingInquiryButton waitForHero dictionary={dictionary} />
      <InquiryModal vehicles={inquiryVehicles} locale={locale} dictionary={dictionary} />
    </>
  );
}

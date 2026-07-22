import Image from "next/image";
import Link from "next/link";
import { fuelLabels } from "@/lib/admin/types";
import { getAcceptedReservationPeriods, getFeaturedPublicVehicles, getPublicVehicles, unavailablePeriodsForVehicle, vehicleImageUrl } from "@/lib/admin/data";
import type { Vehicle as DatabaseVehicle } from "@/lib/admin/types";
import FAQ from "./components/faq";
import FloatingInquiryButton from "./components/floating-inquiry-button";
import InquiryModal, { type InquiryVehicle } from "./components/inquiry-modal";
import SiteHeader from "./components/site-header";

const phoneDisplay = "+381 64 133 4589";
const phoneHref = "tel:+381641334589";
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

function toLandingVehicle(vehicle: DatabaseVehicle): LandingVehicle | null {
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
    facts: [
      `${vehicle.engine} ${fuelLabels[vehicle.fuel_type].toLocaleLowerCase("sr-Latn")}`,
      vehicle.transmission === "manual" ? "Manuelni" : "Automatski",
      `${vehicle.seats} sedišta`,
    ],
  };
}

function displayPrice(price: number) {
  return new Intl.NumberFormat("sr-RS").format(price);
}

const benefits = [
  {
    number: "01",
    title: "Neograničena kilometraža",
    copy: "Kilometraža nije ograničena.",
  },
  {
    number: "02",
    title: "Kasko osigurana vozila",
    copy: "Sva vozila su kasko osigurana i redovno servisirana.",
  },
  {
    number: "03",
    title: "Putovanje u inostranstvo",
    copy: "Vozilom možete u inostranstvo uz prethodni dogovor.",
  },
  {
    number: "04",
    title: "DDM servisni tim",
    copy: "Vozila priprema i održava naš tim u Novom Sadu.",
  },
];

const faqItems = [
  {
    question: "Ko može da iznajmi vozilo?",
    answer:
      "Minimalna starost vozača je 25 godina. Prilikom preuzimanja potrebno je pokazati važeću vozačku dozvolu i identifikacioni dokument.",
  },
  {
    question: "Koliki je depozit?",
    answer: "Depozit za svako vozilo iznosi 36.000 RSD.",
  },
  {
    question: "Da li je kilometraža ograničena?",
    answer: "Ne. Najam uključuje neograničenu kilometražu.",
  },
  {
    question: "Mogu li vozilom u inostranstvo?",
    answer: "Da, uz prethodni dogovor i pripremljenu dokumentaciju.",
  },
  {
    question: "Kakva je politika goriva?",
    answer:
      "Vozilo preuzimate sa punim rezervoarom i vraćate ga sa punim rezervoarom. Ako rezervoar nije pun, naplaćuje se 500 RSD za odlazak na pumpu, kao i sipano gorivo.",
  },
  {
    question: "Da li su vozila osigurana?",
    answer: "Da. Sva vozila su kasko osigurana. Detalje pokrića dobijate pre preuzimanja.",
  },
  {
    question: "Kako saznajem cenu i slobodan termin?",
    answer:
      "Izaberite vozilo i datume u online upitu. Iznos se računa odmah, a DDM tim potvrđuje dostupnost.",
  },
  {
    question: "Koliko košta pranje vozila?",
    answer:
      "Pranje se naplaćuje 1.200 RSD za sva vozila osim Hyundai H1. Za Hyundai H1 pranje iznosi 1.800 RSD.",
  },
];

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

function VehicleCard({ vehicle }: { vehicle: LandingVehicle }) {
  return (
    <article className="vehicle-card" id={vehicle.slug}>
      <Link className="vehicle-card__image" href={`/vozila/${vehicle.slug}`} aria-label={`Pogledaj ${vehicle.make} ${vehicle.model}`}>
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
              alt={`${vehicle.make} ${vehicle.model} iz DDM Rent a Car ponude`}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
              style={{ objectPosition: vehicle.imagePosition ?? "center" }}
            />
          </>
        ) : (
          <span className="vehicle-card__image-placeholder">DDM / fotografija vozila</span>
        )}
      </Link>
      <div className="vehicle-card__body">
        <div className="vehicle-card__heading">
          <div>
            <span>{vehicle.make}</span>
            <h3>{vehicle.model}</h3>
          </div>
          <div className="vehicle-card__price">
            <small>od</small>
            <strong>{displayPrice(vehicle.dailyPrice)} RSD</strong>
            <span>/ dan</span>
          </div>
        </div>
        <ul className="vehicle-card__facts" aria-label="Karakteristike vozila">
          {vehicle.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        <div className="vehicle-card__actions">
          <Link className="button button--small" href={`/vozila/${vehicle.slug}`}>
            Pogledaj vozilo <ArrowIcon />
          </Link>
          <button
            className="vehicle-card__inquiry"
            type="button"
            data-inquiry-trigger
            data-vehicle-slug={vehicle.slug}
          >
            Pošalji upit
          </button>
        </div>
      </div>
    </article>
  );
}

export default async function Home() {
  let vehicles: LandingVehicle[] = [];
  let inquiryVehicles: InquiryVehicle[] = [];
  try {
    const [featuredVehicles, publicVehicles, unavailablePeriods] = await Promise.all([
      getFeaturedPublicVehicles(),
      getPublicVehicles(),
      getAcceptedReservationPeriods(),
    ]);
    vehicles = featuredVehicles
      .map(toLandingVehicle)
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
  const aboutVehicle = vehiclesBySlug.get("skoda-rapid") ?? vehicles[1] ?? vehicles[0];
  const reviewVehicle = vehiclesBySlug.get("opel-insignia") ?? vehicles[2] ?? vehicles[0];
  const contactVehicle = vehiclesBySlug.get("skoda-rapid") ?? vehicles[0];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoRental"],
    name: "DDM Rent a Car",
    image: "https://rentacarddm.rs/Logo/DDM-RC.png",
    url: "https://rentacarddm.rs",
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
      <SiteHeader />
      <main>
        <section className="hero" id="pocetna">
          <div className="hero__grid" aria-hidden="true" />
          <div className="page-shell hero__stage">
            <div className="hero__content">
              <p className="hero__kicker"><span>DDM Rent a Car</span> Novi Sad</p>
              <h1>
                <span>Spremni za <i>grad.</i></span>
                <span className="hero__headline-dark">Spremni za <i>put.</i></span>
              </h1>
              <p className="hero__copy">
                Uredna vozila, poznate cene i direktan dogovor sa našim timom u Novom Sadu.
              </p>
              <div className="hero__actions">
                <button className="button" type="button" data-inquiry-trigger>
                  Pošalji upit <ArrowIcon />
                </button>
                <div className="hero__phone">
                  <span>Brz online upit</span>
                  Bez registracije
                </div>
              </div>
            </div>
            <div className="hero__vehicle">
              <div className="hero__vehicle-label" aria-hidden="true">
                <span>Golf 7</span>
                <small>DDM flota / 01</small>
              </div>
              <Image
                src="/golf7hero.png"
                alt="Beli Volkswagen Golf 7 iz DDM Rent a Car ponude"
                width={1200}
                height={732}
                priority
                sizes="(max-width: 820px) 100vw, 62vw"
              />
              <span className="hero__ground" aria-hidden="true" />
            </div>
          </div>
          <div className="hero__information" aria-label="Brzi kontakt">
            <div className="page-shell hero__information-inner">
            <div>
              <span>Lokacija</span>
              <strong>Dr Svetislava Kasapinovića 9, Novi Sad</strong>
            </div>
            <div>
              <span>Radno vreme</span>
              <strong>Radnim danima 08-16h<br />Subotom 08-14h</strong>
            </div>
            <div>
              <span>Upiti i informacije</span>
              <strong>{phoneDisplay}</strong>
            </div>
              <button type="button" data-inquiry-trigger>Pošalji upit <ArrowIcon /></button>
            </div>
          </div>
        </section>

        <section className="section section--fleet" id="vozila" data-index="01">
          <div className="page-shell">
            <div className="fleet-heading">
              <SectionIntro
                eyebrow="Aktuelna ponuda"
                title="Izaberite vozilo."
                copy="U ponudi su gradski automobili, limuzine, karavani i putnički kombi. Izaberite vozilo i unesite željeni termin."
              />
              <p className="fleet-note">Cena zavisi od vozila i broja dana. Dostupnost potvrđujemo nakon slanja upita.</p>
            </div>
            <div className="vehicle-grid">
              {vehicles.length ? (
                vehicles.map((vehicle) => <VehicleCard key={vehicle.slug} vehicle={vehicle} />)
              ) : (
                <div className="fleet-empty">
                  <strong>Ponuda se trenutno osvežava.</strong>
                  <span>Pošaljite upit i DDM tim će vam preporučiti dostupno vozilo.</span>
                </div>
              )}
            </div>
            <div className="fleet-cta">
              <p>Ovde je prikazan deo flote.</p>
              <div className="fleet-cta__actions">
                <Link className="button button--small" href="/vozila">Pogledaj celu flotu <ArrowIcon /></Link>
                <button className="text-link" type="button" data-inquiry-trigger>Pošaljite upit za drugo vozilo <ArrowIcon /></button>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--process" id="kako-funkcionise" data-index="02">
          <div className="page-shell">
            <SectionIntro
              eyebrow="Jednostavan najam"
              title="Od izbora do ključeva u tri koraka."
              copy="Izaberite vozilo, unesite datume i ostavite kontakt. Odgovaramo nakon provere termina."
            />
            <ol className="process-grid">
              <li>
                <span>01</span>
                <h3>Izaberite vozilo</h3>
                <p>Pregledajte flotu i izaberite auto koji vam odgovara.</p>
              </li>
              <li>
                <span>02</span>
                <h3>Javite nam datume</h3>
                <p>Unesite datum preuzimanja i vraćanja.</p>
              </li>
              <li>
                <span>03</span>
                <h3>Preuzmite i krenite</h3>
                <p>Nakon potvrde termina dogovaramo preuzimanje u Novom Sadu.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="section section--benefits" id="prednosti" data-index="03">
          <div className="page-shell benefits-layout">
            <div className="benefits-copy">
              <SectionIntro
                eyebrow="Zašto DDM"
                title="Vozila održavamo mi."
                copy="DDM se svakodnevno bavi servisom i održavanjem automobila. Ista ekipa priprema i rent-a-car vozila."
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
            <div className="benefits-collage" aria-label="DDM usluga i vozila">
              <div className="benefits-collage__main">
                <Image src="/team1.jpg" alt="Ulaz u DDM Company servis u Novom Sadu" fill sizes="(max-width: 900px) 90vw, 31vw" />
              </div>
              <div className="benefits-collage__small">
                <Image src="/team.jpeg" alt="Radionica DDM Company automobilskog tima" fill sizes="(max-width: 900px) 90vw, 18vw" />
              </div>
            </div>
          </div>
        </section>

        <section className="section section--about" data-index="04">
          <div className="page-shell about-layout">
            <div className="about-image">
              {aboutVehicle?.image ? (
                <Image src={aboutVehicle.image} alt={`${aboutVehicle.make} ${aboutVehicle.model} iz DDM Rent a Car flote`} fill sizes="(max-width: 900px) 92vw, 46vw" style={{ objectPosition: aboutVehicle.imagePosition ?? "center" }} />
              ) : (
                <span className="media-placeholder">DDM flota</span>
              )}
            </div>
            <div className="about-copy">
              <p className="eyebrow">O nama</p>
              <h2>DDM Company, Novi Sad.</h2>
              <p className="section-copy">
                DDM Company se bavi servisom, održavanjem, prodajom i iznajmljivanjem automobila u
                Novom Sadu. Vozila za najam priprema naš servisni tim.
              </p>
              <p className="section-copy">
                Ako imate pitanje pre ili tokom najma, razgovarate direktno sa nama.
              </p>
              <button className="button" type="button" data-inquiry-trigger>Pošalji upit <ArrowIcon /></button>
            </div>
          </div>
        </section>

        <section className="section section--review" aria-labelledby="review-title" data-index="05">
          <div className="page-shell review-layout">
            <div className="review-image">
              {reviewVehicle?.image ? (
                <Image src={reviewVehicle.image} alt={`${reviewVehicle.make} ${reviewVehicle.model} iz DDM Rent a Car flote`} fill sizes="(max-width: 900px) 92vw, 40vw" style={{ objectPosition: reviewVehicle.imagePosition ?? "center" }} />
              ) : (
                <span className="media-placeholder">DDM flota</span>
              )}
            </div>
            <figure>
              <p className="eyebrow">Iskustvo klijenata</p>
              <h2 id="review-title">Šta kažu klijenti.</h2>
              <div className="review-stars" aria-label="Pet zvezdica">★★★★★</div>
              <blockquote>
                „Koristio sam DDM rent-a-car pre kupovine sopstvenog automobila. Sva vozila bila su
                u dobrom stanju, a cene pristupačne.“
              </blockquote>
              <figcaption>
                <strong>Aleksandr</strong>
                <span>Google recenzija · prevedeno sa ruskog</span>
              </figcaption>
              <a className="text-link" href={reviewsUrl} target="_blank" rel="noreferrer">
                Pogledajte recenzije na Google-u <ArrowIcon />
              </a>
            </figure>
          </div>
        </section>

        <section className="section section--faq" id="faq" data-index="06">
          <div className="page-shell faq-panel">
          <div className="faq-layout">
            <div className="faq-intro-shell">
              <div className="faq-intro">
                <p className="eyebrow">Pre nego što krenete</p>
                <h2>Najčešća pitanja.</h2>
                <p className="section-copy">Ovde su osnovni uslovi najma. Za konkretno vozilo i termin pošaljite upit.</p>
                <button className="text-link" type="button" data-inquiry-trigger>Imate drugo pitanje? Pošaljite upit <ArrowIcon /></button>
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
              <p className="eyebrow eyebrow--light">Kontakt i lokacija</p>
              <h2>Proverite vozilo i termin.</h2>
              <p>Izaberite vozilo, unesite datume i ostavite kontakt. Javićemo vam da li je termin slobodan.</p>
              <div className="contact-card__actions">
                <button className="button button--white" type="button" data-inquiry-trigger>Pošalji upit <ArrowIcon /></button>
              </div>
            </div>
            <div className="contact-details">
              <article>
                <span>01 · Adresa</span>
                <h3>Dr Svetislava Kasapinovića 9</h3>
                <p>21000 Novi Sad, Srbija</p>
                <a href={mapsUrl} target="_blank" rel="noreferrer">Otvori u Google mapama <ArrowIcon /></a>
              </article>
              <article>
                <span>02 · Radno vreme</span>
                <h3>Radnim danima: 08-16h</h3>
                <p>Subotom: 08-14h · Nedeljom ne radimo</p>
              </article>
              <article>
                <span>03 · Dodatni telefoni</span>
                <a className="contact-details__phone" href="tel:+381212700017">+381 21 270 0017</a>
                <a className="contact-details__phone" href="tel:+381603001633">+381 60 300 1633</a>
              </article>
              <article>
                <span>04 · Pratite DDM</span>
                <div className="social-links">
                  <a href="https://www.instagram.com/rentacarddm/" target="_blank" rel="noreferrer">Instagram <ArrowIcon /></a>
                  <a href="https://www.facebook.com/ddmcompany/?locale=sr_RS" target="_blank" rel="noreferrer">Facebook <ArrowIcon /></a>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="page-shell footer__top">
          <div>
            <div className="footer__logo">
              <Image src="/Logo/DDM-RC.png" alt="DDM Company" width={946} height={392} sizes="220px" />
            </div>
            <p>Iznajmljivanje vozila u Novom Sadu. Za termin i dostupnost pošaljite online upit.</p>
          </div>
          <div>
            <strong>Navigacija</strong>
            <a href="#vozila">Vozila</a>
            <a href="#prednosti">Prednosti</a>
            <a href="#kako-funkcionise">Kako funkcioniše</a>
            <a href="#faq">Česta pitanja</a>
          </div>
          <div>
            <strong>Kontakt</strong>
            <a href={phoneHref}>{phoneDisplay}</a>
            <a href={`mailto:${email}`}>{email}</a>
            <a href={mapsUrl} target="_blank" rel="noreferrer">Dr Svetislava Kasapinovića 9</a>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="page-shell">
            <span>© {new Date().getFullYear()} DDM Company. Sva prava zadržana.</span>
            <span>Novi Sad, Srbija</span>
          </div>
        </div>
      </footer>

      <FloatingInquiryButton waitForHero />
      <InquiryModal vehicles={inquiryVehicles} />
    </>
  );
}

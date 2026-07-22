import Image from "next/image";
import Link from "next/link";

const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Dr+Svetislava+Kasapinovi%C4%87a+9%2C+Novi+Sad";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="page-shell footer__top">
        <div>
          <Link className="footer__logo" href="/" aria-label="DDM Rent a Car početna strana">
            <Image src="/Logo/DDM-RC.png" alt="DDM Company" width={946} height={392} sizes="220px" />
          </Link>
          <p>Iznajmljivanje vozila u Novom Sadu. Za termin i dostupnost pošaljite online upit.</p>
        </div>
        <div>
          <strong>Navigacija</strong>
          <Link href="/vozila">Vozila</Link>
          <Link href="/#prednosti">Prednosti</Link>
          <Link href="/#kako-funkcionise">Kako funkcioniše</Link>
          <Link href="/#faq">Česta pitanja</Link>
        </div>
        <div>
          <strong>Kontakt</strong>
          <a href="tel:+381641334589">+381 64 133 4589</a>
          <a href="mailto:ddmcompany@gmail.com">ddmcompany@gmail.com</a>
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
  );
}

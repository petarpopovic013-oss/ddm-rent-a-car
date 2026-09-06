import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/translations";

const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Dr+Svetislava+Kasapinovi%C4%87a+9%2C+Novi+Sad";

export default function SiteFooter({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  return (
    <footer className="footer">
      <div className="page-shell footer__top">
        <div>
          <Link className="footer__logo" href={localizedPath(locale)} aria-label={dictionary["header.home"]}>
            <Image src="/Logo/DDM-RC.png" alt="DDM Company" width={946} height={392} sizes="220px" />
          </Link>
          <p>{dictionary["footer.copy"]}</p>
        </div>
        <div>
          <strong>{dictionary["footer.navigation"]}</strong>
          <Link href={localizedPath(locale, "/vozila")}>{dictionary["footer.vehicles"]}</Link>
          <Link href={localizedPath(locale, "/#prednosti")}>{dictionary["footer.benefits"]}</Link>
          <Link href={localizedPath(locale, "/#kako-funkcionise")}>{dictionary["footer.process"]}</Link>
          <Link href={localizedPath(locale, "/#faq")}>{dictionary["footer.faq"]}</Link>
        </div>
        <div>
          <strong>{dictionary["footer.network"]}</strong>
          <a href="https://ddmcompany.rs" target="_blank" rel="noopener noreferrer">DDM Company</a>
          <a href="https://povuci.rs" target="_blank" rel="noopener noreferrer">Povuci.rs</a>
          <a href="https://keeway.rs" target="_blank" rel="noopener noreferrer">Keeway Srbija</a>
          <a href="https://morbidelli.rs" target="_blank" rel="noopener noreferrer">Morbidelli</a>
        </div>
        <div>
          <strong>{dictionary["footer.contact"]}</strong>
          <a href="tel:+381641334589">+381 64 133 4589</a>
          <a href="mailto:ddmcompany@gmail.com">ddmcompany@gmail.com</a>
          <a href={mapsUrl} target="_blank" rel="noreferrer">Dr Svetislava Kasapinovića 9</a>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="page-shell">
          <span>© {new Date().getFullYear()} DDM Company. {dictionary["footer.rights"]}</span>
          <span>{dictionary["footer.location"]}</span>
        </div>
      </div>
    </footer>
  );
}

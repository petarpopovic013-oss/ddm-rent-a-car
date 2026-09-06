"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/translations";
import LanguageSelector from "./language-selector";

export default function SiteHeader({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const [open, setOpen] = useState(false);
  const navItems = [
    [dictionary["nav.fleet"], localizedPath(locale, "/vozila")],
    [dictionary["nav.benefits"], localizedPath(locale, "/#prednosti")],
    [dictionary["nav.process"], localizedPath(locale, "/#kako-funkcionise")],
    [dictionary["nav.faq"], localizedPath(locale, "/#faq")],
    [dictionary["nav.contact"], localizedPath(locale, "/#kontakt")],
  ];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="header">
        <div className="page-shell header__inner">
          <Link className="header__logo" href={localizedPath(locale)} aria-label={dictionary["header.home"]}>
            <Image src="/Logo/DDM-RC.png" alt="DDM Company" width={946} height={392} priority sizes="190px" />
          </Link>
          <nav className="header__nav" aria-label={dictionary["header.mainNav"]}>
            {navItems.map(([label, href]) => (
              <Link href={href} key={href}>{label}</Link>
            ))}
          </nav>
          <LanguageSelector locale={locale} dictionary={dictionary} />
          <button className="button button--header" type="button" data-inquiry-trigger>
            {dictionary["action.inquiry"]} <span aria-hidden="true">↗</span>
          </button>
          <button
            className="menu-button"
            type="button"
            onClick={() => setOpen(true)}
            aria-label={dictionary["header.openMenu"]}
            aria-expanded={open}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      {open && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label={dictionary["header.mobileNav"]}>
          <button className="mobile-menu__backdrop" aria-label={dictionary["header.closeMenu"]} onClick={() => setOpen(false)} />
          <div className="mobile-menu__panel">
            <div className="mobile-menu__top">
              <Image src="/Logo/DDM-RC.png" alt="DDM Company" width={946} height={392} sizes="170px" />
              <button type="button" onClick={() => setOpen(false)} aria-label={dictionary["header.closeMenu"]}>×</button>
            </div>
            <nav aria-label={dictionary["header.mobileNav"]}>
              {navItems.map(([label, href], index) => (
                <Link href={href} key={href} onClick={() => setOpen(false)}>
                  <span>0{index + 1}</span>{label}
                </Link>
              ))}
            </nav>
            <LanguageSelector locale={locale} dictionary={dictionary} mobile />
            <div className="mobile-menu__contact">
              <span>{dictionary["header.inquiries"]}</span>
              <a href="tel:+381641334589">+381 64 133 4589</a>
              <a href="mailto:ddmcompany@gmail.com">ddmcompany@gmail.com</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

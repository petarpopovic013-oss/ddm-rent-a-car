"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  ["Flota", "/vozila"],
  ["Prednosti", "/#prednosti"],
  ["Kako funkcioniše", "/#kako-funkcionise"],
  ["FAQ", "/#faq"],
  ["Kontakt", "/#kontakt"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

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
          <Link className="header__logo" href="/" aria-label="DDM Rent a Car početna strana">
            <Image src="/Logo/DDM-RC.png" alt="DDM Company" width={946} height={392} priority sizes="190px" />
          </Link>
          <nav className="header__nav" aria-label="Glavna navigacija">
            {navItems.map(([label, href]) => (
              <Link href={href} key={href}>{label}</Link>
            ))}
          </nav>
          <button className="button button--header" type="button" data-inquiry-trigger>
            Pošalji upit <span aria-hidden="true">↗</span>
          </button>
          <button
            className="menu-button"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Otvori meni"
            aria-expanded={open}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      {open && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobilna navigacija">
          <button className="mobile-menu__backdrop" aria-label="Zatvori meni" onClick={() => setOpen(false)} />
          <div className="mobile-menu__panel">
            <div className="mobile-menu__top">
              <Image src="/Logo/DDM-RC.png" alt="DDM Company" width={946} height={392} sizes="170px" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Zatvori meni">×</button>
            </div>
            <nav aria-label="Mobilna navigacija">
              {navItems.map(([label, href], index) => (
                <Link href={href} key={href} onClick={() => setOpen(false)}>
                  <span>0{index + 1}</span>{label}
                </Link>
              ))}
            </nav>
            <div className="mobile-menu__contact">
              <span>Upiti i informacije</span>
              <a href="tel:+381641334589">+381 64 133 4589</a>
              <a href="mailto:ddmcompany@gmail.com">ddmcompany@gmail.com</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

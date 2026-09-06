"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  localeConfig,
  locales,
  localizedPath,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/translations";

function FlagIcon({ locale }: { locale: Locale }) {
  if (locale === "sr") {
    return <svg viewBox="0 0 30 20" aria-hidden="true"><path fill="#c6363c" d="M0 0h30v6.67H0z"/><path fill="#0c4076" d="M0 6.67h30v6.66H0z"/><path fill="#fff" d="M0 13.33h30V20H0z"/><path fill="#fff" d="M7.2 5.1h4.7v7.4H7.2z"/><path fill="#c6363c" d="M8.1 6h2.9v5.4H8.1z"/></svg>;
  }
  if (locale === "en") {
    return <svg viewBox="0 0 30 20" aria-hidden="true"><path fill="#21468b" d="M0 0h30v20H0z"/><path stroke="#fff" strokeWidth="4" d="M0 0l30 20M30 0L0 20"/><path stroke="#c8102e" strokeWidth="2" d="M0 0l30 20M30 0L0 20"/><path fill="#fff" d="M12 0h6v20h-6zM0 7h30v6H0z"/><path fill="#c8102e" d="M13 0h4v20h-4zM0 8h30v4H0z"/></svg>;
  }
  if (locale === "de") {
    return <svg viewBox="0 0 30 20" aria-hidden="true"><path d="M0 0h30v6.67H0z"/><path fill="#d00" d="M0 6.67h30v6.66H0z"/><path fill="#ffce00" d="M0 13.33h30V20H0z"/></svg>;
  }
  return <svg viewBox="0 0 30 20" aria-hidden="true"><path fill="#fff" d="M0 0h30v6.67H0z"/><path fill="#0039a6" d="M0 6.67h30v6.66H0z"/><path fill="#d52b1e" d="M0 13.33h30V20H0z"/></svg>;
}

export default function LanguageSelector({
  locale,
  dictionary,
  mobile = false,
}: {
  locale: Locale;
  dictionary: Dictionary;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const publicPath = stripLocalePrefix(pathname);
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const suffix = `${window.location.search}${window.location.hash}`;
    if (!suffix) return;
    event.preventDefault();
    router.push(`${href}${suffix}`);
  };

  if (mobile) {
    return (
      <div className="mobile-language" aria-label={dictionary["language.selector"]}>
        <strong>{dictionary["language.selector"]}</strong>
        <div>
          {locales.map((item) => {
            const href = localizedPath(item, publicPath);
            return (
              <a
                href={href}
                key={item}
                aria-current={item === locale ? "page" : undefined}
                onClick={(event) => navigate(event, href)}
              >
                <FlagIcon locale={item} />
                <span>{localeConfig[item].label}</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="language-selector" ref={containerRef}>
      <button
        type="button"
        className="language-selector__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label={`${dictionary["language.current"]}: ${localeConfig[locale].label}. ${dictionary["language.selector"]}`}
        aria-expanded={open}
      >
        <FlagIcon locale={locale} />
        <span>{localeConfig[locale].shortLabel}</span>
        <b aria-hidden="true">⌄</b>
      </button>
      {open && (
        <div className="language-selector__menu" aria-label={dictionary["language.selector"]}>
          {locales.map((item) => {
            const href = localizedPath(item, publicPath);
            return (
              <a
                href={href}
                key={item}
                aria-current={item === locale ? "page" : undefined}
                onClick={(event) => navigate(event, href)}
              >
                <FlagIcon locale={item} />
                <span>{localeConfig[item].label}</span>
                {item === locale && <b aria-hidden="true">✓</b>}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

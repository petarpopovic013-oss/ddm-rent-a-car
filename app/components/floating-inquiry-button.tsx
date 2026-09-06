"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/translations";

export default function FloatingInquiryButton({
  waitForHero = false,
  vehicleSlug,
  dictionary,
}: {
  waitForHero?: boolean;
  vehicleSlug?: string;
  dictionary: Dictionary;
}) {
  const [visible, setVisible] = useState(!waitForHero);

  useEffect(() => {
    if (!waitForHero) return;

    const hero = document.querySelector(".hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [waitForHero]);

  return (
    <div
      className={`mobile-contact ${visible ? "mobile-contact--visible" : "mobile-contact--waiting"}`}
      aria-hidden={!visible}
    >
      <button
        type="button"
        data-inquiry-trigger
        data-vehicle-slug={vehicleSlug}
        tabIndex={visible ? 0 : -1}
      >
        {dictionary["action.inquiry"]} <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}

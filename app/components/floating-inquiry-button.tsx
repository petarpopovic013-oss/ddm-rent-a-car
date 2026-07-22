"use client";

import { useEffect, useState } from "react";

export default function FloatingInquiryButton({
  waitForHero = false,
  vehicleSlug,
}: {
  waitForHero?: boolean;
  vehicleSlug?: string;
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
        Pošalji upit <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}

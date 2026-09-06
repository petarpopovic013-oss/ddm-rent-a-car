"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/translations";

export default function VehicleGallery({
  images,
  vehicleName,
  dictionary,
}: {
  images: string[];
  vehicleName: string;
  dictionary: Dictionary;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  return (
    <div
      className="vehicle-carousel"
      tabIndex={0}
      aria-label={`${dictionary["gallery.label"]} ${vehicleName}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") showPrevious();
        if (event.key === "ArrowRight") showNext();
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (startX == null || endX == null || images.length < 2) return;
        const distance = endX - startX;
        if (Math.abs(distance) < 42) return;
        if (distance > 0) showPrevious();
        else showNext();
      }}
    >
      <div className="vehicle-carousel__main">
        <Image
          key={images[activeIndex]}
          src={images[activeIndex]}
          alt={`${vehicleName}, ${dictionary["gallery.photo"]} ${activeIndex + 1}`}
          fill
          sizes="(max-width: 900px) 100vw, 1100px"
          priority={activeIndex === 0}
        />
        {images.length > 1 && (
          <>
            <button type="button" className="vehicle-carousel__arrow vehicle-carousel__arrow--previous" onClick={showPrevious} aria-label={dictionary["gallery.previous"]}>←</button>
            <button type="button" className="vehicle-carousel__arrow vehicle-carousel__arrow--next" onClick={showNext} aria-label={dictionary["gallery.next"]}>→</button>
          </>
        )}
        <span className="vehicle-carousel__counter" aria-live="polite">{activeIndex + 1} / {images.length}</span>
      </div>

      {images.length > 1 && (
        <div className="vehicle-carousel__thumbnails" aria-label={dictionary["gallery.photos"]}>
          {images.map((image, index) => (
            <button
              type="button"
              className={index === activeIndex ? "vehicle-carousel__thumbnail vehicle-carousel__thumbnail--active" : "vehicle-carousel__thumbnail"}
              onClick={() => setActiveIndex(index)}
              aria-label={`${dictionary["gallery.show"]} ${index + 1}`}
              aria-pressed={index === activeIndex}
              key={image}
            >
              <Image src={image} alt="" fill sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

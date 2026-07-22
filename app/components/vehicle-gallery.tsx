"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

export default function VehicleGallery({
  images,
  vehicleName,
}: {
  images: string[];
  vehicleName: string;
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
      aria-label={`Galerija vozila ${vehicleName}`}
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
          alt={`${vehicleName}, fotografija ${activeIndex + 1}`}
          fill
          sizes="(max-width: 900px) 100vw, 1100px"
          priority={activeIndex === 0}
        />
        {images.length > 1 && (
          <>
            <button type="button" className="vehicle-carousel__arrow vehicle-carousel__arrow--previous" onClick={showPrevious} aria-label="Prethodna fotografija">←</button>
            <button type="button" className="vehicle-carousel__arrow vehicle-carousel__arrow--next" onClick={showNext} aria-label="Sledeća fotografija">→</button>
          </>
        )}
        <span className="vehicle-carousel__counter" aria-live="polite">{activeIndex + 1} / {images.length}</span>
      </div>

      {images.length > 1 && (
        <div className="vehicle-carousel__thumbnails" aria-label="Fotografije vozila">
          {images.map((image, index) => (
            <button
              type="button"
              className={index === activeIndex ? "vehicle-carousel__thumbnail vehicle-carousel__thumbnail--active" : "vehicle-carousel__thumbnail"}
              onClick={() => setActiveIndex(index)}
              aria-label={`Prikaži fotografiju ${index + 1}`}
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

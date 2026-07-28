"use client";
import { useState, type MouseEvent } from "react";
import Image from "next/image";

const DEFAULT_ASSETS = [
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    title: "Sunset Beach",
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
    title: "Misty Mountains",
  },
  {
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
    title: "Forest Trail",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80",
    title: "Sunlight Woods",
  },
  {
    src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80",
    title: "Green Hills",
  },
];

interface CardCarouselProps {
  readonly className?: string;
  readonly images?: ReadonlyArray<Readonly<{ src: string; title: string }>>;
}

export default function CardCarousel({
  className = "",
  images = DEFAULT_ASSETS,
}: CardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(2);

  const toPrev = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const toNext = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActiveIndex((prev) => Math.min(images.length - 1, prev + 1));
  };

  const toSlide = (e: MouseEvent<HTMLElement>, index: number) => {
    e.stopPropagation();
    setActiveIndex(index);
  };

  const slideWidth = 160;

  return (
    <div>
      <div
        style={{
          width: "180px",
          height: "180px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: `${images.length * slideWidth}px`,
            transform: `translateX(${-activeIndex * slideWidth}px)`,
            transition: "transform 0.35s ease",
          }}
        >
          {images.map((item, i) => {
            const isActive = activeIndex === i;
            const scale = isActive ? 1.04 : 0.9;

            return (
              <div
                key={item.title}
                style={{
                  width: `${slideWidth}px`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transform: `scale(${scale})`,
                  transition: "transform 0.3s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: isActive ? "#ffffff" : "#d1d5db",
                    minHeight: "16px",
                  }}
                >
                  {item.title}
                </div>

                <button
                  type="button"
                  aria-label={`View ${item.title}`}
                  onClick={(e) => toSlide(e, i)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  <Image
                    src={item.src}
                    alt={item.title}
                    width={110}
                    height={110}
                    unoptimized
                    style={{
                      width: "110px",
                      height: "110px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 10px",
          borderRadius: "999px",
          background: "rgba(17,24,39,0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          type="button"
          aria-label="Show previous slide"
          onClick={toPrev}
          style={{
            border: "none",
            background: "transparent",
            color: "#f3f4f6",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          ←
        </button>
        <div style={{ display: "flex", gap: "6px" }}>
          {images.map((item, i) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={(e) => toSlide(e, i)}
              style={{
                width: activeIndex === i ? "18px" : "8px",
                height: "8px",
                borderRadius: "999px",
                border: "none",
                background:
                  activeIndex === i ? "#ffffff" : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Show next slide"
          onClick={toNext}
          style={{
            border: "none",
            background: "transparent",
            color: "#f3f4f6",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

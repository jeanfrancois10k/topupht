"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "/banners/banner_freefire.jpg",
    href: "/games/free-fire",
    alt: "Recharge Free Fire",
  },
  {
    id: 2,
    image: "/banners/banner_mobilelegends.jpg",
    href: "/games/mobile-legends",
    alt: "Recharge Mobile Legends",
  },
  {
    id: 3,
    image: "/banners/banner_marketplace.jpg",
    href: "/marketplace",
    alt: "Marketplace de Jeux",
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 300);
    },
    [animating]
  );

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);

  // Auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-black w-full select-none" style={{ height: "clamp(280px, 38vw, 520px)" }}>
      {/* Slide Image Link - Clean & Nette without white fog or text */}
      <Link href={slide.href} className="block relative w-full h-full cursor-pointer group">
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            animating ? "opacity-0" : "opacity-100"
          }`}
          style={{
            backgroundImage: `url('${slide.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-label={slide.alt}
        />
      </Link>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          prev();
        }}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 hover:scale-105 transition-all border border-white/20 shadow-lg cursor-pointer"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          next();
        }}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 hover:scale-105 transition-all border border-white/20 shadow-lg cursor-pointer"
        aria-label="Slide suivant"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goTo(i);
            }}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === current ? "w-8 bg-white shadow-sm" : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Aller au slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
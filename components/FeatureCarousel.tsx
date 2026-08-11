"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

type CarouselSlide = {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  badge: string;
};

const slides: CarouselSlide[] = [
  {
    id: "telematics",
    title: "Live Fleet Tracking & Telematics",
    subtitle: "Monitor vehicle locations, active routes, and driver status in real-time.",
    imageSrc: "/feature1.png",
    badge: "Live Telematics",
  },
  {
    id: "dvir",
    title: "Mobile DVIR Inspections & Compliance",
    subtitle: "Pre-trip and post-trip digital inspection checklists with photo proof.",
    imageSrc: "/feature2.png",
    badge: "DOT Compliant",
  },
  {
    id: "maintenance",
    title: "Automated Maintenance & Service",
    subtitle: "Escalate fault codes automatically into repair work orders and parts requests.",
    imageSrc: "/feature3.png",
    badge: "Predictive Service",
  },
];

export function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  const current = slides[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Image Showcase */}
      <div className="relative h-72 sm:h-96 md:h-[440px] w-full bg-slate-50 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.imageSrc}
              alt={slide.title}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover object-top"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
        ))}

        {/* Carousel Prev/Next Buttons */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 border border-slate-200/90 shadow-md backdrop-blur-md transition-all hover:bg-amber-400 hover:text-slate-950 hover:border-amber-400 active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 border border-slate-200/90 shadow-md backdrop-blur-md transition-all hover:bg-amber-400 hover:text-slate-950 hover:border-amber-400 active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slide Caption & Indicators */}
      <div className="bg-white p-5 sm:p-6 text-slate-900 border-t border-slate-100 space-y-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-950 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            {current.title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {current.subtitle}
          </p>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-7 bg-amber-400"
                    : "w-2.5 bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <span className="text-xs font-medium text-slate-400">
            {isPaused ? "Paused" : "Auto-playing"}
          </span>
        </div>
      </div>
    </div>
  );
}

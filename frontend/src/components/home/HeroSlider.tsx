"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 1,
      image: "/hero_ceiling.png",
      title: "Thi công trần gỗ nhựa cao cấp",
      alt: "Trần gỗ nhựa ngoài trời thực tế"
    },
    {
      id: 2,
      image: "/projects/project_caro_sunshade.png",
      title: "Hệ lam chắn nắng gỗ nhựa ngoài trời",
      alt: "Hệ lam chắn nắng"
    },
    {
      id: 3,
      image: "/projects/project_g100_wood_tn.png",
      title: "Ốp tường gỗ nhựa composite hiện đại",
      alt: "Ốp tường composite"
    }
  ];

  // Auto rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="flex-1 min-h-[350px] lg:h-full relative overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800 group shadow-sm border border-neutral-200/50 dark:border-neutral-800">
      {/* Slides track */}
      <div className="w-full h-full relative">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={idx === 0}
              className="object-cover"
              sizes="(max-w-1024px) 100vw, 60vw"
            />
            {/* Subtle Gradient Shadow Over Slide */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

            {/* Slide Title */}
            <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-wide drop-shadow-md text-wrap-balance">
                {slide.title}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Slider Navigation Arrows - Naked elegant chevrons */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/75 hover:text-white transition-colors hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Previous slide"
      >
        <CaretLeft size={36} weight="light" aria-hidden="true" />
      </button>
      <button
        onClick={handleNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/75 hover:text-white transition-colors hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Next slide"
      >
        <CaretRight size={36} weight="light" aria-hidden="true" />
      </button>

      {/* Slide indicators / dashes: Centered bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-10 h-[2.5px] transition-all duration-300 cursor-pointer ${idx === currentSlide ? "bg-white" : "bg-white/35 hover:bg-white/60"
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

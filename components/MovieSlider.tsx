"use client";

import { useRef, useEffect } from "react";
import MovieCardWrapper from "./MovieCardWrapper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/types/api";

interface MovieSliderProps {
  movies: Movie[];
}

export default function MovieSlider({ movies }: MovieSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

  // Render 12 movies, duplicated 3 times to create a seamless infinite loop scrolling effect
  const slicedMovies = movies.slice(0, 12);
  const items = [...slicedMovies, ...slicedMovies, ...slicedMovies];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Position initial scroll at the beginning of the middle (main) cloned set
    const singleSetWidth = slider.scrollWidth / 3;
    slider.scrollLeft = singleSetWidth;

    const handleScroll = () => {
      const currentScroll = slider.scrollLeft;
      const setWidth = slider.scrollWidth / 3;

      // Teleport to the middle set if scroll reaches boundary clones
      if (currentScroll < 10) {
        slider.scrollLeft = setWidth;
      } else if (currentScroll > setWidth * 2 - 10) {
        slider.scrollLeft = setWidth;
      }
    };

    slider.addEventListener("scroll", handleScroll);
    return () => slider.removeEventListener("scroll", handleScroll);
  }, [slicedMovies]);

  const scroll = (direction: "left" | "right") => {
    const slider = sliderRef.current;
    if (!slider) return;

    const widthToScroll = slider.clientWidth;
    const amount = direction === "left" ? -widthToScroll : widthToScroll;
    slider.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative group/slider">
      {/* Navigation Arrow Left */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-[40%] -translate-y-1/2 z-20 w-10 h-10 bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover/slider:opacity-100 transition-all duration-300 ml-2 shadow-lg backdrop-blur-sm active:scale-90"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Scrollable Container */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto no-scrollbar gap-4 pb-6 scroll-smooth snap-x snap-mandatory"
      >
        {items.map((movie, index) => (
          <div
            key={`${movie._id}-${index}`}
            // Desktop (lg): Exactly 6 items fit in a row (5 gaps of 16px = 80px total gap)
            // Tablet (md): Exactly 4 items fit in a row (3 gaps of 16px = 48px total gap)
            // Mobile: Exactly 2 items fit in a row (1 gap of 16px = 16px total gap)
            className="w-[calc((100%-16px)/2)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-80px)/6)] shrink-0 snap-start"
          >
            <MovieCardWrapper movie={movie} />
          </div>
        ))}
      </div>

      {/* Navigation Arrow Right */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-[40%] -translate-y-1/2 z-20 w-10 h-10 bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover/slider:opacity-100 transition-all duration-300 mr-2 shadow-lg backdrop-blur-sm active:scale-90"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

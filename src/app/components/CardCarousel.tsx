"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PokemonSearchBar from "./PokemonSearchBar";
import { usePokemonCarousel } from "./usePokemonCarousel";
import { type CarouselImage, type PokemonPageData } from "../data/pokemonApi";

interface CardCarouselProps {
  className?: string;
  images?: CarouselImage[];
  initialPokemonData?: PokemonPageData | null;
}

export default function CardCarousel({
  className = "",
  images = [],
  initialPokemonData = null,
}: CardCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    carouselImages,
    currentPage,
    isLoadingPage,
    isQueryTooShort,
    isSearching,
    isSearchingPokemon,
    minSearchLength,
    normalizedQuery,
    onSearchChange,
    safeActiveIndex,
    searchPage,
    searchResultCount,
    searchTerm,
    searchTotalPages,
    toNext,
    toPrev,
    toSlide,
    totalPages,
    totalPokemonCount,
  } = usePokemonCarousel({ images, initialPokemonData });

  const slideWidth = 160;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none ${className}`}
    >
      <PokemonSearchBar
        value={searchTerm}
        onChange={onSearchChange}
        isLoading={isSearching && isSearchingPokemon}
      />

      <div className="mb-3 flex items-center gap-2 text-xs text-neutral-300">
        {isQueryTooShort ? (
          <span>Type at least {minSearchLength} characters to search.</span>
        ) : isSearching ? (
          <span>
            Page {searchPage} / {searchTotalPages} (
            {searchResultCount.toLocaleString()} results for &quot;
            {normalizedQuery}&quot;)
          </span>
        ) : (
          <span>
            Page {currentPage} / {totalPages} (
            {totalPokemonCount.toLocaleString()} Pokemon)
          </span>
        )}
      </div>

      {isLoadingPage || (isSearching && isSearchingPokemon) ? (
        <p className="mb-2 text-xs text-neutral-400">
          {isSearching ? "Searching Pokemon..." : "Loading Pokemon page..."}
        </p>
      ) : null}

      <div
        className="relative h-[180px] flex items-center justify-start overflow-visible"
        style={{ width: `${slideWidth}px` }}
      >
        <motion.div
          className="flex w-fit items-center"
          animate={{ x: -safeActiveIndex * slideWidth }}
          transition={{ type: "spring", bounce: 0.1, duration: 0.8 }}
        >
          {carouselImages.map((item, i) => {
            const isActive = safeActiveIndex === i;
            const diff = i - safeActiveIndex;

            const targetRotate = isHovered ? diff * 20 : diff * 5;
            const targetScale = isActive ? 1.05 : isHovered ? 0.65 : 0.8;
            const targetY = isHovered ? diff * 24 : 0;

            return (
              <motion.div
                key={i}
                className="shrink-0 flex flex-col items-center gap-1.5 will-change-[transform,scale]"
                style={{ width: `${slideWidth}px` }}
                animate={{
                  rotate: targetRotate,
                  scale: targetScale,
                  y: targetY,
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
              >
                <div
                  className={`text-[10px] md:text-xs font-semibold whitespace-nowrap transition-all duration-300 ${isActive ? "opacity-100 scale-100 text-white" : "opacity-0 scale-75 text-neutral-400"}`}
                >
                  {item.title}
                </div>

                <img
                  src={item.src}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-[110px] h-[110px] object-cover rounded-xl shadow-lg border border-white/10 cursor-pointer"
                  onClick={(e) => toSlide(e, i)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className="mt-4 px-1.5 py-0.5 flex items-center gap-2 justify-center text-neutral-400 rounded-full bg-neutral-900/60 backdrop-blur-md border border-white/5 shadow-md z-20">
        <button
          onClick={toPrev}
          className="p-1 cursor-pointer hover:bg-white/5 rounded-full transition-colors border-0 bg-transparent text-neutral-400 hover:text-white"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="flex justify-center items-center gap-1">
          {carouselImages.map((_, i) => (
            <div
              key={i}
              onClick={(e) => toSlide(e, i)}
              className={`rounded-full cursor-pointer h-1 transition-all duration-300 ${safeActiveIndex === i ? "w-4 bg-white" : "w-1 bg-white/30 hover:bg-white/50"}`}
            ></div>
          ))}
        </div>
        <button
          onClick={toNext}
          className="p-1 cursor-pointer hover:bg-white/5 rounded-full transition-colors border-0 bg-transparent text-neutral-400 hover:text-white"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

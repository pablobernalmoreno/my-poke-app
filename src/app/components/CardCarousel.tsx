"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PokemonSearchBar from "./PokemonSearchBar";
import { usePokemonCarousel } from "./usePokemonCarousel";
import { type CarouselImage, type PokemonPageData } from "../data/pokemonApi";
import styles from "./CardCarousel.module.css";
import { Box, CircularProgress } from "@mui/material";

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
      className={`${styles.wrapper} ${className}`}
    >
      <PokemonSearchBar
        value={searchTerm}
        onChange={onSearchChange}
        isLoading={isSearching && isSearchingPokemon}
      />

      <div className={styles.statusBar}>
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
        <Box sx={{ display: "flex" }}>
          <CircularProgress aria-label="Loading…" />
          <p className={styles.loadingText}>
            {isSearching ? "Searching Pokemon..." : "Loading Pokemon page..."}
          </p>
        </Box>
      ) : null}

      <div className={styles.slideViewport}>
        <motion.div
          className={styles.slideTrack}
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
                className={styles.slide}
                animate={{
                  rotate: targetRotate,
                  scale: targetScale,
                  y: targetY,
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
              >
                <div
                  className={`${styles.slideTitle} ${isActive ? styles.slideTitleActive : styles.slideTitleInactive}`}
                >
                  {item.title}
                </div>
                <>
                  <button
                    onClick={() => console.log(`Favorito ${item.title}`)}
                    className={styles.favoriteBtn}
                  >
                    Favorito
                  </button>
                  <img
                    src={item.src}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className={styles.pokemonImage}
                    onClick={(e) => toSlide(e, i)}
                  />
                </>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className={styles.controls}>
        <button onClick={toPrev} className={styles.navBtn}>
          <ChevronLeft className={styles.navIcon} />
        </button>
        <div className={styles.dots}>
          {carouselImages.map((_, i) => (
            <div
              key={i}
              onClick={(e) => toSlide(e, i)}
              className={`${styles.dot} ${safeActiveIndex === i ? styles.dotActive : styles.dotInactive}`}
            />
          ))}
        </div>
        <button onClick={toNext} className={styles.navBtn}>
          <ChevronRight className={styles.navIcon} />
        </button>
      </div>
    </div>
  );
}

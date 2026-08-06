"use client";
import React, { useState, useEffect, useRef, useDeferredValue } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PokemonSearchBar from "./PokemonSearchBar";
import {
  fetchPokemonPage,
  POKEMON_PAGE_SIZE,
  searchPokemonByName,
  type CarouselImage,
  type PokemonPageData,
} from "../data/pokemonApi";

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
  const MIN_SEARCH_LENGTH = 2;
  const SEARCH_RESULTS_LIMIT = 60;

  const [fetchedImages, setFetchedImages] = useState<CarouselImage[]>(
    initialPokemonData?.images ?? [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPokemonCount, setTotalPokemonCount] = useState(
    initialPokemonData?.count ?? 10326,
  );
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [pendingActiveIndex, setPendingActiveIndex] = useState<number | null>(
    null,
  );
  const [activeIndex, setActiveIndex] = useState(
    Math.min(2, Math.max(0, (initialPokemonData?.images ?? images).length - 1)),
  );
  const [isHovered, setIsHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CarouselImage[]>([]);
  const [isSearchingPokemon, setIsSearchingPokemon] = useState(false);
  const shouldSkipInitialFetch = useRef(Boolean(initialPokemonData));
  const pendingActiveIndexRef = useRef<number | null>(pendingActiveIndex);

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const normalizedQuery = deferredSearchTerm.trim().toLowerCase();
  const immediateQuery = searchTerm.trim().toLowerCase();
  const isSearching = normalizedQuery.length >= MIN_SEARCH_LENGTH;
  const isQueryTooShort =
    immediateQuery.length > 0 && immediateQuery.length < MIN_SEARCH_LENGTH;

  const pageImages = fetchedImages.length > 0 ? fetchedImages : images;
  const carouselImages = isSearching ? searchResults : pageImages;
  const maxIndex = Math.max(0, carouselImages.length - 1);
  const safeActiveIndex = Math.min(activeIndex, maxIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(totalPokemonCount / POKEMON_PAGE_SIZE),
  );

  useEffect(() => {
    pendingActiveIndexRef.current = pendingActiveIndex;
  }, [pendingActiveIndex]);

  useEffect(() => {
    if (currentPage === 1 && shouldSkipInitialFetch.current) {
      shouldSkipInitialFetch.current = false;
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      setIsLoadingPage(true);

      try {
        const { count, images: pageImages } =
          await fetchPokemonPage(currentPage);

        if (isCancelled) {
          return;
        }

        setTotalPokemonCount(count);

        const nextIndex = pendingActiveIndexRef.current ?? 0;
        const safeNextIndex = Math.max(
          0,
          Math.min(nextIndex, Math.max(0, pageImages.length - 1)),
        );

        if (pageImages.length > 0) {
          setFetchedImages(pageImages);
          setActiveIndex(safeNextIndex);
        } else {
          setFetchedImages([]);
          setActiveIndex(0);
        }

        setPendingActiveIndex(null);
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to fetch Pokemon images", error);
        }
        setPendingActiveIndex(null);
      } finally {
        if (!isCancelled) {
          setIsLoadingPage(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [currentPage]);

  useEffect(() => {
    if (!isSearching) {
      return;
    }

    let isCancelled = false;

    const runSearch = async () => {
      try {
        const results = await searchPokemonByName(
          normalizedQuery,
          SEARCH_RESULTS_LIMIT,
        );
        if (!isCancelled) {
          setSearchResults(results);
          setActiveIndex(0);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to search Pokemon", error);
          setSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearchingPokemon(false);
        }
      }
    };

    runSearch();

    return () => {
      isCancelled = true;
    };
  }, [normalizedQuery, isSearching]);

  const toPokemonPage = (nextPage: number) => {
    setCurrentPage((prev) => {
      const page = Math.max(1, Math.min(nextPage, totalPages));
      if (page === prev) {
        return prev;
      }
      return page;
    });
  };

  const toPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoadingPage) {
      return;
    }

    if (safeActiveIndex > 0) {
      setActiveIndex((prev) => Math.max(0, Math.min(prev, maxIndex) - 1));
      return;
    }

    if (!isSearching && currentPage > 1) {
      setPendingActiveIndex(POKEMON_PAGE_SIZE - 1);
      toPokemonPage(currentPage - 1);
    }
  };

  const toNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoadingPage) {
      return;
    }

    if (safeActiveIndex < maxIndex) {
      setActiveIndex((prev) => Math.min(maxIndex, Math.max(0, prev) + 1));
      return;
    }

    if (!isSearching && currentPage < totalPages) {
      setPendingActiveIndex(0);
      toPokemonPage(currentPage + 1);
    }
  };

  const toSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActiveIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const onSearchChange = (value: string) => {
    setSearchTerm(value);

    const normalizedValue = value.trim().toLowerCase();
    if (!normalizedValue || normalizedValue.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setIsSearchingPokemon(false);
      return;
    }

    setIsSearchingPokemon(true);
  };

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
          <span>Type at least {MIN_SEARCH_LENGTH} characters to search.</span>
        ) : isSearching ? (
          <span>
            {searchResults.length.toLocaleString()} results for &quot;
            {normalizedQuery}&quot;
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

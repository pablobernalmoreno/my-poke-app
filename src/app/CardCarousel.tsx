"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const POKEMON_PAGE_SIZE = 12;

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
  className?: string;
  images?: { src: string; title: string }[];
}

interface PokemonListItem {
  name: string;
  url: string;
}

interface PokemonListResponse {
  count: number;
  results: PokemonListItem[];
}

function getPokemonIdFromUrl(url: string): number | null {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

export default function CardCarousel({
  className = "",
  images = DEFAULT_ASSETS,
}: CardCarouselProps) {
  const [fetchedImages, setFetchedImages] = useState<{ src: string; title: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPokemonCount, setTotalPokemonCount] = useState(10326);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [pendingActiveIndex, setPendingActiveIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(2);
  const [isHovered, setIsHovered] = useState(false);

  const carouselImages = fetchedImages.length > 0 ? fetchedImages : images;
  const maxIndex = Math.max(0, carouselImages.length - 1);
  const safeActiveIndex = Math.min(activeIndex, maxIndex);
  const totalPages = Math.max(1, Math.ceil(totalPokemonCount / POKEMON_PAGE_SIZE));

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setIsLoadingPage(true);

      try {
        const offset = (currentPage - 1) * POKEMON_PAGE_SIZE;
        const response = await axios.get<PokemonListResponse>(
          `https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_PAGE_SIZE}&offset=${offset}`,
        );

        const { count, results } = response.data;
        const pageImages = results
          .map(({ name, url }) => {
            const id = getPokemonIdFromUrl(url);
            if (!id) {
              return null;
            }

            return {
              src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
              title: name,
            };
          })
          .filter((item): item is { src: string; title: string } => item !== null);

        if (isCancelled) {
          return;
        }

        setTotalPokemonCount(count);

        const nextIndex = pendingActiveIndex ?? 0;
        const safeNextIndex = Math.max(0, Math.min(nextIndex, Math.max(0, pageImages.length - 1)));

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

    if (currentPage > 1) {
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

    if (currentPage < totalPages) {
      setPendingActiveIndex(0);
      toPokemonPage(currentPage + 1);
    }
  };

  const toSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActiveIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const slideWidth = 160;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none ${className}`}
    >
      <div className="mb-3 flex items-center gap-2 text-xs text-neutral-300">
        <span>
          Page {currentPage} / {totalPages} ({totalPokemonCount.toLocaleString()} Pokemon)
        </span>
      </div>

      {isLoadingPage ? <p className="mb-2 text-xs text-neutral-400">Loading Pokemon page...</p> : null}

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

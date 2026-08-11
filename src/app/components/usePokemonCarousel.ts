import { useDeferredValue, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  fetchPokemonPage,
  POKEMON_PAGE_SIZE,
  searchPokemonByName,
  type CarouselImage,
  type PokemonPageData,
} from "../data/pokemonApi";

const MIN_SEARCH_LENGTH = 2;
const DEFAULT_POKEMON_COUNT = 10326;

interface UsePokemonCarouselOptions {
  images?: CarouselImage[];
  initialPokemonData?: PokemonPageData | null;
}

export function usePokemonCarousel({
  images = [],
  initialPokemonData = null,
}: UsePokemonCarouselOptions) {
  const [fetchedImages, setFetchedImages] = useState<CarouselImage[]>(
    initialPokemonData?.images ?? [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPokemonCount, setTotalPokemonCount] = useState(
    initialPokemonData?.count ?? DEFAULT_POKEMON_COUNT,
  );
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [pendingActiveIndex, setPendingActiveIndex] = useState<number | null>(
    null,
  );
  const [activeIndex, setActiveIndex] = useState(
    Math.min(2, Math.max(0, (initialPokemonData?.images ?? images).length - 1)),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchResultCount, setSearchResultCount] = useState(0);
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
  const searchTotalPages = Math.max(
    1,
    Math.ceil(searchResultCount / POKEMON_PAGE_SIZE),
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
        const { count, images: pageImages } = await fetchPokemonPage(currentPage);

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
          setPendingActiveIndex(null);
        }
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
      setSearchPage(1);
      setSearchResultCount(0);
      return;
    }

    let isCancelled = false;

    const runSearch = async () => {
      try {
        const { count, images: results } = await searchPokemonByName(
          normalizedQuery,
          searchPage,
          POKEMON_PAGE_SIZE,
        );

        if (!isCancelled) {
          const nextIndex = pendingActiveIndexRef.current ?? 0;
          const safeNextIndex = Math.max(
            0,
            Math.min(nextIndex, Math.max(0, results.length - 1)),
          );

          setSearchResultCount(count);
          setSearchResults(results);

          if (results.length > 0) {
            setActiveIndex(safeNextIndex);
          } else {
            setActiveIndex(0);
          }

          setPendingActiveIndex(null);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to search Pokemon", error);
          setSearchResults([]);
          setSearchResultCount(0);
          setPendingActiveIndex(null);
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
  }, [normalizedQuery, isSearching, searchPage]);

  const toPokemonPage = (nextPage: number) => {
    setCurrentPage((prev) => {
      const page = Math.max(1, Math.min(nextPage, totalPages));
      if (page === prev) {
        return prev;
      }
      return page;
    });
  };

  const toSearchPage = (nextPage: number) => {
    setSearchPage((prev) => {
      const page = Math.max(1, Math.min(nextPage, searchTotalPages));
      if (page === prev) {
        return prev;
      }
      return page;
    });
  };

  const toPrev = (event: MouseEvent) => {
    event.stopPropagation();
    if (isLoadingPage) {
      return;
    }

    if (safeActiveIndex > 0) {
      setActiveIndex((prev) => Math.max(0, Math.min(prev, maxIndex) - 1));
      return;
    }

    if (isSearching && searchPage > 1) {
      setPendingActiveIndex(POKEMON_PAGE_SIZE - 1);
      toSearchPage(searchPage - 1);
      return;
    }

    if (!isSearching && currentPage > 1) {
      setPendingActiveIndex(POKEMON_PAGE_SIZE - 1);
      toPokemonPage(currentPage - 1);
    }
  };

  const toNext = (event: MouseEvent) => {
    event.stopPropagation();
    if (isLoadingPage) {
      return;
    }

    if (safeActiveIndex < maxIndex) {
      setActiveIndex((prev) => Math.min(maxIndex, Math.max(0, prev) + 1));
      return;
    }

    if (isSearching && searchPage < searchTotalPages) {
      setPendingActiveIndex(0);
      toSearchPage(searchPage + 1);
      return;
    }

    if (!isSearching && currentPage < totalPages) {
      setPendingActiveIndex(0);
      toPokemonPage(currentPage + 1);
    }
  };

  const toSlide = (event: MouseEvent, index: number) => {
    event.stopPropagation();
    setActiveIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const onSearchChange = (value: string) => {
    setSearchTerm(value);
    setSearchPage(1);
    setPendingActiveIndex(0);

    const normalizedValue = value.trim().toLowerCase();
    if (!normalizedValue || normalizedValue.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchResultCount(0);
      setIsSearchingPokemon(false);
      setActiveIndex(0);
      return;
    }

    setIsSearchingPokemon(true);
  };

  return {
    carouselImages,
    currentPage,
    isLoadingPage,
    isQueryTooShort,
    isSearching,
    isSearchingPokemon,
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
    minSearchLength: MIN_SEARCH_LENGTH,
  };
}
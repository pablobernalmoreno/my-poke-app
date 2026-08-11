import axios from "axios";

export const POKEMON_PAGE_SIZE = 12;

export interface CarouselImage {
  src: string;
  title: string;
}

interface PokemonListItem {
  name: string;
  url: string;
}

interface PokemonListResponse {
  count: number;
  results: PokemonListItem[];
}

export interface PokemonPageData {
  count: number;
  images: CarouselImage[];
}

export interface PokemonSearchPageData {
  count: number;
  images: CarouselImage[];
}

let cachedPokemonCatalog: PokemonListItem[] | null = null;

function getPokemonIdFromUrl(url: string): number | null {
  const match = /\/pokemon\/(\d+)\/?$/.exec(url);
  return match ? Number(match[1]) : null;
}

function toCarouselImage(item: PokemonListItem): CarouselImage | null {
  const id = getPokemonIdFromUrl(item.url);
  if (!id) {
    return null;
  }

  return {
    src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    title: item.name,
  };
}

async function getPokemonCatalog(): Promise<PokemonListItem[]> {
  if (cachedPokemonCatalog) {
    return cachedPokemonCatalog;
  }

  const response = await axios.get<PokemonListResponse>(
    "https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0",
  );
  cachedPokemonCatalog = response.data.results;
  return cachedPokemonCatalog;
}

export async function fetchPokemonPage(page: number): Promise<PokemonPageData> {
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * POKEMON_PAGE_SIZE;

  const response = await axios.get<PokemonListResponse>(
    `https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_PAGE_SIZE}&offset=${offset}`,
  );

  const { count, results } = response.data;

  const images = results
    .map((item) => toCarouselImage(item))
    .filter((item): item is CarouselImage => item !== null);

  return {
    count,
    images,
  };
}

export async function searchPokemonByName(
  query: string,
  page = 1,
  limit = POKEMON_PAGE_SIZE,
): Promise<PokemonSearchPageData> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return {
      count: 0,
      images: [],
    };
  }

  const allPokemon = await getPokemonCatalog();
  const matches = allPokemon.filter((item) => item.name.includes(normalizedQuery));
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * limit;

  return {
    count: matches.length,
    images: matches
      .slice(offset, offset + limit)
      .map((item) => toCarouselImage(item))
      .filter((item): item is CarouselImage => item !== null),
  };
}

import CardCarousel from "./components/CardCarousel";
import { fetchPokemonPage } from "./data/pokemonApi";
import styles from "./page.module.css";

export default async function Home() {
  const initialPokemonData = await fetchPokemonPage(1).catch((error) => {
    console.error("Failed to fetch initial Pokemon data", error);
    return null;
  });

  return (
    <main className={styles.main}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Explore the pokeworld!</h1>
      </div>
      <CardCarousel initialPokemonData={initialPokemonData} />
    </main>
  );
}

import { Pokemon, PokemonSchema } from "../types/pokemon";

const apiUrl = "https://pokeapi.co/api/v2/pokemon";

export async function fetchPokemon(
  name: string | number
): Promise<Pokemon | null> {
  try {
    const response = await fetch(
      `${apiUrl}/${typeof name === "string" ? name.toLowerCase() : name}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Pokemon not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return PokemonSchema.parse(data);
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
    return null;
  }
}

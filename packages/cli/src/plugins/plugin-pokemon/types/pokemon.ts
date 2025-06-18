import { z } from "zod";

export const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  base_experience: z.number().optional(),
  types: z.array(
    z.object({
      slot: z.number(),
      type: z.object({
        name: z.string(),
        url: z.string(),
      }),
    })
  ),
  abilities: z.array(
    z.object({
      ability: z.object({
        name: z.string(),
        url: z.string(),
      }),
      is_hidden: z.boolean(),
      slot: z.number(),
    })
  ),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      effort: z.number(),
      stat: z.object({
        name: z.string(),
        url: z.string(),
      }),
    })
  ),
});

export type Pokemon = z.infer<typeof PokemonSchema>;

export const formatPokemonData = (pokemon: Pokemon) => {
  const types = pokemon.types.map((t) => t.type.name).join(", ");
  const abilities = pokemon.abilities.map((a) => a.ability.name).join(", ");

  // Format stats nicely
  const stats = pokemon.stats
    .map((s) => `${s.stat.name.replace("-", " ")}: ${s.base_stat}`)
    .join(", ");

  return `Pokémon #${pokemon.id} - ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}:
• Type(s): ${types}
• Height: ${pokemon.height / 10}m
• Weight: ${pokemon.weight / 10}kg
• Abilities: ${abilities}
• Base Stats: ${stats}${pokemon.base_experience ? `\n• Base Experience: ${pokemon.base_experience}` : ""}`;
};

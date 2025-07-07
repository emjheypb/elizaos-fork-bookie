import {
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  logger,
  Memory,
  State,
  type Action,
} from '@elizaos/core';
import { fetchPokemon } from '../services/pokeapi-pokemon';
import { formatPokemonData } from '../types/pokemon';
import { getRandomOpeningPhrase, getRandomClosingPhrase } from './utils';

const action: Action = {
  name: 'GET_POKEMON',
  similes: ['POKEMON_INFO', 'FETCH_POKEMON', 'POKEMON_DATA', 'POKEMON_LOOKUP', 'POKEMON_DETAILS'],
  description:
    'Fetch detailed information about a Pokemon from the PokeAPI database. Only run this action by itself.',
  validate: async (_runtime: IAgentRuntime, message: Memory) => {
    logger.info('*** Validating GET_POKEMON action ***');
    const text = message.content.text ? message.content.text.toLowerCase() : '';

    // Check if the message is asking for Pokemon information
    const pokemonKeywords = [
      'pokemon',
      'pokémon',
      'what is',
      'tell me about',
      'info about',
      'details about',
      'show me',
      'lookup',
    ];

    const hasPokemonKeyword = pokemonKeywords.some((keyword) => text.includes(keyword));

    // Basic validation - should contain Pokemon-related keywords
    return hasPokemonKeyword && text.length > 3;
  },
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: any,
    callback?: HandlerCallback
  ) => {
    logger.info('*** Executing GET_POKEMON action ***');
    try {
      const text = message.content.text || '';

      // Extract Pokemon name from the message
      // This is a simple approach - you might want to use more sophisticated NLP
      const words = text.toLowerCase().split(/\s+/);

      // Remove common words to find the Pokemon name
      const commonWords = [
        'what',
        'is',
        'tell',
        'me',
        'about',
        'pokemon',
        'pokémon',
        'info',
        'details',
        'show',
        'lookup',
        'get',
        'fetch',
        'find',
        'the',
        'a',
        'an',
        'can',
        'you',
        'please',
        'called',
        'named',
      ];

      const pokemonName = words.find((word) => !commonWords.includes(word) && word.length > 2);

      if (!pokemonName) {
        if (callback)
          await callback({
            text: "I'd be happy to help you learn about a Pokemon! Could you please specify which Pokemon you'd like to know about?",
          });
        return true;
      }

      const pokemon = await fetchPokemon(pokemonName);

      if (!pokemon) {
        if (callback)
          await callback({
            text: `I couldn't find a Pokemon named "${pokemonName}". Please check the spelling and try again! Remember, I know about Pokemon from the official Pokedex.`,
          });
        return true;
      }

      const formattedData = formatPokemonData(pokemon);
      logger.info('GET_POKEMON Pokémon:', formattedData);

      if (callback)
        await callback({
          text: `${getRandomOpeningPhrase()} Here's what I know about this fascinating Pokémon:\n\n${formattedData}\n\n${getRandomClosingPhrase()}`,
          actions: ['GET_POKEMON'],
        });

      return true;
    } catch (error) {
      logger.error('Error in GET_POKEMON action:', error);
      if (callback)
        await callback({
          text: "I apologize, but I'm having trouble accessing my Pokémon database right now. The wonders of technology! Please try again in a moment.",
        });
      return false;
    }
  },
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'What is Pikachu?' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Wonderful! Let me share a fascinating Pokémon with you! Here's what I know about this fascinating Pokémon:\n\nPokémon #25 - Pikachu:\n• Type(s): electric\n• Height: 0.4m\n• Weight: 6kg\n• Abilities: static, lightning-rod\n• Base Stats: hp: 35, attack: 55, defense: 40, special-attack: 50, special-defense: 50, speed: 90\n• Base Experience: 112\n\nPikachu is truly a remarkable Electric-type Pokémon! Did you know that its electric pouches in its cheeks store electricity?",
          actions: ['GET_POKEMON'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Tell me about Charizard' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Ah, I have just the Pokémon for you! Here's what I know about this fascinating Pokémon:\n\nPokémon #6 - Charizard:\n• Type(s): fire, flying\n• Height: 1.7m\n• Weight: 90.5kg\n• Abilities: blaze, solar-power\n• Base Stats: hp: 78, attack: 84, defense: 78, special-attack: 109, special-defense: 85, speed: 100\n• Base Experience: 267\n\nCharizard's flame burns hotter when it has experienced many battles! Isn't Pokémon research wonderful?",
          actions: ['GET_POKEMON'],
        },
      },
    ],
  ] as ActionExample[][],
};

export default action;

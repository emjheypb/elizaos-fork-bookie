import {
  type Action,
  Content,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
} from '@elizaos/core';
import { fetchPokemon } from '../services/pokeapi-pokemon';
import { formatPokemonData } from '../types/pokemon';
import { getRandomOpeningPhrase, getRandomClosingPhrase } from './utils';

const action: Action = {
  name: 'GET_RANDOM_POKEMON',
  similes: ['RANDOM_POKEMON'],
  description:
    'Fetches a random Pokémon from the PokéAPI and displays its number, name, and types. Only run this action by itself.',

  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State | undefined
  ): Promise<boolean> => {
    logger.info('*** Validating GET_RANDOM_POKEMON action ***');
    const text = _message.content.text ? _message.content.text.toLowerCase() : 'NO TEXT';

    const triggers = [
      'random pokemon',
      'random pokémon',
      'surprise me',
      'any pokemon',
      'pick a pokemon',
      'show me a pokemon',
      'give me a pokemon',
    ];

    return triggers.some((trigger) => text.includes(trigger));
  },

  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State | undefined,
    _options: any,
    callback: HandlerCallback | undefined,
    _responses: Memory[] | undefined
  ) => {
    logger.info('*** Executing GET_RANDOM_POKEMON action ***');
    try {
      const id = Math.floor(Math.random() * 898) + 1; // Up to Gen 8
      const pokemon = await fetchPokemon(id);

      if (!pokemon) {
        logger.info('*** Retry Pokémon Fetch in GET_RANDOM_POKEMON action ***');
        // Retry with a different Pokemon if the first one fails
        const retryId = Math.floor(Math.random() * 151) + 1; // Fall back to Gen 1
        const retryPokemon = await fetchPokemon(retryId);

        if (!retryPokemon) {
          if (callback)
            await callback({
              text: `Oh my! I seem to be having trouble accessing my Pokédex right now. Please try again in a moment, and I'll find you a wonderful Pokémon to learn about!`,
            });
          return false;
        }

        const retryFormattedData = formatPokemonData(retryPokemon);
        logger.info('Random Pokémon:', retryFormattedData);

        const content: Content = {
          text: `${getRandomOpeningPhrase()} Here's what I know about this fascinating Pokémon:\n\n${retryFormattedData}\n\n${getRandomClosingPhrase()}`,
          actions: ['GET_RANDOM_POKEMON'],
        };
        if (callback) await callback(content);
        return true;
      }

      const formattedData = formatPokemonData(pokemon);
      logger.info('Random Pokémon:', formattedData);

      const content: Content = {
        text: `${getRandomOpeningPhrase()} Here's what I know about this fascinating Pokémon:\n\n${formattedData}\n\n${getRandomClosingPhrase()}`,
        actions: ['GET_RANDOM_POKEMON'],
      };
      if (callback) await callback(content);

      return true;
    } catch (error) {
      logger.error('Error in GET_RANDOM_POKEMON action:', error);
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
        content: {
          text: 'Show me a random Pokémon',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Wonderful! Let me share a fascinating Pokémon with you! Here's what I know about this fascinating Pokémon:\n\nPokémon #25 - Pikachu:\n• Type(s): electric\n• Height: 0.4m\n• Weight: 6kg\n• Abilities: static, lightning-rod\n• Base Stats: hp: 35, attack: 55, defense: 40, special-attack: 50, special-defense: 50, speed: 90\n• Base Experience: 112\n\nPikachu is truly a remarkable Electric-type Pokémon! Did you know that its electric pouches in its cheeks store electricity?",
          actions: ['GET_RANDOM_POKEMON'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'surprise me with a pokemon',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Ah, I have just the Pokémon for you! Here's what I know about this fascinating Pokémon:\n\nPokémon #6 - Charizard:\n• Type(s): fire, flying\n• Height: 1.7m\n• Weight: 90.5kg\n• Abilities: blaze, solar-power\n• Base Stats: hp: 78, attack: 84, defense: 78, special-attack: 109, special-defense: 85, speed: 100\n• Base Experience: 267\n\nCharizard's flame burns hotter when it has experienced many battles! Isn't Pokémon research wonderful?",
          actions: ['GET_RANDOM_POKEMON'],
        },
      },
    ],
  ],
};

export default action;

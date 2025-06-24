import { logger, type Plugin } from '@elizaos/core';
import { z } from 'zod';

// import SampleService from './services/sample-service';
// import sampleProvider from "./providers/sample-provider";
import getKalshiPortfolioBalance from './actions/kalshi/portfolio/get-balance';
import getKalshiPortfolioOrders from './actions/kalshi/portfolio/get-orders';
import getKalshiMarkets from './actions/kalshi/market/get-markets';
import createOrder from './actions/kalshi/portfolio/create-order';

/**
 * Define the configuration schema for the plugin with the following properties:
 *
 * @param {string} EXAMPLE_PLUGIN_VARIABLE - The name of the plugin (min length of 1, optional)
 * @returns {object} - The configured schema object
 */
const configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z
    .string()
    .min(1, 'Example plugin variable is not provided')
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn('Warning: Example plugin variable is not provided');
      }
      return val;
    }),
});

const plugin: Plugin = {
  name: 'kalshi',
  description: `Kalshi prediction market integration for elizaos agents - enables market discovery, portfolio management, and order execution via conversational AI.`,
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE,
  },
  async init(config: Record<string, string>) {
    logger.info('*** Initializing kalshi plugin ***');
    try {
      const validatedConfig = await configSchema.parseAsync(config);

      // Set all environment variables at once
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  },
  // services: [SampleService],
  actions: [getKalshiPortfolioBalance, getKalshiPortfolioOrders, getKalshiMarkets, createOrder],
  // providers: [sampleProvider],
};

export default plugin;

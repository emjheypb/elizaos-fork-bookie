import type { Plugin } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { z } from 'zod';

// import SampleService from './services/sample-service';
// import sampleProvider from "./providers/sample-provider";
import getKalshiPortfolioBalance from './actions/kalshi/portfolio/get-balance';
import getKalshiPortfolioOrders from './actions/kalshi/portfolio/get-orders';
import getKalshiMarkets from './actions/kalshi/market/get-markets';

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
  description: 'A plugin that accessses the Kalshi API',
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
  actions: [getKalshiPortfolioBalance, getKalshiPortfolioOrders, getKalshiMarkets],
  // providers: [sampleProvider],
};

export default plugin;

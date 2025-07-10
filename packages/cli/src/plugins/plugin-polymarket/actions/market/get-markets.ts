import {
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  logger,
  Memory,
  State,
  type Action,
} from '@elizaos/core';
import {
  getRandomClosingPhrase,
  getRandomMarketInsight,
  getRandomOpeningPhrase,
  getRandomRiskWarning,
  marketCategories,
  removeCommonWords,
  removeSymbols,
} from '../../../utils';
import { getOpenActiveMarkets } from '../../services/market';
import { MarketsCompiled } from '../../types/market';

const action: Action = {
  name: 'GET_POLYMARKET_TRADES',
  similes: [
    'POLYMARKET_TRADES',
    'POLYMARKET_MARKETS',
    'CHECK_POLYMARKET_TRADES',
    'POLYMARKET_BETS',
    'POLYMARKET_OPPORTUNITIES',
    'FIND_POLYMARKET_TRADES',
    'SHOW_POLYMARKET_MARKETS',
    'GET_POLYMARKET_BETS',
    'POLYMARKET_TRADING_OPPORTUNITIES',
    'AVAILABLE_TRADES',
    'POLYMARKET_GETTRADES',
  ],
  description:
    'Find available Polymarket prediction markets to trade based on categories or keywords. Run this action by itself',
  validate: async (_runtime: IAgentRuntime, message: Memory) => {
    logger.info('*** Validating GET_POLYMARKET_TRADES action ***');
    const text = message.content.text ? message.content.text.toLowerCase() : '';

    // Keywords for market/trading search context
    const marketKeywords = [
      'trades',
      'trade',
      'markets',
      'market',
      'bets',
      'bet',
      'betting',
      'opportunities',
      'wager',
      'odds',
      'predictions',
      'predict',
    ];

    const actionKeywords = [
      'find',
      'check',
      'show',
      'get',
      "what's",
      'whats',
      'available',
      'tell me',
      'see',
      'look at',
      'display',
      'list',
      'search',
    ];

    const hasMarketKeyword = marketKeywords.some((keyword) => text.includes(keyword));
    const hasActionKeyword = actionKeywords.some((keyword) => text.includes(keyword));
    const mentionsPolymarket = text.includes('polymarket');
    const mentionsTelegramCommand = text.includes('polymarket_gettrades');

    // Validate if user is looking for trading opportunities
    const isPolymarketRequest = mentionsPolymarket && hasMarketKeyword;
    const isGeneralMarketSearch = hasMarketKeyword && hasActionKeyword;

    return (
      (isPolymarketRequest || isGeneralMarketSearch || mentionsTelegramCommand) && text.length > 3
    );
  },
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: any,
    callback?: HandlerCallback
  ) => {
    logger.info('*** Executing GET_POLYMARKET_TRADES action ***');
    try {
      const text = message.content.text ? message.content.text.toLowerCase() : '';

      // Extract meaningful words from user input
      const words = removeCommonWords(removeSymbols(text));
      if (words.indexOf('polymarketgettrades') >= 0)
        words.splice(words.indexOf('polymarketgettrades'), 1);
      if (words.length === 0) {
        words.push(marketCategories[Math.floor(Math.random() * marketCategories.length)]);
      }
      logger.info(`GET_POLYMARKET_TRADES words: ${words}`);

      if (callback) {
        await callback({
          text: `Getting possible trades for "${words.join(" ")}".`,
        });
      }

      const marketsResponse: MarketsCompiled = await getOpenActiveMarkets(words);
      if (!marketsResponse || !marketsResponse.data || marketsResponse.data.length === 0) {
        if (callback) {
          logger.error('GET_POLYMARKET_TRADES No markets found in response');
          await callback({
            text: `I couldn't find any active prediction markets matching "${words.join(' ')}". ${getRandomMarketInsight()}`,
          });
        }
        return false;
      }
      logger.info(`GET_POLYMARKET_TRADES Markets count: ${marketsResponse.data.length}`);

      const markets = marketsResponse.data || [];

      // Sort markets by relevance and activity
      markets.sort((a, b) => {
        // Prioritize markets that match slug directly
        if (words.includes(a.condition_id.toLowerCase())) {
          return -1;
        } else if (words.includes(b.condition_id.toLowerCase())) {
          return 1;
        } else {
          // sort by earliest close date first
          if (a.end_date_iso && b.end_date_iso)
            return new Date(a.end_date_iso).getTime() - new Date(b.end_date_iso).getTime();
          else return a.question.localeCompare(b.question);
        }
      });

      const displayCount = Math.min(markets.length, 25);
      const topMarkets = markets.slice(0, displayCount);

      let responseText = `${getRandomOpeningPhrase()} Here are ${displayCount} available trades right now for "${words.join(' ')}":\n`;

      topMarkets.forEach((market, index: number) => {
        // Format market details
        const endDate = market.end_date_iso
          ? new Date(market.end_date_iso).toLocaleDateString()
          : 'TBD';

        responseText += `\n${index + 1}. ${market.question} (Closes: ${endDate})\n`;

        // Show token outcomes and prices if available
        if (market.tokens && market.tokens.length > 0) {
          market.tokens.forEach((token) => {
            const price = token.price ? `$${token.price.toFixed(3)}` : 'N/A';
            responseText += `\t─ ${token.outcome}: ${price} (ID: ${token.token_id})\n`;
          });
        }

        responseText += `\tCloses: ${endDate}\n`;
      });

      responseText += `\n${getRandomRiskWarning()} ${getRandomClosingPhrase()}`;

      if (callback) {
        await callback(
          {
            text: responseText,
            actions: ['GET_POLYMARKET_TRADES'],
          },
          {
            // Pass market data in callback
            totalMarkets: markets.length,
            searchTerms: words,
            markets: markets,
            apiResponse: marketsResponse,
          }
        );
      }

      return true;
    } catch (error) {
      logger.error('Error in GET_POLYMARKET_TRADES action:', error);
      if (callback) {
        await callback({
          text: `The connection to Polymarket is acting up and I can't get the available markets right now. Could be API issues on their end. Give it a few minutes and try again - these platforms can be temperamental.`,
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'What crypto prediction markets are available on Polymarket?' },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Alright, let\'s see what crypto prediction markets are available. Found 4 available prediction markets matching "crypto":\n\n1. Will Bitcoin reach $100,000 by end of 2024?\n\t└─ Yes: $0.350\n\t\t─ No: $0.650\n\t  Category: Crypto | Closes: 12/31/2024\n\t  Slug: bitcoin-100k-2024\n\n2. Will Ethereum reach $5,000 in Q1 2025?\n\t└─ Yes: $0.420\n\t\t─ No: $0.580\n\t  Category: Crypto | Closes: 03/31/2025\n\t  Slug: ethereum-5k-q1-2025\n\nDon\'t risk more than 2-5% of your bankroll on this. Keep your head cool and your bankroll management tight.',
          actions: ['GET_POLYMARKET_TRADES'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Show me sports prediction markets on Polymarket' },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Here are the available sports prediction markets. Found 3 available prediction markets matching "sports":\n\n1. Will the Chiefs win Super Bowl 2025?\n\t└─ Yes: $0.280\n\t\t─ No: $0.720\n\t  Category: Sports | Closes: 02/09/2025\n\t  Slug: chiefs-super-bowl-2025\n\n2. Will the Lakers make the NBA playoffs?\n\t└─ Yes: $0.650\n\t\t─ No: $0.350\n\t  Category: Sports | Closes: 04/15/2025\n\t  Slug: lakers-playoffs-2025\n\nOnly bet what you can afford to lose completely. Remember - discipline beats luck every single time.',
          actions: ['GET_POLYMARKET_TRADES'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Find me some election prediction markets' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Found available election prediction markets. Found 2 available prediction markets matching \"election\":\n\n1. Will Republicans control the House in 2025?\n\t└─ Yes: $0.720\n\t\t─ No: $0.280\n\t  Category: Politics | Closes: 01/03/2025\n\t  Slug: republicans-house-2025\n\n2. Will Biden's approval rating be above 45% in March?\n\t└─ Yes: $0.380\n\t\t─ No: $0.620\n\t  Category: Politics | Closes: 03/31/2025\n\t  Slug: biden-approval-march-2025\n\nSize your position appropriately - this isn't a lottery ticket. Risk management isn't sexy, but it's what keeps you in the game.",
          actions: ['GET_POLYMARKET_TRADES'],
        },
      },
    ],
  ] as ActionExample[][],
};

export default action;

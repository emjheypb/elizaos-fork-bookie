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
import { getEvents } from '../../services/event';
import { Event } from '../../types/event';
import { getSeriesList } from '../../services/series';
import { Market } from '../../types/market';

const action: Action = {
  name: 'GET_KALSHI_TRADES',
  similes: [
    'KALSHI_TRADES',
    'KALSHI_MARKETS',
    'CHECK_KALSHI_TRADES',
    'KALSHI_BETS',
    'KALSHI_OPPORTUNITIES',
    'FIND_KALSHI_TRADES',
    'SHOW_KALSHI_MARKETS',
    'GET_KALSHI_BETS',
    'KALSHI_TRADING_OPPORTUNITIES',
    'AVAILABLE_TRADES',
    'KALSHI_GETTRADES',
  ],
  description:
    'Find available Kalshi markets to trade based on categories or tags. Run this action by itself',
  validate: async (_runtime: IAgentRuntime, message: Memory) => {
    logger.info('*** Validating GET_KALSHI_TRADES action ***');
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
    const mentionsKalshi = text.includes('kalshi');
    const mentionsTelegramCommand = text.includes('kalshi_gettrades');

    // Validate if user is looking for trading opportunities
    const isKalshiMarketRequest = mentionsKalshi && hasMarketKeyword;
    const isGeneralMarketSearch = hasMarketKeyword && hasActionKeyword;

    return (
      (isKalshiMarketRequest || isGeneralMarketSearch || mentionsTelegramCommand) && text.length > 3
    );
  },
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: any,
    callback?: HandlerCallback
  ) => {
    logger.info('*** Executing GET_KALSHI_TRADES action ***');
    try {
      const seriesResponse = await getSeriesList();
      if (!seriesResponse || !seriesResponse.series) {
        if (callback) {
          logger.error('GET_KALSHI_TRADES No series found in response');
          await callback({
            text: `I'm having connection issues with Kalshi right now and can't pull the available markets. The platform might be having hiccups - try again in a few minutes.`,
          });
        }
        return true;
      }
      logger.info(`GET_KALSHI_TRADES Series count: ${seriesResponse.series.length}`);

      const text = message.content.text ? message.content.text.toLowerCase() : '';

      // Extract meaningful words from user input
      const words = removeCommonWords(removeSymbols(text));
      if (words.indexOf('kalshigettrades') >= 0) words.splice(words.indexOf('kalshigettrades'), 1);
      if (words.length === 0) {
        words.push(marketCategories[Math.floor(Math.random() * marketCategories.length)]);
        // logger.error('GET_KALSHI_TRADES No meaningful words found in user input');
        // if (callback) {
        //   await callback({
        //     text: `I couldn't find any specific trades to look for. Please provide more details or keywords related to the trades you want to see. ${getRandomMarketInsight()}`,
        //   });
        // }
        // return true;
      }
      logger.info(`GET_KALSHI_TRADES words: ${words}`);

      const seriesList = seriesResponse.series || [];
      const filteredSeries = seriesList.filter(
        (series) =>
          series.category
            .toLowerCase()
            .split(/\s+/)
            .some((word) => words.includes(word)) ||
          series.title
            .toLowerCase()
            .split(/\s+/)
            .some((word) => words.includes(word)) ||
          (series.tags ?? []).some((tag) =>
            tag
              .toLowerCase()
              .split(/\s+/)
              .some((word) => words.includes(word))
          ) ||
          words.includes(series.ticker.toLowerCase())
      );
      filteredSeries.sort((a, b) => {
        if (words.includes(a.ticker.toLowerCase())) {
          return -1; // 'a' (the specific value) comes first
        } else if (words.includes(b.ticker.toLowerCase())) {
          return 1; // 'b' (the specific value) comes first
        } else {
          // For other elements, maintain their original relative order or sort alphabetically/numerically
          return a.title.localeCompare(b.title); // Example: sort remaining alphabetically
        }
      });

      if (filteredSeries.length === 0) {
        logger.error('GET_KALSHI_TRADES No Filtered Series found for words:', words);
        if (callback) {
          await callback({
            text: `I couldn't find any active trades matching "${words}". ${getRandomMarketInsight()}`,
          });
        }
        return false;
      }
      logger.info(`GET_KALSHI_TRADES Filtered Series count: ${filteredSeries.length}`);

      let events: Event[] = [];
      for (const series of filteredSeries) {
        const event = await getEvents(series.ticker);
        if (!event || !event.events || event.events.length === 0) {
          // logger.error(`No events found for series: ${series.title} (${series.ticker})`);
          continue;
        }

        event.events.forEach((e: Event) => {
          if (
            !e.markets ||
            e.markets.length === 0 ||
            !e.markets.find((market: Market) => market.yes_bid > 0 && market.no_bid > 0)
          ) {
            // logger.error(`No valid markets found for event: ${e.title} (${e.event_ticker})`);
            return;
          }

          events.push(e);
          console.log(`Series ${series.ticker} Event Added: ${event.events[0].event_ticker}`);
        });
      }
      logger.info(`GET_KALSHI_TRADES Events count: ${events.length}`);
      if (events.length === 0) {
        logger.error('GET_KALSHI_TRADES No Events found for words:', words);
        if (callback) {
          await callback({
            text: `I couldn't find any active trades matching "${words}". ${getRandomMarketInsight()}`,
          });
        }
        return false;
      }

      let responseText = `${getRandomOpeningPhrase()} `;
      if (words.length > 0) {
        responseText += `Found ${events.length} available trades matching "${words}":\n`;
      } else {
        responseText += `Here are ${events.length} available trades right now:\n`;
      }

      const displayCount = Math.min(events.length, 10);
      const topEvents = events.slice(0, displayCount);

      topEvents.forEach((event, index: number) => {
        if (!event || !event.markets) return; // Skip if no event found for this series
        responseText += `\n${index + 1}. ${event.title}\n`;

        event.markets.forEach((market) => {
          const yesPrice = market.yes_ask ? `${(market.yes_ask / 100).toFixed(2)}` : 'N/A';
          const noPrice = market.no_ask ? `${(market.no_ask / 100).toFixed(2)}` : 'N/A';
          const closeDate = market.close_time
            ? new Date(market.close_time).toLocaleDateString()
            : 'TBD';

          responseText += `\t- ${market.title}${market.subtitle ? ` ${market.subtitle}` : ''}${!market.title && !market.subtitle ? market.yes_sub_title : ''} (${market.ticker})\n`;
          responseText += `\t\tYES: ${yesPrice} | NO: ${noPrice} | Closes: ${closeDate}\n`;
        });
      });

      if (events.length > displayCount) {
        responseText += `\n${events.length - displayCount} more trades available. `;
      }

      responseText += `\n${getRandomRiskWarning()} ${getRandomClosingPhrase()}`;

      if (callback) {
        await callback(
          {
            text: responseText,
            actions: ['GET_KALSHI_TRADES'],
          },
          {
            // Pass market data in callback
            totalTrades: events.length,
            searchTerms: words,
            trades: events,
            apiResponse: seriesResponse,
          }
        );
      }

      return true;
    } catch (error) {
      logger.error('Error in GET_KALSHI_TRADES action:', error);
      if (callback) {
        await callback({
          text: `The connection to Kalshi is acting up and I can't get the available markets right now. Could be API issues on their end. Give it a few minutes and try again - these platforms can be temperamental.`,
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'What crypto trades are available on Kalshi?' },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Alright, let\'s see what crypto trades are available. Found 4 available trades matching "crypto bitcoin". Available trades:\n1. Bitcoin hits $100K by end of 2024\n   YES: $0.35 | NO: $0.65 | Volume: $125,000 | Closes: 12/31/2024\n2. Ethereum reaches $5,000 in Q1 2025\n   YES: $0.42 | NO: $0.58 | Volume: $89,500 | Closes: 03/31/2025. Don\'t risk more than 2-5% of your bankroll on this. Keep your head cool and your bankroll management tight.',
          actions: ['GET_KALSHI_TRADES'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Show me sports betting opportunities on Kalshi' },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Here are the available sports trades. Found 6 available trades matching "sports football basketball". Available trades:\n1. Chiefs win Super Bowl 2025\n   YES: $0.28 | NO: $0.72 | Volume: $250,000 | Closes: 02/09/2025\n2. Lakers make NBA playoffs\n   YES: $0.65 | NO: $0.35 | Volume: $180,000 | Closes: 04/15/2025. Only bet what you can afford to lose completely. Remember - discipline beats luck every single time.',
          actions: ['GET_KALSHI_TRADES'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Find me some election trades' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Found available election trades. Found 3 available trades matching \"election president\". Available trades:\n1. Republican wins 2024 House majority\n   YES: $0.72 | NO: $0.28 | Volume: $500,000 | Closes: 01/03/2025\n2. Biden approval rating above 45% by March\n   YES: $0.38 | NO: $0.62 | Volume: $95,000 | Closes: 03/31/2025. Size your position appropriately - this isn't a lottery ticket. Risk management isn't sexy, but it's what keeps you in the game.",
          actions: ['GET_KALSHI_TRADES'],
        },
      },
    ],
  ] as ActionExample[][],
};

export default action;

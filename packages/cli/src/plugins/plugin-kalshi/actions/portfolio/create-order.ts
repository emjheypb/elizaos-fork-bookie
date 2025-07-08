import {
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  logger,
  Memory,
  State,
  type Action,
} from '@elizaos/core';
import { createOrder } from '../../services/portfolio';
import { getMarkets } from '../../services/market';
import { getRandomClosingPhrase, getRandomOpeningPhrase, getRandomRiskWarning } from '../../../utils';
import { createOrderRequest } from '../../types/portfolio';
import { Market } from '../../types/market';

interface OrderParams {
  ticker: string;
  side: 'yes' | 'no';
  count: number;
  // price: number; // Price in cents (e.g., 65 for $0.65) - only for limit orders
  // type: 'market' | 'limit'; // Default to market for simplicity
}

const action: Action = {
  name: 'CREATE_KALSHI_ORDER',
  similes: [
    'KALSHI_CREATE_ORDER',
    'KALSHI_PLACE_ORDER',
    'KALSHI_BUY',
    'PLACE_KALSHI_ORDER',
    'BUY_KALSHI',
  ],
  description:
    'Create/place an order on Kalshi. Requires ticker, side (yes/no), quantity, and price.',
  validate: async (_runtime: IAgentRuntime, message: Memory) => {
    logger.info('*** Validating CREATE_KALSHI_ORDER action ***');
    const text = message.content.text ? message.content.text.toLowerCase() : '';

    // Keywords for order creation
    const orderCreationKeywords = ['order', 'trade', 'bet'];

    // const sideKeywords = ['yes', 'no'];

    const actionKeywords = ['place', 'create', 'buy', 'make', 'put', 'submit', 'purchase'];

    const hasOrderKeyword = orderCreationKeywords.some((keyword) => text.includes(keyword));
    const hasActionKeyword = actionKeywords.some((keyword) => text.includes(keyword));
    // const hasSideKeyword = sideKeywords.some((keyword) => text.includes(keyword));
    const mentionsKalshi = text.includes('kalshi');
    const mentionsTelegramCommand = text.includes('kalshi_buy');

    // Look for price patterns (e.g., "$0.65", "65 cents", "65c")
    // const pricePattern = /(\$\d+\.?\d*|\d+\s*(cents?|c)|\d+\.\d+)/i;
    // const hasPrice = pricePattern.test(text);

    // Look for quantity patterns (e.g., "100 contracts", "50 shares")
    // const quantityPattern = /\d+\s*(contracts?|shares?|units?)?/i;
    // const hasQuantity = quantityPattern.test(text);

    // const isKalshiOrderCreation = mentionsKalshi && hasOrderKeyword && (hasSideKeyword || hasPrice || hasQuantity);
    // const isGeneralOrderCreation = mentionsKalshi && hasActionKeyword && hasOrderKeyword && (hasSideKeyword || hasPrice || hasQuantity);
    // return (isKalshiOrderCreation || isGeneralOrderCreation) && text.length > 10;

    // const isOrderCreation =
    //   (mentionsKalshi || mentionsTelegramCommand) &&
    //   hasActionKeyword &&
    //   hasOrderKeyword &&
    //   (hasSideKeyword || hasPrice || hasQuantity);
    const isOrderCreation =
      (mentionsKalshi && hasActionKeyword && hasOrderKeyword) || mentionsTelegramCommand;
    return isOrderCreation && text.length > 10;
  },
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: any,
    callback?: HandlerCallback
  ) => {
    logger.info('*** Executing CREATE_KALSHI_ORDER action ***');

    try {
      const text = message.content.text || '';

      // Parse order parameters from the message
      const orderParams = parseOrderFromText(text);

      if (!orderParams) {
        if (callback) {
          await callback({
            text: `I need more details to place that order! Please specify: trade ID, YES/NO side, number of contracts, and price per contract. For example: "Buy 100 contracts of <TRADE_ID> on YES." You can get a list of available trades with the "KALSHI_GETTRADES" command.`,
          });
        }
        return false;
      }

      const { ticker, side, count } = orderParams;

      // Validate the market exists
      const marketsResponse = await getMarkets(ticker);
      const market = marketsResponse.markets.find((m: Market) => m.ticker === ticker);

      if (!market) {
        if (callback) {
          await callback({
            text: `I couldn't find a market with ticker "${ticker}". Double-check the ticker symbol and try again.`,
          });
        }
        return false;
      }

      // Create the order
      const price = side === 'yes' ? market.yes_ask : market.no_ask;
      logger.info(
        `Creating order: ${count} ${side.toUpperCase()} contracts of ${ticker} at $${(price / 100).toFixed(2)}`
      );

      const orderResponse = await createOrder(
        createOrderRequest({ ticker, side, count, type: 'market' })
      );

      if (!orderResponse) {
        if (callback) {
          await callback({
            text: `Something went wrong placing your order. Kalshi might be having issues right now - try again in a few minutes.`,
          });
        }
        return false;
      }

      let responseText = `${getRandomOpeningPhrase()} `;

      const priceFormatted = `$${(price / 100).toFixed(2)}`;
      const sideFormatted = side.toUpperCase();

      responseText += `Order placed successfully! `;
      responseText += `${count} ${sideFormatted} contracts of ${market.title} ${market.subtitle || ''} at ${priceFormatted} per contract. `;

      if (orderResponse.order) {
        const order = orderResponse.order;
        responseText += `Order ID: ${order.order_id}. Status: ${order.status.toUpperCase()}. `;

        if (order.status === 'executed') {
          responseText += `Your order was immediately executed! `;
        } else if (order.status === 'resting') {
          responseText += `Your order is now resting in the order book waiting for a match. `;
        }
      }

      responseText += `${getRandomRiskWarning()} ${getRandomClosingPhrase()}`;

      if (callback) {
        await callback(
          {
            text: responseText,
            actions: ['CREATE_KALSHI_ORDER'],
          },
          {
            // Pass order details in callback
            orderCreated: true,
            ticker,
            side,
            count,
            price,
            market: market,
            orderResponse,
          }
        );
      }

      return true;
    } catch (error) {
      logger.error('Error in CREATE_KALSHI_ORDER action:', error);

      let errorMessage = 'I ran into trouble placing your order. ';
      if (error instanceof Error) {
        if (error.message?.includes('insufficient')) {
          errorMessage +=
            'Looks like you might not have enough balance. Check your account and try a smaller position.';
        } else if (error.message?.includes('price')) {
          errorMessage +=
            "There might be an issue with the price you specified. Make sure it's within the valid range.";
        } else if (error.message?.includes('market')) {
          errorMessage +=
            'The market might be closed or the ticker is invalid. Double-check and try again.';
        } else {
          errorMessage +=
            "Could be API issues on Kalshi's end. Give it a few minutes and try again.";
        }
      }

      if (callback) {
        await callback({
          text: errorMessage,
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'Buy 100 YES contracts of PREZGEN-24 at $0.65' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Let's make this trade happen! Order placed successfully! 100 YES contracts of Will a Republican win the 2024 presidential election? at $0.65 per contract. Order ID: abc123. Status: RESTING. Your order is now resting in the order book waiting for a match. Don't risk more than 2-5% of your bankroll on this. Stay sharp and trade smart!",
          actions: ['CREATE_KALSHI_ORDER'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Place order for 50 NO on HOUSE-24 at 42 cents' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Time to get serious - here's what the smart money is doing. Order placed successfully! 50 NO contracts of Will Republicans control the House after 2024 elections? at $0.42 per contract. Order ID: xyz789. Status: EXECUTED. Your order was immediately executed! Only bet what you can afford to lose completely. Keep your strategy tight and your risk managed.",
          actions: ['CREATE_KALSHI_ORDER'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'I want to buy 200 YES contracts of SENATE-24 for $0.58 each' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Here's the deal - let me break down the market for you. Order placed successfully! 200 YES contracts of Will Democrats control the Senate after 2024 elections? at $0.58 per contract. Order ID: def456. Status: RESTING. Your order is now resting in the order book waiting for a match. Size your position appropriately - this isn't a lottery ticket. Discipline beats luck every single time.",
          actions: ['CREATE_KALSHI_ORDER'],
        },
      },
    ],
  ] as ActionExample[][],
};

/**
 * Parse order parameters from natural language text
 */
const parseOrderFromText = (text: string): OrderParams | null => {
  let lowerText = text.toLowerCase();

  // Extract side (yes/no)
  let side: 'yes' | 'no' | null = null;
  if (lowerText.includes('yes')) {
    side = 'yes';
  } else if (lowerText.includes('no')) {
    side = 'no';
  }

  text = text.replace(/\byes|no\b/i, '');

  // Extract ticker (look for all-caps words, possibly with dashes and numbers)
  const tickerMatch = text.match(/\b([A-Z]+(?:-[A-Z0-9.]+)*)\b/);
  const ticker = tickerMatch ? tickerMatch[1] : null;

  // Extract quantity (number before "contracts", "shares", etc.)
  const quantityMatch = lowerText.match(/(\d+)\s*(?:contracts?|shares?|units?)?/);
  const count = quantityMatch ? parseInt(quantityMatch[1]) : null;

  // Validate all required parameters are present
  if (!ticker || !side || !count) {
    return null;
  }

  // Validate ranges
  if (count <= 0 || count > 10000) {
    return null; // Invalid quantity
  }

  // // Extract price (various formats)
  // let price: number | null = null;

  // // $0.65 format
  // const dollarMatch = lowerText.match(/\$(\d+\.?\d*)/);
  // if (dollarMatch) {
  //   price = Math.round(parseFloat(dollarMatch[1]) * 100);
  // }

  // // 65 cents format
  // const centsMatch = lowerText.match(/(\d+)\s*cents?/);
  // if (centsMatch && !price) {
  //   price = parseInt(centsMatch[1]);
  // }

  // // 65c format
  // const centsShortMatch = lowerText.match(/(\d+)c\b/);
  // if (centsShortMatch && !price) {
  //   price = parseInt(centsShortMatch[1]);
  // }

  // // 0.65 format (assume dollars if decimal)
  // const decimalMatch = lowerText.match(/\b(\d+\.\d+)\b/);
  // if (decimalMatch && !price) {
  //   price = Math.round(parseFloat(decimalMatch[1]) * 100);
  // }

  return {
    ticker,
    side,
    count,
  };
};

export default action;

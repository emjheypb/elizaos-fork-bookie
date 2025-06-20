import {
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  logger,
  Memory,
  State,
  type Action,
} from '@elizaos/core';
import { getOrders } from '../../../services/kalshi/portfolio';
import {
  getRandomClosingPhrase,
  getRandomMarketInsight,
  getRandomOpeningPhrase,
  getRandomRiskWarning,
} from '../../utils';
import { getMarkets } from '../../../services/kalshi/market';

const action: Action = {
  name: 'GET_KALSHI_ORDERS',
  similes: [
    'KALSHI_ORDERS',
    'KALSHI_ORDER_HISTORY',
    'CHECK_KALSHI_ORDERS',
    'KALSHI_POSITIONS',
    'SHOW_KALSHI_ORDERS',
    'KALSHI_PORTFOLIO_ORDERS',
    'KALSHI_ORDER_STATUS',
  ],
  description: "Fetch the user's orders from Kalshi. Run this action by itself",
  validate: async (_runtime: IAgentRuntime, message: Memory) => {
    logger.info('*** Validating GET_KALSHI_ORDERS action ***');
    const text = message.content.text ? message.content.text.toLowerCase() : '';

    // Enhanced keywords for order/trade context
    const orderKeywords = [
      'orders',
      'order',
      'positions',
      'position',
      'portfolio',
      'history',
    ];

    const actionKeywords = [
      'check',
      'show',
      'get',
      "what's",
      'whats',
      'how many',
      'tell me',
      'see',
      'look at',
      'display',
      'list',
      'view',
    ];

    const hasOrderKeyword = orderKeywords.some((keyword) => text.includes(keyword));
    const hasActionKeyword = actionKeywords.some((keyword) => text.includes(keyword));
    const mentionsKalshi = text.includes('kalshi');

    // More flexible validation - either explicit mention of Kalshi + order terms
    // OR order inquiry in trading context
    const isKalshiOrderRequest = mentionsKalshi && hasOrderKeyword;
    const isGeneralOrderInTradingContext = hasOrderKeyword && hasActionKeyword;

    return (isKalshiOrderRequest || isGeneralOrderInTradingContext) && text.length > 3;
  },
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State | undefined,
    _options: any,
    callback?: HandlerCallback
  ) => {
    logger.info('*** Executing GET_KALSHI_ORDERS action ***');
    try {
      const ordersResponse = await getOrders();

      if (!ordersResponse) {
        if (callback) {
          await callback({
            text: `${getRandomOpeningPhrase()} I'm having connection issues with Kalshi right now and can't pull your orders. The platform might be having hiccups - try again in a few minutes. ${getRandomMarketInsight()}`,
          });
        }
        return true;
      }
      const orderTickers = ordersResponse.orders.map((order) => order.ticker).join(',');
      const marketsResponse = await getMarkets(orderTickers);

      logger.info('GET_KALSHI_ORDERS response:', ordersResponse);

      const orders = ordersResponse.orders || [];
      const activeOrders = orders.filter(
        (order: any) => order.status === 'resting' || order.status === 'pending'
      );
      const executedOrders = orders.filter((order: any) => order.status === 'executed');
      const canceledOrders = orders.filter((order: any) => order.status === 'canceled');
      const totalOrders = orders.length;

      let responseText = `${getRandomOpeningPhrase()} `;

      if (totalOrders === 0) {
        responseText +=
          "You don't have any orders on Kalshi yet. Clean slate - time to make some moves! ";
      } else {
        responseText += `Here's your Kalshi order breakdown: ${totalOrders} total orders. `;

        if (activeOrders.length > 0) {
          responseText += `${activeOrders.length} active orders (resting/pending). `;
        }

        if (executedOrders.length > 0) {
          responseText += `${executedOrders.length} orders have been executed. `;
        }

        if (canceledOrders.length > 0) {
          responseText += `${canceledOrders.length} orders were canceled. `;
        }

        // Add details about recent orders
        const recentOrdersCount = Math.min(5, orders.length);
        const recentOrders = orders.slice(0, recentOrdersCount);
        if (recentOrders.length > 0) {
          responseText += `Your ${recentOrders.length < 5 ? recentOrders.length : recentOrdersCount} most recent orders:\n`;
          recentOrders.forEach((order: any, index: number) => {
            const market = marketsResponse.markets.find((market) => market.ticker === order.ticker);
            const price =
              order.side === 'yes'
                ? `$${(order.yes_price / 100).toFixed(2)}`
                : `$${(order.no_price / 100).toFixed(2)}`;
            const side = order.side === 'yes' ? 'YES' : 'NO';
            const status = order.status.toUpperCase();
            const contracts = order.fill_count + order.remaining_count;
            responseText += `${index + 1}. ${market ? `${market.title} ${market.subtitle}` : ''} - ${contracts} ${side} contracts @ ${price} per contract (${status})${index < orders.length - 1 ? ',\n' : '. '}`;
          });
        }
      }

      responseText += `${getRandomRiskWarning()} ${getRandomClosingPhrase()}`;

      if (callback) {
        await callback(
          {
            text: responseText,
            actions: ['GET_KALSHI_ORDERS'],
          },
          {
            // Pass detailed order data in callback
            totalOrders,
            activeOrders: activeOrders.length,
            executedOrders: executedOrders.length,
            canceledOrders: canceledOrders.length,
            orders: orders,
            apiResponse: ordersResponse,
          }
        );
      }

      return true;
    } catch (error) {
      logger.error('Error in GET_KALSHI_ORDERS action:', error);
      if (callback) {
        await callback({
          text: `${getRandomOpeningPhrase()} The connection to Kalshi is acting up and I can't get your orders right now. Could be API issues on their end. Give it a few minutes and try again - these platforms can be temperamental. ${getRandomMarketInsight()}`,
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'What are my Kalshi orders?' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Alright, let's see what positions you've got cooking. Here's your Kalshi order breakdown: 5 total orders. 2 active orders (resting/pending). 3 orders have been executed. Your most recent orders: 1. 100 YES contracts @ $0.65 per contract (RESTING), 2. 100 NO contracts @ $0.42 per contract (EXECUTED), 3. 100 YES contracts @ $0.58 per contract (EXECUTED). Don't risk more than 2-5% of your bankroll on this. Keep your head cool and your bankroll management tight.",
          actions: ['GET_KALSHI_ORDERS'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Check my Kalshi order history' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Time to get serious - here's what the smart money is doing. Here's your Kalshi order breakdown: 12 total orders. 1 active orders (resting/pending). 11 orders have been executed. Your most recent orders: 1. 100 NO contracts @ $0.33 per contract (RESTING), 2. 100 YES contracts @ $0.71 per contract (EXECUTED), 3. 100 NO contracts @ $0.29 per contract (EXECUTED). Only bet what you can afford to lose completely. Remember - discipline beats luck every single time.",
          actions: ['GET_KALSHI_ORDERS'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Show me my active trades on Kalshi' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Here's the deal - let me break down the market for you. Here's your Kalshi order breakdown: 3 total orders. 3 active orders (resting/pending). 0 orders have been executed. Your most recent orders: 1. 100 YES contracts @ $0.55 per contract (RESTING), 2. 100 NO contracts @ $0.38 per contract (PENDING), 3. 100 YES contracts @ $0.62 per contract (RESTING). Size your position appropriately - this isn't a lottery ticket. Risk management isn't sexy, but it's what keeps you in the game.",
          actions: ['GET_KALSHI_ORDERS'],
        },
      },
    ],
  ] as ActionExample[][],
};

export default action;

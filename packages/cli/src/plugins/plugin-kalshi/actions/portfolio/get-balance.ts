import {
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  logger,
  Memory,
  State,
  type Action,
} from '@elizaos/core';
import { getBalance } from '../../services/portfolio';
import { getRandomClosingPhrase, getRandomOpeningPhrase, getRandomRiskWarning } from '../utils';

const action: Action = {
  name: 'GET_KALSHI_BALANCE',
  similes: [
    'KALSHI_BALANCE',
    'KALSHI_WALLET_BALANCE',
    'CHECK_KALSHI_FUNDS',
    'KALSHI_ACCOUNT_BALANCE',
    'KALSHI_BANKROLL',
    'KALSHI_MONEY',
    'KALSHI_CASH',
    'SHOW_KALSHI_BALANCE',
    'KALSHI_PORTFOLIO_BALANCE',
    'GET_KALSHI_FUNDS',
    'KALSHI_MYBALANCE',
  ],
  description: "Fetch the user's balance in Kalshi. Only run this action by itself.",
  validate: async (_runtime: IAgentRuntime, message: Memory) => {
    logger.info('*** Validating GET_KALSHI_BALANCE action ***');
    const text = message.content.text ? message.content.text.toLowerCase() : '';

    // Enhanced keywords for trading context
    const balanceKeywords = [
      'balance',
      'wallet',
      'funds',
      'money',
      'cash',
      'bankroll',
      'account',
      'portfolio',
      'capital',
      'available',
      'worth',
    ];

    const actionKeywords = [
      'check',
      'show',
      'get',
      "what's",
      'whats',
      'how much',
      'tell me',
      'see',
      'look at',
      'display',
    ];

    const hasBalanceKeyword = balanceKeywords.some((keyword) => text.includes(keyword));
    const hasActionKeyword = actionKeywords.some((keyword) => text.includes(keyword));
    const mentionsKalshi = text.includes('kalshi');
    const mentionsTelegramCommand = text.includes('kalshi_mybalance');

    // More flexible validation - either explicit mention of Kalshi + balance terms
    // OR balance inquiry in trading context
    const isKalshiBalanceRequest = mentionsKalshi && hasBalanceKeyword;
    const isGeneralBalanceInTradingContext = hasBalanceKeyword && hasActionKeyword;

    return (
      (isKalshiBalanceRequest || isGeneralBalanceInTradingContext || mentionsTelegramCommand) &&
      text.length > 3
    );
  },
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State | undefined,
    _options: any,
    callback?: HandlerCallback
  ) => {
    logger.info('*** Executing GET_KALSHI_BALANCE action ***');
    try {
      const balance = await getBalance();

      if (!balance) {
        if (callback) {
          await callback({
            text: `I'm having connection issues with Kalshi right now and can't pull your balance. The platform might be having hiccups - try again in a few minutes.`,
          });
        }
        return true;
      }

      logger.info('GET_KALSHI_BALANCE balance:', balance);

      const balanceAmount = balance.balance / 100;
      const isHealthyBankroll = balanceAmount > 100;

      const responseText = `${getRandomOpeningPhrase()} Your Kalshi balance is $${balanceAmount}. ${
        isHealthyBankroll
          ? "You've got some decent firepower there."
          : 'Running a bit lean - might want to consider your position sizing carefully.'
      } ${getRandomRiskWarning()} ${getRandomClosingPhrase()}`;

      if (callback) {
        await callback(
          {
            text: responseText,
            actions: ['GET_KALSHI_BALANCE'],
          },
          {
            // Pass the exact balance in callback data
            exactBalance: balanceAmount,
            apiResponse: balance,
          }
        );
      }

      return true;
    } catch (error) {
      logger.error('Error in GET_KALSHI_BALANCE action:', error);
      if (callback) {
        await callback({
          text: `The connection to Kalshi is acting up and I can't get your balance right now. Could be API issues on their end. Give it a few minutes and try again - these platforms can be temperamental.`,
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: "What's my Kalshi balance?" },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Alright, let's talk numbers and see what we're working with. Your Kalshi balance is $1,250. You've got some decent firepower there. Don't risk more than 2-5% of your bankroll on this. Remember - discipline beats luck every single time.",
          actions: ['GET_KALSHI_BALANCE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Check my Kalshi wallet balance' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Here's the deal - let me break down the market for you. Your Kalshi balance is $75. Running a bit lean - might want to consider your position sizing carefully. Only bet what you can afford to lose completely. Keep your head cool and your bankroll management tight.",
          actions: ['GET_KALSHI_BALANCE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'How much money do I have on Kalshi?' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Time to get serious - here's what the smart money is doing. Your Kalshi balance is $500. You've got some decent firepower there. Size your position appropriately - this isn't a lottery ticket. Risk management isn't sexy, but it's what keeps you in the game.",
          actions: ['GET_KALSHI_BALANCE'],
        },
      },
    ],
  ] as ActionExample[][],
};

export default action;

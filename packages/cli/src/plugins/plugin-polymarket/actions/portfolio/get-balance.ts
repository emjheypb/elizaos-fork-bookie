import {
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  logger,
  Memory,
  State,
  type Action,
} from '@elizaos/core';
import { getBalanceCollateral } from '../../services/portfolio';
import { BalanceAllowances } from '../../types/portfolio';
import {
  getRandomClosingPhrase,
  getRandomOpeningPhrase,
  getRandomRiskWarning,
} from '../../../utils';

const action: Action = {
  name: 'GET_POLYMARKET_BALANCE',
  similes: [
    'POLYMARKET_BALANCE',
    'POLYMARKET_WALLET_BALANCE',
    'CHECK_POLYMARKET_FUNDS',
    'POLYMARKET_ACCOUNT_BALANCE',
    'POLYMARKET_BANKROLL',
    'POLYMARKET_MONEY',
    'POLYMARKET_CASH',
    'SHOW_POLYMARKET_BALANCE',
    'POLYMARKET_PORTFOLIO_BALANCE',
    'GET_POLYMARKET_FUNDS',
    'POLYMARKET_MYBALANCE',
  ],
  description:
    "Fetch the user's balance and allowances in Polymarket. Only run this action by itself.",
  validate: async (_runtime: IAgentRuntime, message: Memory) => {
    logger.info('*** Validating GET_POLYMARKET_BALANCE action ***');
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
      'allowance',
      'allowances',
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
    const mentionsPolymarket = text.includes('polymarket');
    const mentionsTelegramCommand = text.includes('polymarket_mybalance');

    // More flexible validation - either explicit mention of Polymarket + balance terms
    // OR balance inquiry in trading context
    const isPolymarketBalanceRequest = mentionsPolymarket && hasBalanceKeyword;
    const isGeneralBalanceInTradingContext = hasBalanceKeyword && hasActionKeyword;

    return (
      (isPolymarketBalanceRequest || isGeneralBalanceInTradingContext || mentionsTelegramCommand) &&
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
    logger.info('*** Executing GET_POLYMARKET_BALANCE action ***');
    try {
      const balanceData: BalanceAllowances = await getBalanceCollateral();

      if (!balanceData) {
        if (callback) {
          await callback({
            text: `I'm having connection issues with Polymarket right now and can't pull your balance. The platform might be having hiccups - try again in a few minutes.`,
          });
        }
        return true;
      }

      logger.info('GET_POLYMARKET_BALANCE balance:', balanceData);

      // Convert balance from wei to readable format (assuming 6 decimals for USDC)
      const balanceAmount = parseInt(balanceData.balance) / 1000000;
      const allowanceCount = Object.keys(balanceData.allowances).length;
      const isHealthyBankroll = balanceAmount > 100;

      const responseText = `${getRandomOpeningPhrase()} Your Polymarket balance is $${balanceAmount.toFixed(2)} with ${allowanceCount} active allowances. ${
        isHealthyBankroll
          ? "You've got some decent firepower there."
          : 'Running a bit lean - might want to consider your position sizing carefully.'
      } ${getRandomRiskWarning()} ${getRandomClosingPhrase()}`;

      if (callback) {
        await callback(
          {
            text: responseText,
            actions: ['GET_POLYMARKET_BALANCE'],
          },
          {
            // Pass the exact balance and allowances in callback data
            exactBalance: balanceAmount,
            allowanceCount: allowanceCount,
            apiResponse: balanceData,
          }
        );
      }

      return true;
    } catch (error) {
      logger.error('Error in GET_POLYMARKET_BALANCE action:', error);
      if (callback) {
        await callback({
          text: `The connection to Polymarket is acting up and I can't get your balance right now. Could be API issues on their end. Give it a few minutes and try again - these platforms can be temperamental.`,
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: "What's my Polymarket balance?" },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Alright, let's talk numbers and see what we're working with. Your Polymarket balance is $1,250.00 with 3 active allowances. You've got some decent firepower there. Don't risk more than 2-5% of your bankroll on this. Remember - discipline beats luck every single time.",
          actions: ['GET_POLYMARKET_BALANCE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Check my Polymarket wallet balance' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Here's the deal - let me break down the market for you. Your Polymarket balance is $75.00 with 2 active allowances. Running a bit lean - might want to consider your position sizing carefully. Only bet what you can afford to lose completely. Keep your head cool and your bankroll management tight.",
          actions: ['GET_POLYMARKET_BALANCE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'How much money do I have on Polymarket?' },
      },
      {
        name: '{{agent}}',
        content: {
          text: "Time to get serious - here's what the smart money is doing. Your Polymarket balance is $500.00 with 4 active allowances. You've got some decent firepower there. Size your position appropriately - this isn't a lottery ticket. Risk management isn't sexy, but it's what keeps you in the game.",
          actions: ['GET_POLYMARKET_BALANCE'],
        },
      },
    ],
  ] as ActionExample[][],
};

export default action;

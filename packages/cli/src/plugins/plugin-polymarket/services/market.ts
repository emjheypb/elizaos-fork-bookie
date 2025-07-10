import { authL2 } from './base';
import {
  Market,
  MarketsCompiled,
  MarketsCompiledSchema,
  MarketsResponseSchema,
} from '../types/market';

interface MarketsResponse {
  data: Market[];
  next_cursor?: string;
  count: number;
  limit: number;
}

export const getOpenActiveMarkets = async (words: string[]): Promise<MarketsCompiled> => {
  let next: string = '';
  let count: number = 0;
  const data: Market[] = [];

  while (next !== 'LTE=') {
    const clobClient = await authL2();
    const resp: MarketsResponse = await clobClient.getMarkets(next);

    const validatedResponse = MarketsResponseSchema.parse(resp);
    const filtered_data = validatedResponse.data.filter(
      (market) =>
        market.accepting_orders &&
        !market.closed &&
        !market.archived &&
        market.active &&
        (words.every(
          (word) =>
            market.question.toLowerCase().includes(word) ||
            market.market_slug.toLowerCase().includes(word) ||
            (market.category && market.category.toLowerCase().includes(word)) ||
            (market.description && market.description.toLowerCase().includes(word)) ||
            (market.tags && market.tags.map((item) => item.toLowerCase()).includes(word))
        ) ||
          words.includes(market.condition_id))
    );
    data.push(...filtered_data);

    next = resp.next_cursor || 'LTE=';
    count++;
    console.log(count, ':', next, filtered_data.length, '/', data.length);
  }

  const validatedCompiledResponse = MarketsCompiledSchema.parse({
    data: data,
    count: data.length,
  });
  return validatedCompiledResponse;
};

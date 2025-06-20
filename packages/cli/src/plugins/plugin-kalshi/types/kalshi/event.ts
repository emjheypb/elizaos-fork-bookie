import { z } from 'zod';
import { MarketSchema } from './market';

// Zod schemas for validation
export const EventSchema = z
  .object({
    category: z.string(),
    collateral_return_type: z.string(),
    event_ticker: z.string(),
    markets: z.array(MarketSchema).optional(),
    mutually_exclusive: z.boolean(),
    series_ticker: z.string(),
    strike_date: z.string().datetime().optional(),
    strike_period: z.string().optional(),
    sub_title: z.string(),
    title: z.string().optional(),
  })
  .passthrough();

export const EventsResponseSchema = z
  .object({
    cursor: z.string(),
    events: z.array(EventSchema),
  })
  .passthrough();

// Type exports for TypeScript usage
export type Event = z.infer<typeof EventSchema>;
export type EventsResponse = z.infer<typeof EventsResponseSchema>;

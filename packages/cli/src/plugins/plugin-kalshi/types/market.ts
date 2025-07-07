import { z } from 'zod';

// Enum schemas
const ResponsePriceUnitsSchema = z.enum(['usd_cent', 'usd_centi_cent']);

const MarketResultSchema = z.enum(['yes', 'no', 'void', 'scalar', 'all_no', 'all_yes']);

const MarketStrikeTypeSchema = z.enum([
  'unknown',
  'greater',
  'less',
  'greater_or_equal',
  'less_or_equal',
  'between',
  'functional',
  'custom',
  'structured',
]);

// Zod schemas for validation
const CustomStrikeSchema = z.record(z.unknown()).optional();

export const MarketSchema = z
  .object({
    can_close_early: z.boolean(),
    cap_strike: z.number().optional(),
    category: z.string(),
    close_time: z.string().datetime(),
    custom_strike: CustomStrikeSchema,
    event_ticker: z.string(),
    expected_expiration_time: z.string().datetime().optional(),
    expiration_time: z.string().datetime(),
    expiration_value: z.string(),
    fee_waiver_expiration_time: z.string().datetime().optional(),
    floor_strike: z.number().optional(),
    functional_strike: z.string().optional(),
    last_price: z.number().int(),
    latest_expiration_time: z.string().datetime(),
    liquidity: z.number().int(),
    market_type: z.string(),
    no_ask: z.number().int(),
    no_bid: z.number().int(),
    no_sub_title: z.string(),
    notional_value: z.number().int(),
    open_interest: z.number().int(),
    open_time: z.string().datetime(),
    previous_price: z.number().int(),
    previous_yes_ask: z.number().int(),
    previous_yes_bid: z.number().int(),
    response_price_units: ResponsePriceUnitsSchema,
    result: z.union([MarketResultSchema, z.literal(''), z.null()]).optional(),
    risk_limit_cents: z.number().int(),
    rules_primary: z.string(),
    rules_secondary: z.string(),
    settlement_timer_seconds: z.number().int(),
    settlement_value: z.number().int().optional(),
    status: z.string(),
    strike_type: MarketStrikeTypeSchema.optional(),
    subtitle: z.string(),
    tick_size: z.number().int(),
    ticker: z.string(),
    title: z.string().optional(),
    volume: z.number().int(),
    volume_24h: z.number().int(),
    yes_ask: z.number().int(),
    yes_bid: z.number().int(),
    yes_sub_title: z.string(),
  })
  .passthrough();

export const MarketResponseSchema = z
  .object({
    markets: z.array(MarketSchema),
  })
  .passthrough();

// Type inference from schemas
export type Market = z.infer<typeof MarketSchema>;
export type MarketResponse = z.infer<typeof MarketResponseSchema>;
export type ResponsePriceUnits = z.infer<typeof ResponsePriceUnitsSchema>;
export type MarketResult = z.infer<typeof MarketResultSchema>;
export type MarketStrikeType = z.infer<typeof MarketStrikeTypeSchema>;

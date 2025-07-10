import { z } from 'zod';

// Token schema for market outcomes
const TokenSchema = z
  .object({
    token_id: z.string(),
    outcome: z.string(),
    // Fields not in official docs - marked as optional
    price: z.number().optional(),
    winner: z.boolean().optional(),
  })
  .passthrough();

// Rewards rates schema (not in official docs - marked as optional)
const RewardsRateSchema = z
  .object({
    asset_address: z.string(),
    rewards_daily_rate: z.number(),
  })
  .passthrough();

// Rewards schema
const RewardsSchema = z
  .object({
    min_size: z.number(),
    max_spread: z.number(),
    // Fields from official docs
    event_start_date: z.string().optional(),
    event_end_date: z.string().optional(),
    in_game_multiplier: z.number().optional(),
    reward_epoch: z.number().optional(),
    // Fields not in official docs - marked as optional
    rates: z.array(RewardsRateSchema).nullable().optional(),
  })
  .passthrough();

// Main market schema
const MarketSchema = z
  .object({
    // Required fields from official docs
    condition_id: z.string(),
    question_id: z.string(),
    tokens: z.array(TokenSchema),
    rewards: RewardsSchema,
    minimum_order_size: z.number(), // Note: docs say string, but data shows number
    minimum_tick_size: z.number(), // Note: docs say string, but data shows number
    category: z.string().optional(),
    end_date_iso: z.string().nullable(),
    game_start_time: z.string().nullable(),
    question: z.string(),
    market_slug: z.string(),
    min_incentive_size: z.string().optional(),
    max_incentive_spread: z.string().optional(),
    active: z.boolean(),
    closed: z.boolean(),
    seconds_delay: z.number(),
    icon: z.string(),
    fpmm: z.string(),

    // Fields not in official docs - marked as optional
    enable_order_book: z.boolean().optional(),
    archived: z.boolean().optional(),
    accepting_orders: z.boolean().optional(),
    accepting_order_timestamp: z.string().optional().nullable(),
    description: z.string().optional(),
    maker_base_fee: z.number().optional(),
    taker_base_fee: z.number().optional(),
    notifications_enabled: z.boolean().optional(),
    neg_risk: z.boolean().optional(),
    neg_risk_market_id: z.string().optional(),
    neg_risk_request_id: z.string().optional(),
    image: z.string().optional(),
    is_50_50_outcome: z.boolean().optional(),
    tags: z.array(z.string()).optional().nullable(),
  })
  .passthrough();

// Response schema for the GET /markets endpoint
const MarketsResponseSchema = z
  .object({
    data: z.array(MarketSchema),
    next_cursor: z.string().optional(),
    count: z.number(),
    limit: z.number(),
  })
  .passthrough();

// Response schema for compiled MarketsResponse Results
const MarketsCompiledSchema = z
  .object({
    data: z.array(MarketSchema),
    count: z.number(),
  })
  .passthrough();

// Type inference for TypeScript usage
export type Token = z.infer<typeof TokenSchema>;
export type RewardsRate = z.infer<typeof RewardsRateSchema>;
export type Rewards = z.infer<typeof RewardsSchema>;
export type Market = z.infer<typeof MarketSchema>;
export type MarketsResponse = z.infer<typeof MarketsResponseSchema>;
export type MarketsCompiled = z.infer<typeof MarketsCompiledSchema>

// Export schemas for validation
export { TokenSchema, RewardsRateSchema, RewardsSchema, MarketSchema, MarketsResponseSchema, MarketsCompiledSchema };

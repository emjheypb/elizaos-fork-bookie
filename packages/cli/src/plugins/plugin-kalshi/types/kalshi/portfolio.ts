import { z } from 'zod';

// Zod schemas for validation
export const BalanceResponseSchema = z
  .object({
    balance: z.number(),
    payout: z.number().optional(),
    // Add more fields based on actual Kalshi balance API response
  })
  .passthrough(); // Allow additional fields

export const OrderSchema = z.object({
  action: z.enum(['buy', 'sell']),
  client_order_id: z.string(),
  created_time: z.string().datetime(),
  expiration_time: z.string().datetime(),
  fill_count: z.number().int(),
  initial_count: z.number().int(),
  last_update_time: z.string().datetime(),
  maker_fees: z.number().int(),
  maker_fill_cost: z.number().int(),
  no_price: z.number().int(),
  order_id: z.string(),
  queue_position: z.number().int(),
  remaining_count: z.number().int(),
  side: z.enum(['yes', 'no']),
  status: z.enum(['resting', 'canceled', 'executed', 'pending']),
  taker_fees: z.number().int(),
  taker_fill_cost: z.number().int(),
  ticker: z.string(),
  type: z.enum(['market', 'limit']),
  user_id: z.string(),
  yes_price: z.number().int(),
});

export const OrdersResponseSchema = z
  .object({
    cursor: z.string(),
    orders: z.array(OrderSchema),
  })
  .passthrough(); // Allow additional fields

// Type inference from schemas
export type BalanceResponse = z.infer<typeof BalanceResponseSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrdersResponse = z.infer<typeof OrdersResponseSchema>;

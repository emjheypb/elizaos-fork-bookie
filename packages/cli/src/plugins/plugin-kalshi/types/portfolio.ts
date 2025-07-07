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
  expiration_time: z.union([z.string().datetime(), z.null()]),
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
  status: z.enum(['resting', 'canceled', 'executed', 'pending', 'unknown']),
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

// --- --- --- --- --- CREATE ORDER --- --- --- --- ---
// Enums for better type safety
export const OrderSideEnum = z.enum(['yes', 'no']);
export const OrderTypeEnum = z.enum(['market', 'limit']);
export const OrderStatusEnum = z.enum(['pending', 'resting', 'executed', 'canceled', 'expired']);

// Request Schema
export const CreateOrderRequestSchema = z
  .object({
    action: z.literal('buy'),

    client_order_id: z.string().max(100, 'Client order ID too long'),

    ticker: z
      .string()
      .min(1, 'Ticker is required')
      .max(50, 'Ticker too long')
      .regex(/^[A-Z0-9-]+$/, 'Ticker must contain only uppercase letters, numbers, and hyphens'),

    side: OrderSideEnum,

    count: z
      .number()
      .int('Count must be an integer')
      .min(1, 'Count must be at least 1')
      .max(100000, 'Count cannot exceed 100,000'),

    type: OrderTypeEnum,

    // Price in cents (e.g., 65 for $0.65) - only for limit orders
    yes_price: z
      .number()
      .int('Price must be an integer (in cents)')
      .min(1, 'Price must be at least 1 cent')
      .max(99, 'Price cannot exceed 99 cents')
      .optional(),

    no_price: z
      .number()
      .int('Price must be an integer (in cents)')
      .min(1, 'Price must be at least 1 cent')
      .max(99, 'Price cannot exceed 99 cents')
      .optional(),
  })
  .refine(
    (data) => {
      // For limit orders, either yes_price or no_price must be provided based on side
      if (data.type === 'limit') {
        if (data.side === 'yes' && !data.yes_price) {
          return false;
        }
        if (data.side === 'no' && !data.no_price) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'For limit orders, price must be provided for the corresponding side',
      path: ['yes_price', 'no_price'],
    }
  )
  .refine(
    (data) => {
      // For market orders, price fields should not be present
      if (data.type === 'market') {
        if (data.yes_price !== undefined || data.no_price !== undefined) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Market orders should not include price fields',
      path: ['yes_price', 'no_price'],
    }
  );

// Order object in response - updated to match actual API response
export const CreateOrderSchema = z.object({
  order_id: z.string(),
  user_id: z.string(),
  ticker: z.string(),
  status: OrderStatusEnum,
  yes_price: z.number().int(), // Always present in response
  no_price: z.number().int(), // Always present in response
  created_time: z.string(), // ISO 8601 string format
  expiration_time: z.string().nullable(),
  self_trade_prevention_type: z.string(),
  action: z.literal('buy'),
  side: OrderSideEnum,
  type: OrderTypeEnum,
  client_order_id: z.string(),
  order_group_id: z.string(),
});

// Response Schema
export const CreateOrderResponseSchema = z.object({
  order: CreateOrderSchema,
});

// Error Response Schema
export const CreateOrderErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

// Combined response type (success or error)
export const CreateOrderApiResponseSchema = z.union([
  CreateOrderResponseSchema,
  z.object({
    error: CreateOrderErrorSchema,
  }),
]);

// Type exports for TypeScript
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;
export type CreateOrderError = z.infer<typeof CreateOrderErrorSchema>;
export type CreateOrderApiResponse = z.infer<typeof CreateOrderApiResponseSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type OrderSide = z.infer<typeof OrderSideEnum>;
export type OrderType = z.infer<typeof OrderTypeEnum>;
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// Utility functions for validation
export const validateCreateOrderRequest = (data: unknown): CreateOrderRequest => {
  return CreateOrderRequestSchema.parse(data);
};

export const validateCreateOrderResponse = (data: unknown): CreateOrderResponse => {
  return CreateOrderResponseSchema.parse(data);
};

// Helper function to create order request with proper price mapping
export const createOrderRequest = (params: {
  ticker: string;
  side: OrderSide;
  count: number;
  price?: number; // Price in cents - only for limit orders
  type: OrderType;
}): CreateOrderRequest => {
  const baseRequest = {
    action: 'buy' as const,
    client_order_id: `bookie-${Date.now()}-${crypto.randomUUID()}`,
    ticker: params.ticker,
    side: params.side,
    count: params.count,
    type: params.type,
  };

  // For limit orders, set price based on side
  if (params.type === 'limit' && params.price !== undefined) {
    if (params.side === 'yes') {
      return {
        ...baseRequest,
        yes_price: params.price,
      };
    } else {
      return {
        ...baseRequest,
        no_price: params.price,
      };
    }
  }

  // For market orders, no price fields
  return baseRequest;
};

// Example usage and validation
export const exampleLimitOrderRequest: CreateOrderRequest = {
  action: 'buy',
  client_order_id: 'my-order-123',
  ticker: 'PREZGEN-24',
  side: 'yes',
  count: 100,
  type: 'limit',
  yes_price: 65, // $0.65
};

export const exampleMarketOrderRequest: CreateOrderRequest = {
  action: 'buy',
  client_order_id: 'my-market-order-456',
  ticker: 'PREZGEN-24',
  side: 'no',
  count: 50,
  type: 'market',
};

// Example responses based on the provided samples
export const exampleMarketOrderResponse: CreateOrderResponse = {
  order: {
    order_id: '9885f06a-c579-4117-80ba-77ec96e3a1d3',
    user_id: 'a128ecd8-9211-4bbc-b5a7-c0a229834d24',
    ticker: 'KXDOGEMAX1-25-SEP01-0.99999999',
    status: 'executed',
    yes_price: 1,
    no_price: 99,
    created_time: '2025-06-23T14:42:45.205026Z',
    expiration_time: null,
    self_trade_prevention_type: '',
    action: 'buy',
    side: 'no',
    type: 'market',
    client_order_id: 'test-order-1',
    order_group_id: '',
  },
};

export const exampleLimitOrderResponse: CreateOrderResponse = {
  order: {
    order_id: 'a413efef-22c0-4133-9829-9a22de788cbb',
    user_id: 'a128ecd8-9211-4bbc-b5a7-c0a229834d24',
    ticker: 'KXGTAPRICE-100',
    status: 'resting',
    yes_price: 99,
    no_price: 1,
    created_time: '2025-06-23T14:37:05.273003Z',
    expiration_time: null,
    self_trade_prevention_type: '',
    action: 'buy',
    side: 'no',
    type: 'limit',
    client_order_id: 'test-order-2',
    order_group_id: '',
  },
};

// Validate the examples
try {
  validateCreateOrderRequest(exampleLimitOrderRequest);
  console.log('✅ Limit order request example is valid');

  validateCreateOrderRequest(exampleMarketOrderRequest);
  console.log('✅ Market order request example is valid');

  validateCreateOrderResponse(exampleMarketOrderResponse);
  console.log('✅ Market order response example is valid');

  validateCreateOrderResponse(exampleLimitOrderResponse);
  console.log('✅ Limit order response example is valid');
} catch (error) {
  console.error('❌ Example validation failed:', error);
}

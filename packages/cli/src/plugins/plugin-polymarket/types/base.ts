import { z } from 'zod';

// Zod schemas for validation
export const ErrorResponseSchema = z
  .object({
    error: z.string().optional(),
    message: z.string().optional(),
    details: z.any().optional(),
  })
  .passthrough(); // Allow additional fields

// Type inference from schemas
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

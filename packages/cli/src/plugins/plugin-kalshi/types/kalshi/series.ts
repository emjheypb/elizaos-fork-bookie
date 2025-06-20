import { z } from 'zod';

// Zod schemas for validation
const SettlementSourceSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

const ProductMetadataSchema = z.record(z.any());

export const SeriesSchema = z.object({
  category: z.string(),
  contract_url: z.string(),
  frequency: z.string(),
  product_metadata: z.union([ProductMetadataSchema, z.null()]).optional(),
  settlement_sources: z.array(SettlementSourceSchema).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  ticker: z.string(),
  title: z.string(),
}).passthrough();

export const SeriesResponseSchema = z.object({
  series: z.array(SeriesSchema),
});

// Type exports for TypeScript usage
export type SettlementSource = z.infer<typeof SettlementSourceSchema>;
export type ProductMetadata = z.infer<typeof ProductMetadataSchema>;
export type Series = z.infer<typeof SeriesSchema>;
export type SeriesResponse = z.infer<typeof SeriesResponseSchema>;
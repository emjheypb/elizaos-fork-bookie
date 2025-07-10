import { z } from 'zod';

// Ethereum address regex pattern (0x followed by 40 hex characters)
const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

const BalanceAllowancesSchema = z.object({
  balance: z.string(),
  allowances: z.record(
    z.string().regex(ethereumAddressRegex, 'Invalid Ethereum address format'),
    z.string()
  ),
});

// Type inference
type BalanceAllowances = z.infer<typeof BalanceAllowancesSchema>;

export { BalanceAllowancesSchema, type BalanceAllowances };

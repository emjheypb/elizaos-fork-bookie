import { AssetType } from '@polymarket/clob-client';
import { authL2 } from './base';
import { BalanceAllowances, BalanceAllowancesSchema } from '../types/portfolio';

export const getBalanceCollateral = async (): Promise<BalanceAllowances> => {
  const clobClient = await authL2();
  const resp = await clobClient.getBalanceAllowance({
    asset_type: AssetType.COLLATERAL,
  });

  const validatedResponse = BalanceAllowancesSchema.parse(resp);
  console.log('Balance Collateral:', validatedResponse);
  return validatedResponse;
};

export const getBalanceConditional = async (token_id: string): Promise<BalanceAllowances> => {
  const clobClient = await authL2();
  const resp = await clobClient.getBalanceAllowance({
    asset_type: AssetType.CONDITIONAL,
    token_id: token_id,
  });

  const validatedResponse = BalanceAllowancesSchema.parse(resp);
  console.log('Balance Collateral:', validatedResponse);
  return validatedResponse;
};

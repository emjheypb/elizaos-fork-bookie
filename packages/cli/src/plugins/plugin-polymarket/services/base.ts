import { ClobClient } from '@polymarket/clob-client';
import { Wallet } from '@ethersproject/wallet';

const PRIVATE_KEY = process.env.POLYMARKET_MAGIC_PRIVATE_KEY;
const WALLET = process.env.POLYMARKET_MAGIC_WALLET;

const host = process.env.POLYMARKET_CLOB || 'https://clob.polymarket.com';
const funder = WALLET; //This is your Polymarket Profile Address, where you send UDSC to.
const signer = new Wallet(PRIVATE_KEY || 'MISSING KEY');
const signatureType = 1; // 0: EOA; 1: Magic/Email Login; 2: Browser Wallet(Metamask, Coinbase Wallet, etc)

export const authL1 = () => {
  return new ClobClient(host, 137, signer);
};

export const authL2 = async () => {
  const creds = authL1().createOrDeriveApiKey();
  return new ClobClient(host, 137, signer, await creds, signatureType, funder);
};

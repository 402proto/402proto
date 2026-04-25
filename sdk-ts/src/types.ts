/**
 * shared types.
 */
export interface Receipt {
  txSignature: string;
  blockTime?: number;
  spentUsdc: number;
  recipient: string;
  quoteId: string;
}

export interface Quote {
  provider: string;
  method: string;
  quoteId: string;
  priceUsdc: number;
  payload: unknown;
  txSignature: string;
  receivedAt: number;
  latencyMs: number;
}

export interface ClientOptions {
  wallet: string;
  cap?: string;
  rpcUrl?: string;
  network?: "mainnet" | "devnet";
  timeoutMs?: number;
}

export interface CallParams {
  provider: string;
  method: string;
  params?: unknown;
  maxPrice?: number;
}

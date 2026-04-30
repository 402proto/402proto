/**
 * provider catalog. v0.1 hard-coded; v0.2 will use the on-chain registry.
 */
export interface Endpoint {
  provider: string;
  method: string;
  url: string;
  estPriceUsdc: number;
}

export const CATALOG: Endpoint[] = [
  { provider: "pyth.oracle",        method: "price.get",        url: "https://api.pyth.example.com/v1/price.get",        estPriceUsdc: 0.001 },
  { provider: "jupiter.quote",      method: "quote",            url: "https://api.jupiter.example.com/v1/quote",         estPriceUsdc: 0.005 },
  { provider: "jupiter.quote",      method: "swap.build",       url: "https://api.jupiter.example.com/v1/swap.build",    estPriceUsdc: 0.005 },
  { provider: "birdeye.token",      method: "token.meta",       url: "https://api.birdeye.example.com/v1/token.meta",    estPriceUsdc: 0.002 },
  { provider: "birdeye.token",      method: "token.holders",    url: "https://api.birdeye.example.com/v1/token.holders", estPriceUsdc: 0.002 },
  { provider: "helius.rpc",         method: "getAccountInfo",   url: "https://rpc.helius.example.com",                   estPriceUsdc: 0.0008 },
  { provider: "helius.rpc",         method: "sendTransaction",  url: "https://rpc.helius.example.com",                   estPriceUsdc: 0.0008 },
  { provider: "claude.completion",  method: "messages.create",  url: "https://api.anthropic.example.com/v1/messages",    estPriceUsdc: 0.018 },
  { provider: "anthropic.embed",    method: "embeddings",       url: "https://api.anthropic.example.com/v1/embeddings",  estPriceUsdc: 0.0004 },
];

export function resolve(provider: string, method: string): Endpoint {
  const found = CATALOG.find((e) => e.provider === provider && e.method === method);
  if (!found) throw new Error(`unknown provider/method: ${provider}.${method}`);
  return found;
}

export function listProviders(): string[] {
  return Array.from(new Set(CATALOG.map((e) => e.provider))).sort();
}

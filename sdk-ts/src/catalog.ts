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
  // === v0.1 production ===
  { provider: "pyth.oracle",        method: "price.get",        url: "https://api.pyth.example.com/v1/price.get",        estPriceUsdc: 0.001 },
  { provider: "jupiter.quote",      method: "quote",            url: "https://api.jupiter.example.com/v1/quote",         estPriceUsdc: 0.005 },
  { provider: "jupiter.quote",      method: "swap.build",       url: "https://api.jupiter.example.com/v1/swap.build",    estPriceUsdc: 0.005 },
  { provider: "birdeye.token",      method: "token.meta",       url: "https://api.birdeye.example.com/v1/token.meta",    estPriceUsdc: 0.002 },
  { provider: "birdeye.token",      method: "token.holders",    url: "https://api.birdeye.example.com/v1/token.holders", estPriceUsdc: 0.002 },
  { provider: "helius.rpc",         method: "getAccountInfo",   url: "https://rpc.helius.example.com",                   estPriceUsdc: 0.0008 },
  { provider: "helius.rpc",         method: "sendTransaction",  url: "https://rpc.helius.example.com",                   estPriceUsdc: 0.0008 },
  { provider: "claude.completion",  method: "messages.create",  url: "https://api.anthropic.example.com/v1/messages",    estPriceUsdc: 0.018 },
  { provider: "anthropic.embed",    method: "embeddings",       url: "https://api.anthropic.example.com/v1/embeddings",  estPriceUsdc: 0.0004 },

  // === v0.2 candidate — oracles ===
  { provider: "switchboard.oracle", method: "price.get",        url: "https://api.switchboard.example.com/v1/price.get", estPriceUsdc: 0.001 },
  { provider: "chainlink.oracle",   method: "price.get",        url: "https://api.chainlink.example.com/v1/price.get",   estPriceUsdc: 0.001 },

  // === v0.2 candidate — rpc ===
  { provider: "triton.rpc",         method: "getAccountInfo",   url: "https://rpc.triton.example.com",                   estPriceUsdc: 0.0008 },
  { provider: "triton.rpc",         method: "sendTransaction",  url: "https://rpc.triton.example.com",                   estPriceUsdc: 0.0008 },
  { provider: "quicknode.rpc",      method: "getAccountInfo",   url: "https://rpc.quicknode.example.com",                estPriceUsdc: 0.0008 },
  { provider: "quicknode.rpc",      method: "sendTransaction",  url: "https://rpc.quicknode.example.com",                estPriceUsdc: 0.0008 },
  { provider: "syndica.rpc",        method: "getAccountInfo",   url: "https://rpc.syndica.example.com",                  estPriceUsdc: 0.0008 },
  { provider: "syndica.rpc",        method: "sendTransaction",  url: "https://rpc.syndica.example.com",                  estPriceUsdc: 0.0008 },

  // === v0.2 candidate — data ===
  { provider: "defillama.data",     method: "protocol.tvl",     url: "https://api.defillama.example.com/v1/protocol.tvl", estPriceUsdc: 0.001 },
  { provider: "defillama.data",     method: "token.price",      url: "https://api.defillama.example.com/v1/token.price",  estPriceUsdc: 0.001 },
  { provider: "dune.data",          method: "query.run",        url: "https://api.dune.example.com/v1/query.run",        estPriceUsdc: 0.01 },
  { provider: "thegraph.data",      method: "subgraph.query",   url: "https://api.thegraph.example.com/v1/subgraph.query", estPriceUsdc: 0.002 },

  // === v0.2 candidate — search ===
  { provider: "tavily.search",      method: "search.web",       url: "https://api.tavily.example.com/v1/search",         estPriceUsdc: 0.005 },
  { provider: "exa.search",         method: "search.web",       url: "https://api.exa.example.com/v1/search",            estPriceUsdc: 0.005 },
  { provider: "brave.search",       method: "search.web",       url: "https://api.brave.example.com/v1/search",          estPriceUsdc: 0.003 },

  // === v0.2 candidate — llm ===
  { provider: "openai.completion",  method: "chat.completions", url: "https://api.openai.example.com/v1/chat/completions",   estPriceUsdc: 0.02 },
  { provider: "mistral.completion", method: "chat.completions", url: "https://api.mistral.example.com/v1/chat/completions",  estPriceUsdc: 0.008 },
  { provider: "groq.completion",    method: "chat.completions", url: "https://api.groq.example.com/v1/chat/completions",     estPriceUsdc: 0.002 },
  { provider: "gemini.completion",  method: "generate.content", url: "https://api.gemini.example.com/v1/models:generateContent", estPriceUsdc: 0.01 },
  { provider: "xai.completion",     method: "chat.completions", url: "https://api.xai.example.com/v1/chat/completions",      estPriceUsdc: 0.015 },

  // === v0.2 candidate — storage ===
  { provider: "arweave.storage",    method: "upload",           url: "https://api.arweave.example.com/v1/upload",        estPriceUsdc: 0.05 },
  { provider: "arweave.storage",    method: "fetch",            url: "https://api.arweave.example.com/v1/fetch",         estPriceUsdc: 0.001 },
  { provider: "irys.storage",       method: "upload",           url: "https://api.irys.example.com/v1/upload",           estPriceUsdc: 0.03 },
  { provider: "irys.storage",       method: "fetch",            url: "https://api.irys.example.com/v1/fetch",            estPriceUsdc: 0.001 },
  { provider: "walrus.storage",     method: "blob.put",         url: "https://api.walrus.example.com/v1/blob.put",       estPriceUsdc: 0.02 },
  { provider: "walrus.storage",     method: "blob.get",         url: "https://api.walrus.example.com/v1/blob.get",       estPriceUsdc: 0.001 },
];

/** v0.1 production providers — others in CATALOG are v0.2 candidates (wired, not routed by default). */
export const PRODUCTION_PROVIDERS = new Set([
  "pyth.oracle",
  "jupiter.quote",
  "birdeye.token",
  "helius.rpc",
  "claude.completion",
  "anthropic.embed",
]);

export function resolve(provider: string, method: string): Endpoint {
  const found = CATALOG.find((e) => e.provider === provider && e.method === method);
  if (!found) throw new Error(`unknown provider/method: ${provider}.${method}`);
  return found;
}

export function listProviders(): string[] {
  return Array.from(new Set(CATALOG.map((e) => e.provider))).sort();
}

/**
 * envelope: build canonical body, parse 402 response headers.
 */
export const SPEC_VERSION = "0.1";

export interface Envelope {
  version: string;
  client: string;
  wallet: string;
  maxPrice?: number;
  idempotencyKey?: string;
}

export interface Quote402 {
  version: string;
  provider: string;
  method: string;
  price: number;
  currency: string;
  recipient: string;
  ttlSeconds: number;
  chain: string;
  quoteId: string;
  nonce: string;
}

export interface CanonicalBody {
  provider: string;
  method: string;
  price: string;
  currency: string;
  recipient: string;
  chain: string;
  quoteId: string;
  nonce: string;
  wallet: string;
  ttlExpiresAt: number;
}

export function envelopeHeaders(e: Envelope): Record<string, string> {
  const h: Record<string, string> = {
    "x-402proto-version": e.version,
    "x-402proto-client": e.client,
    "x-402proto-wallet": e.wallet,
  };
  if (e.maxPrice !== undefined) h["x-402proto-max-price"] = e.maxPrice.toFixed(6).replace(/\.?0+$/, "") || "0";
  if (e.idempotencyKey) h["x-402proto-idempotency-key"] = e.idempotencyKey;
  return h;
}

export function serializeCanonical(cb: CanonicalBody): Uint8Array {
  const lines = [
    `402proto/${SPEC_VERSION}`,
    `provider=${cb.provider}`,
    `method=${cb.method}`,
    `price=${cb.price}`,
    `currency=${cb.currency}`,
    `recipient=${cb.recipient}`,
    `chain=${cb.chain}`,
    `quote_id=${cb.quoteId}`,
    `nonce=${cb.nonce}`,
    `wallet=${cb.wallet}`,
    `ttl_expires_at=${cb.ttlExpiresAt}`,
  ];
  return new TextEncoder().encode(lines.join("\n"));
}

const REQUIRED_402_HEADERS = [
  "x-402proto-version",
  "x-402proto-provider",
  "x-402proto-method",
  "x-402proto-price",
  "x-402proto-currency",
  "x-402proto-recipient",
  "x-402proto-ttl",
  "x-402proto-chain",
  "x-402proto-quote-id",
  "x-402proto-nonce",
] as const;

export class BadEnvelopeError extends Error {
  readonly code = "bad-envelope";
}

export function parse402(headers: Headers | Record<string, string>): Quote402 {
  const get = (k: string): string | null => {
    if (headers instanceof Headers) return headers.get(k);
    for (const [hk, hv] of Object.entries(headers)) {
      if (hk.toLowerCase() === k) return hv;
    }
    return null;
  };

  const missing = REQUIRED_402_HEADERS.filter((h) => !get(h));
  if (missing.length) {
    throw new BadEnvelopeError(`missing required headers: ${missing.join(", ")}`);
  }

  const price = parseFloat(get("x-402proto-price")!);
  const ttl = parseInt(get("x-402proto-ttl")!, 10);
  if (Number.isNaN(price)) throw new BadEnvelopeError("price not numeric");
  if (Number.isNaN(ttl)) throw new BadEnvelopeError("ttl not numeric");

  return {
    version: get("x-402proto-version")!,
    provider: get("x-402proto-provider")!,
    method: get("x-402proto-method")!,
    price,
    currency: get("x-402proto-currency")!,
    recipient: get("x-402proto-recipient")!,
    ttlSeconds: ttl,
    chain: get("x-402proto-chain")!,
    quoteId: get("x-402proto-quote-id")!,
    nonce: get("x-402proto-nonce")!,
  };
}

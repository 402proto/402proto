/**
 * 402proto typescript client.
 */
import bs58 from "bs58";

import { resolve } from "./catalog.js";
import {
  envelopeHeaders,
  parse402,
  serializeCanonical,
  SPEC_VERSION,
  type CanonicalBody,
  type Envelope,
} from "./envelope.js";
import { CapExceededError, fromCode } from "./errors.js";
import { submitTransfer } from "./settle.js";
import { derivePubkey, sign } from "./signing.js";
import type { CallParams, ClientOptions, Quote } from "./types.js";

const USER_AGENT = "@402proto/sdk/0.2.0";

export class Client {
  private wallet: string;
  private cap: number | null;
  private spentToday = 0;
  private rpcUrl: string;
  private network: "mainnet" | "devnet";
  private timeoutMs: number;

  constructor(opts: ClientOptions) {
    if (!opts.wallet) throw new Error("wallet is required");
    this.wallet = opts.wallet;
    this.cap = parseCap(opts.cap);
    this.rpcUrl = opts.rpcUrl ?? "https://api.mainnet-beta.solana.com";
    this.network = opts.network ?? "mainnet";
    this.timeoutMs = opts.timeoutMs ?? 30_000;
  }

  async call({ provider, method, params, maxPrice }: CallParams): Promise<Quote> {
    const endpoint = resolve(provider, method);
    const walletPub = derivePubkey(bs58.decode(this.wallet));
    const envelope: Envelope = {
      version: SPEC_VERSION,
      client: USER_AGENT,
      wallet: walletPub,
      maxPrice,
    };

    const t0 = Date.now();
    const r = await this.http(endpoint.url, params, envelopeHeaders(envelope));

    if (r.status !== 402) {
      throw fromCode(r.headers.get("x-402proto-error") ?? "provider-error", `unexpected ${r.status}`);
    }
    const quote = parse402(r.headers);

    if (maxPrice !== undefined && quote.price > maxPrice) {
      throw new CapExceededError(`quote ${quote.price} exceeds max ${maxPrice}`);
    }
    if (this.cap !== null && this.spentToday + quote.price > this.cap) {
      throw new CapExceededError(`would exceed daily cap ${this.cap}`);
    }

    const ttlExpiresAt = Math.floor(Date.now() / 1000) + quote.ttlSeconds;
    const cb: CanonicalBody = {
      provider: quote.provider,
      method: quote.method,
      price: String(quote.price),
      currency: quote.currency,
      recipient: quote.recipient,
      chain: quote.chain,
      quoteId: quote.quoteId,
      nonce: quote.nonce,
      wallet: walletPub,
      ttlExpiresAt,
    };
    const sigB58 = sign(serializeCanonical(cb), bs58.decode(this.wallet));
    const txSig = await this.settle(cb);

    const r2 = await this.http(endpoint.url, params, {
      ...envelopeHeaders(envelope),
      "x-402proto-quote-id": quote.quoteId,
      "x-402proto-expires": String(ttlExpiresAt),
      "x-402proto-receipt": txSig,
      "x-402proto-signature": sigB58,
    });
    if (r2.status !== 200) {
      throw fromCode(r2.headers.get("x-402proto-error") ?? "provider-error", await r2.text());
    }
    const payload = await r2.json().catch(() => r2.text());

    this.spentToday += quote.price;
    return {
      provider: quote.provider,
      method: quote.method,
      quoteId: quote.quoteId,
      priceUsdc: quote.price,
      payload,
      txSignature: txSig,
      receivedAt: Math.floor(Date.now() / 1000),
      latencyMs: Date.now() - t0,
    };
  }

  private async http(url: string, body: unknown, headers: Record<string, string>): Promise<Response> {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      return await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(body ?? {}),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(id);
    }
  }

  private async settle(cb: CanonicalBody): Promise<string> {
    return submitTransfer({
      rpcUrl: this.rpcUrl,
      network: this.network,
      walletSecret: bs58.decode(this.wallet),
      recipient: cb.recipient,
      amountUsdc: Number(cb.price),
      memo: `402proto/0.2 q=${cb.quoteId}`,
    });
  }
}

function parseCap(cap?: string): number | null {
  if (!cap) return null;
  const s = cap.toLowerCase().replace("$", "").replace("usdc", "").trim();
  const cleaned = s.replace(/\/(day|d|per day)$/, "").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

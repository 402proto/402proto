export { Client } from "./client.js";
export {
  SPEC_VERSION,
  envelopeHeaders,
  parse402,
  serializeCanonical,
  BadEnvelopeError,
  type Envelope,
  type Quote402,
  type CanonicalBody,
} from "./envelope.js";
export { sign, verify, derivePubkey } from "./signing.js";
export { resolve, listProviders, CATALOG, type Endpoint } from "./catalog.js";
export {
  Proto402Error,
  UnsupportedVersionError,
  QuoteExpiredError,
  QuoteUnknownError,
  SignatureInvalidError,
  ProofMissingError,
  ProofUnderpaidError,
  ChainUnsupportedError,
  CapExceededError,
  RateLimitedError,
  ProviderErrorError,
  fromCode,
} from "./errors.js";
export type { Receipt, Quote, ClientOptions, CallParams } from "./types.js";

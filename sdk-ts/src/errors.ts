/**
 * 402proto error types. mirrors codes in spec/errors.md.
 */
export class Proto402Error extends Error {
  readonly code: string = "proto402-error";
}
export class BadEnvelopeError extends Proto402Error { readonly code = "bad-envelope"; }
export class UnsupportedVersionError extends Proto402Error { readonly code = "unsupported-version"; }
export class QuoteExpiredError extends Proto402Error { readonly code = "quote-expired"; }
export class QuoteUnknownError extends Proto402Error { readonly code = "quote-unknown"; }
export class SignatureInvalidError extends Proto402Error { readonly code = "signature-invalid"; }
export class ProofMissingError extends Proto402Error { readonly code = "proof-missing"; }
export class ProofUnderpaidError extends Proto402Error { readonly code = "proof-underpaid"; }
export class ChainUnsupportedError extends Proto402Error { readonly code = "chain-unsupported"; }
export class CapExceededError extends Proto402Error { readonly code = "cap-exceeded"; }
export class RateLimitedError extends Proto402Error { readonly code = "rate-limited"; }
export class ProviderErrorError extends Proto402Error { readonly code = "provider-error"; }

export function fromCode(code: string, message = ""): Proto402Error {
  const map: Record<string, new (m: string) => Proto402Error> = {
    "bad-envelope": BadEnvelopeError,
    "unsupported-version": UnsupportedVersionError,
    "quote-expired": QuoteExpiredError,
    "quote-unknown": QuoteUnknownError,
    "signature-invalid": SignatureInvalidError,
    "proof-missing": ProofMissingError,
    "proof-underpaid": ProofUnderpaidError,
    "chain-unsupported": ChainUnsupportedError,
    "cap-exceeded": CapExceededError,
    "rate-limited": RateLimitedError,
    "provider-error": ProviderErrorError,
  };
  const Cls = map[code] ?? Proto402Error;
  return new Cls(message || code);
}

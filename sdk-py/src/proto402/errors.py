"""402proto error types. mirrors codes in spec/errors.md."""


class Proto402Error(Exception):
    """base for all 402proto-specific errors."""

    code: str = "proto402-error"


class BadEnvelope(Proto402Error):
    code = "bad-envelope"


class UnsupportedVersion(Proto402Error):
    code = "unsupported-version"


class QuoteExpired(Proto402Error):
    code = "quote-expired"


class QuoteUnknown(Proto402Error):
    code = "quote-unknown"


class SignatureInvalid(Proto402Error):
    code = "signature-invalid"


class ProofMissing(Proto402Error):
    code = "proof-missing"


class ProofUnderpaid(Proto402Error):
    code = "proof-underpaid"


class ChainUnsupported(Proto402Error):
    code = "chain-unsupported"


class CapExceeded(Proto402Error):
    code = "cap-exceeded"


class RateLimited(Proto402Error):
    code = "rate-limited"


class ProviderError(Proto402Error):
    code = "provider-error"


_CODE_TO_EXC: dict[str, type[Proto402Error]] = {
    cls.code: cls
    for cls in [
        BadEnvelope, UnsupportedVersion, QuoteExpired, QuoteUnknown,
        SignatureInvalid, ProofMissing, ProofUnderpaid, ChainUnsupported,
        CapExceeded, RateLimited, ProviderError,
    ]
}


def from_code(code: str, message: str = "") -> Proto402Error:
    cls = _CODE_TO_EXC.get(code, Proto402Error)
    return cls(message or code)

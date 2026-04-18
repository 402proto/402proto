//! router error types. mirrors codes in spec/errors.md.

use thiserror::Error;

#[derive(Debug, Error)]
pub enum RouterError {
    #[error("bad envelope: {0}")]
    BadEnvelope(String),

    #[error("unsupported version: {0}")]
    UnsupportedVersion(String),

    #[error("quote expired")]
    QuoteExpired,

    #[error("quote unknown")]
    QuoteUnknown,

    #[error("signature invalid")]
    SignatureInvalid,

    #[error("proof missing")]
    ProofMissing,

    #[error("proof underpaid")]
    ProofUnderpaid,

    #[error("chain unsupported: {0}")]
    ChainUnsupported(String),

    #[error("cap exceeded: quote {price}, cap {cap}")]
    CapExceeded { price: f64, cap: f64 },

    #[error("rate limited (retry after {retry_after_secs}s)")]
    RateLimited { retry_after_secs: u32 },

    #[error("provider error: {0}")]
    ProviderError(String),
}

impl RouterError {
    /// stable string code per spec/errors.md.
    pub fn code(&self) -> &'static str {
        match self {
            Self::BadEnvelope(_) => "bad-envelope",
            Self::UnsupportedVersion(_) => "unsupported-version",
            Self::QuoteExpired => "quote-expired",
            Self::QuoteUnknown => "quote-unknown",
            Self::SignatureInvalid => "signature-invalid",
            Self::ProofMissing => "proof-missing",
            Self::ProofUnderpaid => "proof-underpaid",
            Self::ChainUnsupported(_) => "chain-unsupported",
            Self::CapExceeded { .. } => "cap-exceeded",
            Self::RateLimited { .. } => "rate-limited",
            Self::ProviderError(_) => "provider-error",
        }
    }
}

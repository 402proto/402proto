//! 402proto router library.
//!
//! parses 402proto envelopes, routes to providers, enforces caps + retries.

pub mod catalog;
pub mod envelope;
pub mod error;
pub mod failover;
pub mod retry;
pub mod signing;

pub use catalog::{Catalog, Provider, ProviderHealth};
pub use envelope::{CanonicalBody, Envelope, Quote402};
pub use error::RouterError;
pub use retry::RetryPolicy;

pub const SPEC_VERSION: &str = "0.1";

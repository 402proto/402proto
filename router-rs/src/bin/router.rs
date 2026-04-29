//! 402proto router binary.

use proto402_router::Catalog;
use tracing::info;

fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let catalog = Catalog::v01_default();
    info!(
        providers = catalog.list().len(),
        "402proto router starting (v0.1.0 stub)"
    );
    info!("real http listener lands in v0.1.1. exit 0.");
}

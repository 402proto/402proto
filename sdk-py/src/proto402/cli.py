"""402proto cli — typer + rich."""
from __future__ import annotations

import json
import os
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table

from proto402 import __version__
from proto402.providers import list_methods, list_providers

app = typer.Typer(help="402proto cli — call paid apis, settled in usdc on solana.")
providers_app = typer.Typer(help="provider catalog inspection")
demo_app = typer.Typer(help="scripted demos against synthetic responses")
app.add_typer(providers_app, name="providers")
app.add_typer(demo_app, name="demo")

console = Console()


@app.callback(invoke_without_command=True)
def main(
    ctx: typer.Context,
    version: bool = typer.Option(False, "--version", "-V", help="show version and exit"),
):
    if version:
        console.print(f"402proto {__version__}")
        raise typer.Exit()
    if ctx.invoked_subcommand is None:
        console.print(ctx.get_help())


@app.command()
def call(
    provider: str = typer.Argument(..., help="provider id, e.g. pyth.oracle"),
    method: str = typer.Argument(..., help="method on provider, e.g. price.get"),
    params: str = typer.Option("{}", "--params", "-p", help="json params"),
    max_price: float = typer.Option(0.05, "--max", help="max price in usdc"),
    wallet: Optional[str] = typer.Option(None, "--wallet", help="overrides PROTO402_WALLET"),
):
    """make a paid api call."""
    from proto402 import Client

    try:
        params_dict = json.loads(params)
    except json.JSONDecodeError as e:
        console.print(f"[red]invalid --params json: {e}[/red]")
        raise typer.Exit(1)

    secret = wallet or os.environ.get("PROTO402_WALLET")
    if not secret:
        console.print("[red]PROTO402_WALLET is required (or pass --wallet).[/red]")
        raise typer.Exit(1)

    client = Client(wallet=secret)
    quote = client.call(provider=provider, method=method, params=params_dict, max_price=max_price)

    console.print(f"[green]settled[/green]   tx={quote.tx_signature[:8]}…{quote.tx_signature[-4:]}")
    console.print(f"price     {quote.price_usdc} USDC")
    console.print(f"latency   {quote.latency_ms}ms")
    console.print("payload:")
    console.print_json(json.dumps(quote.payload))


@providers_app.command("list")
def providers_list():
    """list all providers in the catalog."""
    t = Table(title="402proto providers (v0.1)")
    t.add_column("Provider", style="cyan")
    t.add_column("Methods", style="white")
    for p in list_providers():
        t.add_row(p, ", ".join(list_methods(p)))
    console.print(t)


@providers_app.command("show")
def providers_show(provider: str):
    """show methods + estimated prices for a provider."""
    methods = list_methods(provider)
    if not methods:
        console.print(f"[red]unknown provider: {provider}[/red]")
        raise typer.Exit(1)
    for m in methods:
        console.print(f"  {provider}.{m}")


@demo_app.command("scan")
def demo_scan():
    """walk through 5 sample provider calls with synthetic data."""
    samples = [
        ("pyth.oracle", "price.get", 0.001),
        ("jupiter.quote", "quote", 0.005),
        ("birdeye.token", "token.meta", 0.002),
        ("helius.rpc", "getAccountInfo", 0.0008),
        ("anthropic.embed", "embeddings", 0.0004),
    ]
    t = Table(title="demo scan")
    t.add_column("Provider"); t.add_column("Method"); t.add_column("Price (USDC)")
    for p, m, price in samples:
        t.add_row(p, m, f"{price:.4f}")
    console.print(t)


@app.command()
def balance(wallet: Optional[str] = typer.Option(None, "--wallet")):
    """show wallet usdc balance (mock in v0.1)."""
    secret = wallet or os.environ.get("PROTO402_WALLET")
    if not secret:
        console.print("[red]PROTO402_WALLET is required.[/red]")
        raise typer.Exit(1)
    console.print("142.50 USDC  (mock balance — real wallet integration in v0.1.1)")


if __name__ == "__main__":
    app()

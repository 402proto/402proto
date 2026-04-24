"""provider catalog tests."""
from __future__ import annotations

import pytest

from proto402.providers import list_methods, list_providers, resolve


def test_v01_has_six_providers():
    p = list_providers()
    assert "pyth.oracle" in p
    assert "jupiter.quote" in p
    assert "birdeye.token" in p
    assert "helius.rpc" in p
    assert "claude.completion" in p
    assert "anthropic.embed" in p


def test_resolve_known_method():
    e = resolve("pyth.oracle", "price.get")
    assert e.provider == "pyth.oracle"
    assert e.method == "price.get"
    assert e.url.startswith("https://")


def test_resolve_unknown_raises():
    with pytest.raises(KeyError):
        resolve("nonexistent.provider", "no.method")


def test_methods_per_provider():
    assert "price.get" in list_methods("pyth.oracle")
    assert "quote" in list_methods("jupiter.quote")
    assert "getAccountInfo" in list_methods("helius.rpc")

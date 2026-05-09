# 402proto convenience targets
.PHONY: help install test lint fmt build clean

help:
	@echo "402proto"
	@echo ""
	@echo "  make install     install all dev dependencies across packages"
	@echo "  make test        run all test suites"
	@echo "  make lint        run all linters"
	@echo "  make fmt         autofix formatting in all packages"
	@echo "  make build       build all packages"
	@echo "  make clean       clean build artifacts"

install:
	cd sdk-py && pip install -e '.[dev]'
	cd sdk-ts && npm install
	cd mcp-server && npm install
	cd router-rs && cargo build

test:
	cd sdk-py && pytest -q
	cd sdk-ts && npm test
	cd mcp-server && npm test
	cd router-rs && cargo test

lint:
	cd sdk-py && ruff check src tests
	cd sdk-ts && npm run typecheck
	cd mcp-server && npm run typecheck
	cd router-rs && cargo fmt --all -- --check && cargo clippy --all-targets -- -D warnings

fmt:
	cd sdk-py && ruff check --fix src tests
	cd sdk-ts && npm run format
	cd router-rs && cargo fmt

build:
	cd sdk-py && python -m build
	cd sdk-ts && npm run build
	cd mcp-server && npm run build
	cd router-rs && cargo build --release

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf sdk-py/dist sdk-py/build sdk-py/*.egg-info
	cd sdk-ts && rm -rf dist node_modules
	cd mcp-server && rm -rf dist node_modules
	cd router-rs && cargo clean

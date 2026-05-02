# @402proto/mcp — mcp server

drop-in MCP server that exposes 402proto as native tools to claude code, cursor, and other mcp-compatible runtimes.

## install

```bash
npm i -g @402proto/mcp
```

## run

```bash
402proto-mcp --wallet $PROTO402_WALLET --cap "10 USDC/day"
```

then point your agent runtime at the mcp server. each registered provider shows up as a callable tool with typed inputs.

### claude code

```json
{
  "mcpServers": {
    "402proto": {
      "command": "402proto-mcp",
      "args": ["--wallet", "${env:PROTO402_WALLET}", "--cap", "10 USDC/day"]
    }
  }
}
```

### cursor

cursor → settings → mcp servers → add → command: `402proto-mcp`, args as above.

## tools exposed

every v0.1 provider is wrapped as an mcp tool:

| tool | description |
|---|---|
| `pyth.oracle.price.get` | fetch a price from the pyth oracle |
| `jupiter.quote.quote` | get a swap quote on solana |
| `birdeye.token.meta` | fetch token metadata |
| `helius.rpc.getAccountInfo` | read a solana account |
| `claude.completion.messages.create` | call claude through proto402 |
| `anthropic.embed.embeddings` | get embeddings |

each tool surfaces the http 402 quote BEFORE signing. the agent sees the price, can decide to skip if the cap would be hit, and explicitly confirms before settle (or the daily cap proceeds automatically).

## structure

```
src/
├── cli.ts       entry point (bin: 402proto-mcp)
├── server.ts    mcp server bootstrap, tool registration
├── tools.ts     tool definitions wrapped around @402proto/sdk Client
└── transport.ts stdio transport (v0.1); http transport planned v0.2
```

## v0.2

http transport, per-tool caps, dry-run mode, and an opt-in interactive confirmation hook (so agents always pause before settle in non-trusted contexts).

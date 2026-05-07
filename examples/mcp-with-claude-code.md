# 402proto + claude code

set up `@402proto/mcp` as an mcp server in claude code so every paid api call settles in usdc on solana.

## install

```bash
npm i -g @402proto/mcp
```

## configure

add to your `~/.claude/mcp.json` (or workspace `.claude/mcp.json`):

```json
{
  "mcpServers": {
    "402proto": {
      "command": "402proto-mcp",
      "args": [
        "--wallet", "${env:PROTO402_WALLET}",
        "--cap", "5 USDC/day"
      ]
    }
  }
}
```

then export the wallet:

```bash
export PROTO402_WALLET=<base58 solana secret key>
```

restart claude code. the 402proto tools appear under the `mcp__402proto__*` namespace:

- `mcp__402proto__pyth_oracle_price_get`
- `mcp__402proto__jupiter_quote_quote`
- `mcp__402proto__birdeye_token_token_meta`
- `mcp__402proto__helius_rpc_getAccountInfo`
- `mcp__402proto__claude_completion_messages_create`
- `mcp__402proto__anthropic_embed_embeddings`

## what to expect

every time claude code calls one of these tools, the agent sees:

```
called mcp__402proto__pyth_oracle_price_get
  tx: 5j7B...kQz4
  spent: 0.001 USDC
  latency: 1.4s
```

if the daily cap is hit, the next call returns `cap-exceeded` and claude surfaces the error.

## debug

run the mcp server manually to see the envelope flow:

```bash
402proto-mcp --wallet $PROTO402_WALLET --cap 5
# stdin/stdout speaks jsonrpc 2.0
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | 402proto-mcp --wallet $PROTO402_WALLET
```

# Web3 Integration Plan

## Current State Snapshot
- The MoonPhase dashboard currently renders CoinCap asset data inside the server-driven asset grid and detail pages (`app/page.tsx`, `app/details/[symbol]/page.tsx`).
- There is no wallet context or Ethereum provider loaded on the client; the fixed header renders only static navigation links without account awareness (`components/ui/header.tsx`).
- Data access follows the existing ports/adapters pattern (`lib/data/assets.ts` → `src/usecases/getAssets.ts`), which we can reuse for any on-chain providers we add.

## Integration Options
Each option below is scoped to fit the existing architecture, shows practical Web3 capability, and can be implemented independently. You can mix and match if time allows.

For every option you will find:
- **User story** – what the dashboard user gains.
- **Success criteria** – observable behaviors that prove the capability works.
- **Implementation plan** – concrete tasks with the exact files or modules to touch.
- **Effort cheatsheet** – rough estimate (S = <0.5 day, M = 0.5–1.5 day) so you can stack features.

### Option A — Wallet-aware Portfolio Overlay (MetaMask / WalletConnect via `wagmi` + `viem`)
**User story**: “As a user who actually trades these tokens, I want to see my balances in the dashboard so I can compare them to market movers.”

**Success criteria**
- Header shows a connect button, then ENS/address + USD wallet value after linking.
- Detail pages surface token balance + USD valuation for the connected wallet.
- Asset tiles highlight tokens the wallet holds with no refresh required.

**Implementation plan** _(Effort: M)_
1. **Client provider shell**
   - Create `app/web3-providers.tsx` (client) exporting `<Web3Providers>{children}</Web3Providers>` configured with `createConfig` from `wagmi` using `publicProvider` + `walletConnect` connectors.
   - Update `app/layout.tsx` to wrap `<body>{children}</body>` with `<Web3Providers>` (ensure `"use client"` at top of provider file only).
2. **Header action**
   - Convert `components/ui/header.tsx` to a client file or extract a new `components/web3/connect-wallet-button.tsx` that consumes `useAccount`, `useConnect`, `useDisconnect` from `wagmi`.
   - Insert the button into the header’s right-aligned slot. Show ENS using `useEnsName`; fall back to truncated address.
3. **Portfolio card**
   - Under `components/details/` add `wallet-exposure-card.tsx` that accepts `symbol`, `contractAddress`, `decimals`.
   - Use `useAccount` + `readContract` (ERC-20 `balanceOf`) or `getBalance` for ETH via `viem`. Convert to USD using the price map already available in `app/details/[symbol]/page.tsx` (pass as prop).
   - Render within the detail page grid by conditionally loading the component with `dynamic(() => import(...), { ssr: false })` to avoid SSR issues.
4. **Watchlist highlighting**
   - In `components/assets/assets-grid.tsx`, wrap export with a client decorator `withWalletWatchlist` reading owned symbols from `localStorage` (write from the portfolio card) and toggling `data-owned` attribute for styling.
5. **Env validation**
   - Extend `lib/env.ts` to parse `NEXT_PUBLIC_ETH_RPC_URL`. Default to `https://eth.llamarpc.com` if missing.

**Tooling & deps**
- Add `wagmi`, `viem`, `@wagmi/core`, `@wagmi/chains` (if needed), `@tanstack/react-query` (already bundled via wagmi) and ensure `pnpm install`.
- Free RPC options: Ankr, LlamaNodes, or Alchemy free tier (WebSocket not required).

### Option B — Real-time On-chain Activity Feed (Alchemy WS / `viem` websockets)
**User story**: “As a trader, I want to see real-time transfer activity for the token I’m inspecting so I can act on whale moves immediately.”

**Success criteria**
- Detail pages show a live-updating list of ERC-20 `Transfer` events for the viewed asset.
- Transfers above the configured USD threshold render with a “Whale Alert” badge.
- Stream auto-recovers from dropped connections without manual refresh.

**Implementation plan** _(Effort: M)_
1. **Domain contracts**
   - Define `TokenTransferEvent` type in `types/onchain.ts` (fields: `hash`, `blockNumber`, `from`, `to`, `quantity`, `quantityFormatted`, `usdValue`).
   - Create `src/ports/token-event-port.ts` exposing `subscribe(symbol: string, onEvent)` and `fetchRecent(symbol: string, limit)`.
2. **Alchemy / viem adapter**
   - Add `src/adapters/ethereum/alchemy-token-event-adapter.ts`. Use `Alchemy` SDK with `WebSocketProvider` (free tier) to subscribe to `Transfer` logs for the contract mapped to the detail symbol (reuse address map from CoinCap response or extend `lib/data/assets.ts` with contract metadata).
   - Implement `fetchRecent` using Alchemy `getAssetTransfers` filtered by contract address, `fromBlock` last 1000 blocks.
   - Export a factory `createTokenEventAdapter({ apiKey, network })` returning an object implementing the port.
3. **API streaming route**
   - Create `app/api/events/[symbol]/route.ts` (Edge runtime disabled—needs Node for WebSockets).
   - On `GET`, instantiate adapter via env config (`ALCHEMY_WS_URL`, `ALCHEMY_API_KEY`).
   - Use EventSource (SSE) by returning `new ReadableStream` that pushes:
     - Initial payload from `fetchRecent` (convert to USD using `lib/data/assets` price map fetched server-side).
     - For live updates, subscribe to adapter and enqueue events (`event: transfer\ndata: { ... }\n\n`).
   - Handle disconnect with `controller.close()` + adapter cleanup.
4. **Client feed UI**
   - Add `components/details/token-activity-feed.tsx` (client) using `useEffect` to open `EventSource('/api/events/${symbol}')`.
   - Maintain state in `useState<TokenTransferEvent[]>([])`. Merge initial batch and push new ones, keeping top 20 with `slice(0, 20)`.
   - Format USD with existing `formatCurrency` util; highlight `usdValue >= 100_000`.
   - Display in detail page grid: update `app/details/[symbol]/page.tsx` to lazy load the component on the client and place alongside `TradingActivityCard` (two-column layout already present).
5. **Resilience + telemetry**
   - Leverage `src/lib/http/retry.ts` to implement exponential backoff when SSE closes.
   - Add `console.info` instrumentation behind `process.env.NODE_ENV !== 'production'` to aid debugging.
   - Optional: add `app/api/events/[symbol]/route.ts` `OPTIONS` handler returning 200 for health probes.
6. **Configuration & assets**
   - Extend `lib/env.ts` to parse `ALCHEMY_API_KEY`, `ALCHEMY_NETWORK` (default `eth-mainnet`).
   - Update `docs/Usage-API.md` with instructions to supply the new env vars (optional but nice-to-have).

**Tooling & deps**
- Add `alchemy-sdk` (0 cost up to 1M compute units/month) and ensure WebSocket URL assembled as `wss://eth-mainnet.ws.alchemyapi.io/v2/${key}`.
- Alternative: pure `viem` WebSocket client with `wss://eth-mainnet.g.alchemy.com/v2/${key}` to keep deps lighter.
- No wallet connection required; the feed works anonymously.

### Option C — Gasless Quick Actions via Smart Account (Biconomy or Safe relayers)
**User story**: “As a user experimenting with DeFi, I want to trigger curated on-chain actions without paying gas so I can try strategies risk-free.”

**Success criteria**
- Detail page exposes a dialog of predefined actions (e.g., “Stake 5% into Lido”, “Swap to USDC”) that completes without user-provided gas.
- Relayer responds with transaction hash and UI surfaces status updates (pending → confirmed).
- Users can revisit the detail page and see their last few gasless actions.

**Implementation plan** _(Effort: M/L)_
1. **SDK wiring**
   - Add `src/lib/web3/create-smart-account-client.ts` returning an initialized Biconomy Smart Account instance configured via `BICONOMY_API_KEY`, `BICONOMY_BUNDLER_URL` (free tier supports mainnet test actions up to quota).
   - This helper imports `getAccount` from `wagmi` (Option A dependency) or uses an embedded test private key fallback if Option A is skipped.
2. **Action catalog**
   - Create `src/config/gasless-actions.ts` with curated targets (contract address, ABI fragment, method, arguments factory, success copy). Example: call `claim()` on a demo reward contract deployed to mainnet with no value transfer.
3. **UI dialog**
   - Build `components/details/gasless-action-dialog.tsx` using Radix dialog primitives already present in the design system.
   - Provide buttons inside the AI Analysis card (`components/details/ai-analysis-card.tsx`) to open the dialog.
4. **Execution flow**
   - On confirm, call `smartAccount.sendTransaction({ to, data })`, then optimistically append to `localStorage` log `gaslessActions` (fields: `id`, `symbol`, `actionId`, `txHash`, `status`).
   - Poll `viem` `waitForTransactionReceipt` every 5s until confirmed or timeout, updating status chip in UI.
5. **History surface**
   - Add `components/details/gasless-action-history.tsx` rendering the `localStorage` entries filtered by `symbol`.
   - Embed below the dialog trigger for instant feedback.
6. **Environment + docs**
   - Update `lib/env.ts` to parse Biconomy keys and provide defaults for development (e.g., environment variable optional when using mock adapter).

**Tooling & deps**
- Add `@biconomy/account`, `@biconomy/paymaster`, `viem` (if not already from other option), and ensure bundler endpoint is on free tier.
- For a walletless version, use Biconomy test smart account seeded with test funds; highlight in README if so.

### Option D — Curated Whale Watch Lists (ENS / public labels)
**User story**: “As an analyst, I want to follow known whale wallets for a token so I can benchmark their moves against market data without connecting my own wallet.”

**Success criteria**
- Detail pages list predefined high-value wallets (ENS names where available) with their latest holdings and transaction deltas.
- Changes in holdings over the last 24h render inline (e.g., +12,000 UNI) sourced from on-chain balances.
- Users can toggle watch lists per token without authentication; selections persist locally.

**Implementation plan** _(Effort: S/M)_
1. **Data config**
   - Add `src/config/watched-addresses.ts` mapping token symbols → array of `{ label, address }`. Seed using public ENS-labeled whales from Etherscan (no auth required).
2. **Balance adapter**
   - Implement `src/adapters/ethereum/address-balance-adapter.ts` leveraging `viem` JSON-RPC (free provider) to batch `balanceOf` calls using `multicall` for ERC-20 tokens.
   - Provide helper `fetchAddressHoldings(addresses: string[], tokenContract: string)` returning balances + timestamps.
3. **UI surface**
   - Create `components/details/whale-watch-card.tsx` (client) to display the addresses, their ENS names (`viem` `getEnsName`), and 24h delta computed from two snapshots (current vs cached value in `IndexedDB` via `idb-keyval`).
   - Add toggle chips allowing the user to enable/disable notifications per whale; store preference in `localStorage` and highlight enabled ones across sessions.
4. **Notifications (optional bonus)**
   - If Option B is implemented, reuse its SSE stream to push events for watched addresses only and show toast notifications via the existing `useToast` hook.

**Tooling & deps**
- Rely on `viem` and `idb-keyval` (tiny) for offline caching.
- No API keys required if using public RPC (`eth.llamarpc.com`).

### Option E — Gas Tracker & Cost Forecast Widget
**User story**: “As a user evaluating whether to make a trade, I want to see current gas prices and cost estimates directly in the dashboard.”

**Success criteria**
- Dashboard header or sidebar displays live gas price tiers (low/avg/high) from an Ethereum gas oracle.
- Detail pages show estimated USD cost to execute a typical ERC-20 transfer or swap for the viewed token.
- Users can toggle between instant and 5-minute forecast to see how costs may change.

**Implementation plan** _(Effort: S)_
1. **Oracle adapter**
   - Add `src/adapters/ethereum/gas-price-adapter.ts` fetching from the free `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YOUR_KEY` (Etherscan free tier) or `https://api.blocknative.com/gasprices/blockprices` (requires free API key).
   - Normalize response into `{ baseFee, low, medium, high, timestamp }`.
2. **Server cache**
   - Create `src/usecases/getGasPrices.ts` that memoizes values for 30 seconds using the existing `cachedFetch` helper in `lib/data/cache.ts`.
   - Expose via `app/api/gas/route.ts` returning JSON.
3. **UI widget**
   - Build `components/dashboard/gas-tracker-card.tsx` reading from SWR/React Query hitting `/api/gas` every 30s.
   - Include quick estimation logic: `estimatedCostUsd = gasLimit * price * ethUsdPrice / 1e9`. For detail pages, use token-specific gas limits (transfer vs swap) defined in `src/config/gas-estimates.ts`.
   - Place the widget in the main dashboard grid (`app/page.tsx`) and reuse within detail page side column.
4. **Forecast toggle**
   - Add dropdown (e.g., `['Now', '+5 min']`). For forecast, request `blocknative` API `estimatedPrices[1]` or compute `now * 0.9` as heuristic if using Etherscan only.

**Tooling & deps**
- No blockchain connection required; uses HTTP APIs. Requires free API key for chosen oracle.
- Optional: use `@tanstack/react-query` already introduced via Option A for consistent data fetching.

## Selection Guidance
- **Fastest win**: Option E (gas tracker) is a lightweight drop-in that still demonstrates RPC/oracle consumption.
- **Event showcase**: Option B is the best standalone feature for highlighting blockchain event handling without wallet login.
- **Hybrid storytelling**: Pair Option B (live feed) with Option D (whale watch) to craft an analyst narrative, or with Option A to combine wallet context + live activity.
- **Advanced**: Option C takes the longest but proves mastery over smart accounts and gasless flows.

Pick the combination that matches the story you want to tell; each option is scoped so you can implement incrementally without reworking existing architecture.

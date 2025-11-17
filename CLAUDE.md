# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MoonPhase** is an AI-powered crypto dashboard built with Next.js 15, React 19, and TypeScript. It displays live cryptocurrency assets with animated sparklines, price deltas, and per-token details. The codebase follows **Clean/Hexagonal Architecture** with Ports & Adapters for external service integration.

**Key Pages**:
- `/` – Assets grid with responsive layout (BTC featured at 2x span)
- `/details/[symbol]` – Token details with price, market cap, and charts (dynamic route, force-dynamic)

## Commands

### Development
```bash
pnpm dev                # Start Next.js dev server (Turbopack)
pnpm dev -- -p 3001    # Run on different port
```

### Build & Production
```bash
pnpm build              # Production build
pnpm start              # Start production server
```

### Linting & Type Checking
```bash
pnpm lint               # Run ESLint
pnpm fix                # ESLint --fix + Prettier
pnpm typecheck          # TypeScript type checking
pnpm preflight          # typecheck + lint (no warnings) + test (required before finishing)
```

### Testing
```bash
pnpm test               # Run full Jest suite
pnpm test --testPathPattern=Auth  # Run single test file
pnpm test:watch         # Jest in watch mode
pnpm test:coverage      # Coverage report
```

### Git Hooks
```bash
pnpm setup:hooks        # Install pre-commit hook
```

## Architecture & Data Flow

### Clean Architecture Layers
```
UI Layer (app/, components/)
    ↓
Data Fetching (lib/data/*.ts: fetchAssets, fetchMarketData, fetchTradingActivity)
    ↓
Business Logic (src/usecases/*.ts: getAssets, getMarketData, getTradingActivity)
    ↓
Port Interfaces (src/ports/*.ts: abstractions for external services)
    ↓
Adapters (src/adapters/*.ts: CoinCapAdapter, BinanceAdapter, MockAdapters)
    ↓
External APIs (CoinCap, Binance, whitelist.json)
```

### Key Services
- **CoinCap**: Asset list & pricing (via `src/adapters/coincap/CoinCapAdapter.ts`)
- **Binance**: Advanced market data & candles (via `src/adapters/binance/BinanceAdapter.ts`)
- **Whitelist**: Curated list of 211 crypto symbols (JSON-based, `src/adapters/whitelist/whitelist.json`)
- **Mock Adapters**: For UI development without real API calls

### Request Deduplication
`src/lib/http/inflight.ts` prevents duplicate concurrent requests for the same resource using `dedupe()` wrapper.

## Directory Structure

### Key Folders
- `app/` – Next.js App Router pages, layouts, and API routes
- `components/crypto/` – Domain-specific components (cards, grid, icons, sparklines)
- `components/ui/` – Reusable UI primitives and animations
- `src/adapters/` – External service implementations (CoinCap, Binance, Whitelist, Mock)
- `src/ports/` – Port interfaces defining contracts for adapters
- `src/usecases/` – Business logic orchestration (getAssets, getMarketData, etc.)
- `src/domain/` – Domain models (Asset, MarketData, TradingActivity)
- `src/lib/` – Backend utilities (http/fetcher, env, errors, observability, rateLimit, cache)
- `lib/` – Frontend data fetching and utilities (numbers formatting, UI helpers, random walk)
- `docs/` – Comprehensive documentation

### Important Files
- `.cursor/rules/` – Development standards (.cursor/rules/00-global.mdc is mandatory)
- `tsconfig.json` – Path aliases for `@/*` imports
- `jest.config.js`, `jest.setup.js` – Test configuration with mocks
- `tailwind.config.ts` – Tailwind CSS 4 (configless, custom utilities)

## Environment Setup

### Required Environment Variables
```env
COINCAP_API_KEY=your_coincap_key     # Required for production
COINCAP_BASE_URL=...                 # Optional override (defaults to rest.coincap.io/v3)
BINANCE_API_KEY=...                  # Optional (for advanced features)
BINANCE_BASE_URL=...                 # Optional override (defaults to api.binance.com/api/v3)
```

Create `.env.local` in the root directory with your API keys.

### Node & Package Manager
- **Node.js**: 20.x (per CI config)
- **Package Manager**: pnpm (frozen-lockfile in CI)

## Frontend Standards

**Framework**: Next.js App Router, Server Components by default (add `'use client'` only when needed)

**Styling**:
- Tailwind CSS 4 (configless) with design tokens only (no hardcoded colors/spacing)
- Semantic token system: `background/foreground`, `primary/secondary/accent/muted`, `destructive`, `chart-1` through `chart-5`
- Utilities: `glassmorphic` (frosted panels), `shadow-glow` (interactive tiles)

**Components**:
- Must use `Button` (never raw `<button>`) and `Card` with `CardHeader|Content|Footer|Action`
- Icons: Lucide + repo's cryptocurrency icon set (no new icon packs)
- Reuse primitives from `components/ui/*` and domain blocks from `components/crypto/*`

**Animation**:
- GSAP 3.13 + Motion 12.23 (Framer Motion alternative)
- Line-draw SVG animations via existing `line-draw-animation` wrapper
- Micro-interactions: short (≈150–300ms), smooth, use transforms/opacity (no layout thrash)

**Data Semantics**:
- Green = gains, Red = losses, Muted = neutral
- Always include `+`/`–` signs with values
- Compact number formatting (1.2M, 1.5B via `prettifyNumber()`)

**AI Analysis Card**: Present AI output only in dedicated card on detail pages. Flow: CTA → shimmer/analyzing → reveal.

**Accessibility**: Enforce focus states, keyboard navigation, ARIA labels, semantic HTML.

## Backend Standards

**Layers**: Thin route handlers in `app/api/**`; push logic to `src/usecases/**` and `src/domain/**`.

**Ports & Adapters**: Interact with externals via port interfaces (`src/ports/**`); implementations in `src/adapters/**`.

**Validation**: Use Zod for request DTOs; fail fast on invalid input. Validate env via `src/lib/env.ts`.

**Errors**: Use typed errors from `src/lib/errors.ts`; map to proper HTTP status codes.

**HTTP & Retries**: Use `src/lib/http/fetcher.ts` for timeouts/retries with explicit backoff.

**Observability**: Log via `src/lib/observability.ts`; include contextual metadata.

**Rate Limiting**: Use `src/lib/rateLimit.ts` for quotas.

**Security**: Never log secrets; read config from env via `getEnv()`; sanitize/validate user input.

## Testing Standards

**Framework**: Jest 30 + React Testing Library

**Placement**: Co-locate tests under `__tests__/` or as `*.test.ts(x)` next to the code.

**Types**:
- **Unit**: components, hooks, use cases. Mock network with MSW.
- **Integration**: Next.js route handlers with mocked dependencies.

**Setup**: `jest.config.js` configures jsdom, path aliases, and mocks (GSAP, Next.js Image, CSS modules).

**Mocks**:
- Use `jest.mock()` for external libraries
- MSW for API responses
- Mock adapters for UI development (MockMarketDataAdapter, MockTradingActivityAdapter)

**Coverage**: Maintain or improve coverage; don't remove meaningful tests without replacement.

**Performance**: Tests must run fast; prefer deterministic tests.

## Security & CI Standards

**Secrets**: No plaintext secrets in code, tests, or logs. Use env vars and `.env.local` (excluded from VCS).

**Dependencies**: Prefer audited deps; run `pnpm audit` if needed.

**Least Privilege**: Only request env vars you use; avoid broad API key scopes.

**CI Workflow** (`.github/workflows/ci.yml`):
- Runs on pushes to `develop` and pull requests
- Node.js 20.x + pnpm cache
- Steps: install, lint, test, build

**Preflight**: PRs must pass `pnpm preflight` before merge (typecheck + lint with 0 warnings + tests).

**Commits**: Concise, descriptive messages. Follow conventional style if applicable.

## Code Conventions (from .cursor/rules)

### Minimal Safe Edits Workflow
1. **Change only what's required**; avoid unnecessary refactors
2. **Run `pnpm preflight` after edits**; fix failures before finishing
3. **Reuse existing utilities** from `src/lib/*`, `lib/*`, `components/*`
4. **Preserve backward compatibility**; don't break public behavior
5. **Write or update tests** for changed behavior
6. **Respect architecture**: app routes → `app/**`, domain logic → `src/**`, UI → `components/**`
7. **Stick to naming & import conventions** (use `@/*` aliases)
8. **Validate inputs**; avoid unsafe patterns (XSS, SQL injection, command injection)
9. **Update docs** (`docs/*`, `README.md`) if behavior/APIs change
10. **Multi-file changes**: propose brief plan first; implement iteratively in small edits

### File Organization
- App routes in `app/**` (pages, layouts, API routes)
- Domain logic in `src/**` (usecases, domain, adapters, ports, lib)
- UI in `components/**` (crypto domain, ui primitives)
- Tests co-located with code (`__tests__/` or `*.test.ts(x)`)

## Utilities & Helpers

### Number Formatting (`lib/utils/numbers.ts`)
- `prettifyNumber(n)` – Compact notation (1.2M, 1.5B)
- `formatNumber(n)` – Locale-aware formatting
- `formatPercent(n)` – Percentage formatting

### UI Helpers (`lib/utils/ui-helpers.ts`)
- `getPriceMovementColorVar(changePercent)` – CSS color variable based on price delta
- `getPriceMovementTextColorClass(changePercent)` – Tailwind color class

### HTTP (`src/lib/http/`)
- `fetchWithRetry(url, options)` – Retry with exponential backoff
- `withTimeout(promise, ms)` – Promise timeout wrapper
- `dedupe(key, fn)` – Request deduplication

### Random Walk (`lib/utils/random-walk.ts`)
- Generates realistic price simulation for sparkline charts (demo/UI data, not real)

## Notable Quirks & Patterns

1. **Whitelist Filtering**: Assets filtered by 211-symbol whitelist. CoinCap request multiplied by 5x to account for filtered results.

2. **Dual Data Sources**: CoinCap for asset list + pricing; Binance for advanced market data (candles, 24h stats); Mock adapters for UI development.

3. **Server-Side Only**: Details page uses `force-dynamic` to prevent static generation (ensures fresh data).

4. **Sparkline Data**: Charts use random walk algorithm (simulated), not real historical data.

5. **Error Handling**: API errors return 502 "Upstream unavailable" with console logging.

6. **Type-Safe Adapters**: All adapters implement port interfaces, enabling easy test/mock swapping.

## Documentation

See comprehensive docs in `docs/`:
- `Getting-Started.md` – Development setup
- `Architecture.md` – System design overview
- `Technical-Concepts.md` – Key patterns (Ports & Adapters, Suspense, etc.)
- `Usage-API.md` – API endpoint docs
- `Testing.md` – Test patterns and examples
- `Deployment.md` – Deployment instructions
- `Design-System.md` – Design language and component patterns
- `Frontend-Standards.md` – Cursor IDE guidelines

## CI/CD

**Main Branch**: `develop` (target for PRs)

**Actions**: GitHub Actions on pushes to `develop` and pull requests
- Lint, test, and build verification
- pnpm frozen-lockfile (no auto-updates)

Keep PRs small and focused; include descriptions linking related issues.


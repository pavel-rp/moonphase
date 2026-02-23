# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MoonPhase** is an AI-powered crypto dashboard built with Next.js 15, React 19, and TypeScript. It displays live cryptocurrency assets with animated sparklines, price deltas, and per-token details. The codebase follows **Clean/Hexagonal Architecture** with Ports & Adapters for external service integration.

**Note**: The project is branded as "MoonPhase" but the npm package name is "token-pies" (historical).

**Key Pages**:
- `/` – Assets grid with responsive layout (BTC featured at 2x span), shimmer loading states
- `/details/[symbol]` – Token details with price, market cap, charts, market data card, and trading activity (dynamic route, force-dynamic)

**Key Features**:
- Live crypto data from CoinCap (assets/pricing) and Binance (market data)
- Whitelist-filtered asset list (211 curated symbols)
- Animated sparkline charts with GSAP
- Glassmorphic design with custom Tailwind utilities
- Comprehensive testing suite with Jest 30

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
**Frontend**:
- `app/` – Next.js App Router pages, layouts, API routes
  - `api/assets/` – Assets API route handler
  - `details/[symbol]/` – Dynamic token details page
  - `layout.tsx` – Root layout with fonts and metadata
  - `page.tsx` – Home page with assets grid
  - `globals.css` – Tailwind v4 config, design tokens, CSS variables
- `components/crypto/` – Domain-specific components (cards, grid, icons, sparklines)
- `components/ui/` – Reusable UI primitives (button, action-button, card, grid, header, shimmer, sparkline, animations)
- `lib/` – Frontend utilities
  - `data/` – Server-side data fetching (fetchAssets, fetchMarketData, fetchTradingActivity)
  - `utils/` – Number formatting, UI helpers, random walk, sleep

**Backend (Clean Architecture)**:
- `src/adapters/` – External service implementations
  - `coincap/` – CoinCap API adapter
  - `binance/` – Binance API adapter
  - `whitelist/` – Whitelist filtering adapter (211 symbols)
  - `mock/` – Mock adapters for UI development
- `src/ports/` – Port interfaces (contracts for adapters)
- `src/usecases/` – Business logic orchestration (getAssets, getMarketData, getTradingActivity)
- `src/domain/` – Domain models (Asset, MarketData, TradingActivity, types)
- `src/lib/` – Backend utilities (http, env, errors, observability, rateLimit, cache, result)

**Other**:
- `docs/` – Comprehensive documentation
- `public/` – Static assets (crypto-icons, logos)
- `scripts/` – Development scripts (precommit, git hooks)
- `types/` – Global TypeScript type definitions

### Important Files
- `.cursor/rules/` – Development standards (.cursor/rules/00-global.mdc is mandatory)
  - `00-global.mdc` – Minimal safe edits workflow (always applied)
  - `frontend.mdc` – Frontend standards (app/**, components/**)
  - `backend.mdc` – Backend standards (src/**, app/api/**)
  - `testing.mdc` – Testing standards
  - `security-ci.mdc` – Security and CI/CD standards
- `.cursor/mcp.json` – MCP server configuration (spec-workflow)
- `.claude/commands/` – Custom slash commands for Claude Code
  - `fix-tests.md` – Systematic test fixing workflow
- `tsconfig.json` – Path aliases for `@/*` imports
- `jest.config.js`, `jest.setup.js` – Test configuration with mocks
- `postcss.config.mjs` – Tailwind CSS 4 PostCSS plugin (configless mode, no tailwind.config.ts)
- `components.json` – shadcn/ui configuration (new-york style, Lucide icons)

## Environment Setup

### Required Environment Variables
```env
COINCAP_API_KEY=your_coincap_key     # Required for production
COINCAP_BASE_URL=...                 # Optional override (defaults to rest.coincap.io/v3)
BINANCE_API_KEY=...                  # Optional (for advanced features)
BINANCE_BASE_URL=...                 # Optional override (defaults to api.binance.com/api/v3)
OPENAI_API_KEY=...                   # Required for AI analysis
```

Create `.env.local` in the root directory with your API keys.

### Node & Package Manager
- **Node.js**: 20.x (per CI config)
- **Package Manager**: pnpm (frozen-lockfile in CI)

## Frontend Standards

**Framework**: Next.js App Router, Server Components by default (add `'use client'` only when needed)

**Styling**:
- Tailwind CSS 4 (configless) via `@tailwindcss/postcss` plugin - no tailwind.config file
- Design tokens defined in `app/globals.css` using `@theme inline` directive
- Semantic token system: `background/foreground`, `primary/secondary/accent/muted`, `destructive`, `chart-1` through `chart-5`
- Custom utilities: `glassmorphic` (frosted panels), `shadow-glow` (interactive tiles), `corner-shape-squircle`
- CSS custom properties (CSS variables) for theming with OKLCH color space
- **Never hardcode colors, spacing, radii, or shadows** - always use design tokens

**Components**:
- **Required Components**: Use `Button` (never raw `<button>`), `ActionButton` for CTAs, and `Card` with `CardHeader|Content|Footer|Action`
- **UI Primitives** (`components/ui/`): button, action-button, card, grid, header, input, shimmer-card, shimmer-grid, sparkline, animation utilities
- **Domain Components** (`components/crypto/`): crypto-icon, crypto-sparkline, loading-sparkline, card variants, grid variants
- **Icons**: Lucide (via `lucide-react`) + cryptocurrency-icons package (no new icon packs)
- **Reuse First**: Always check existing components before creating new ones

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

## Git Commit Rules

- **NEVER add `Co-Authored-By` lines or any AI attribution to commit messages.** No exceptions.
- **NEVER add "Generated with Claude Code" or any AI-generated promotional lines to PR descriptions, commit messages, or any other output.** No exceptions.

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

### HTTP & Backend Utilities (`src/lib/`)
**HTTP** (`src/lib/http/`):
- `fetchWithRetry(url, options)` – Retry with exponential backoff
- `withTimeout(promise, ms)` – Promise timeout wrapper
- `dedupe(key, fn)` – Request deduplication (prevents concurrent duplicate requests)
- `inflight.ts` – In-flight request tracking

**Core Utilities**:
- `env.ts` – Environment variable validation via `getEnv()`
- `errors.ts` – Typed error classes
- `observability.ts` – Logging with contextual metadata
- `rateLimit.ts` – Rate limiting utilities
- `result.ts` – Result type for error handling
- `cache/` – Caching utilities

### Random Walk (`lib/utils/random-walk.ts`)
- Generates realistic price simulation for sparkline charts (demo/UI data, not real)

## Notable Quirks & Patterns

1. **Whitelist Filtering**: Assets filtered by 211-symbol whitelist. CoinCap request multiplied by 5x to account for filtered results.

2. **Dual Data Sources**: CoinCap for asset list + pricing; Binance for advanced market data (candles, 24h stats); Mock adapters for UI development.

3. **Server-Side Only**: Details page uses `force-dynamic` to prevent static generation (ensures fresh data).

4. **Sparkline Data**: Charts use random walk algorithm (simulated), not real historical data.

5. **Error Handling**: API errors return 502 "Upstream unavailable" with console logging.

6. **Type-Safe Adapters**: All adapters implement port interfaces, enabling easy test/mock swapping.

7. **ActionButton Pattern**: Use `ActionButton` component (not raw `Button`) for prominent CTAs. It includes built-in hover animations (shine effect), glassmorphic styling, and proper focus states.

8. **Tailwind v4 Configless**: No `tailwind.config.ts` file. All configuration is in `app/globals.css` via `@theme inline` directive and CSS custom properties.

## Developer Tooling

### MCP Servers
The project is configured with Model Context Protocol (MCP) servers in `.cursor/mcp.json`:
- **spec-workflow**: Specification and workflow management (via `@pimzino/spec-workflow-mcp`)

### Claude Code Slash Commands
Custom slash commands are available in `.claude/commands/`:
- `/fix-tests` – Systematic test fixing workflow with root cause analysis

### Cursor Rules
Glob-scoped development standards in `.cursor/rules/`:
- **00-global.mdc** (always applied) – Minimal safe edits, preflight checks, architecture boundaries
- **frontend.mdc** (app/**, components/**) – React/Next.js, design system, accessibility
- **backend.mdc** (src/**, app/api/**) – Ports & Adapters, validation, observability
- **testing.mdc** (all files) – Jest patterns, coverage requirements
- **security-ci.mdc** (all files) – Secrets hygiene, dependency safety, PR standards

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
- `Contributing.md` – Branching, commits, and contribution workflow

## CI/CD

**Main Branch**: `develop` (target for PRs)

**Actions**: GitHub Actions on pushes to `develop` and pull requests
- Lint, test, and build verification
- pnpm frozen-lockfile (no auto-updates)

Keep PRs small and focused; include descriptions linking related issues.


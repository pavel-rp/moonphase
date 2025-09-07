# MoonPhase — AI‑powered crypto dashboard

A Next.js 15 app that displays live crypto assets with animated sparkline charts, price deltas, and a details view per token. Built with TypeScript, React 19, and Tailwind CSS 4, with comprehensive unit tests via Jest and Testing Library.

## Features

- Interactive assets grid with featured BTC tile and graceful loading states
- Token details page at `/details/[symbol]` with price change, market cap, and sparkline
- Animated UI with GSAP and custom Parallax background
- Accessible component composition via Radix Slot and iconography (Lucide, cryptocurrency icons)
- Strong typing, strict TS config, and Next.js App Router

## Tech stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS 4, Radix Slot, Lucide
- **Animation**: GSAP, custom parallax background
- **Testing**: Jest 30, @testing-library/react, jest-dom
- **Linting**: ESLint (next/core-web-vitals + TypeScript rules)
- **Package manager**: pnpm

## Documentation
- [Getting Started](docs/Getting-Started.md)
- [Architecture & Design](docs/Architecture.md)
- [Technical Concepts](docs/Technical-Concepts.md)
- [API Usage](docs/Usage-API.md)
- [Testing](docs/Testing.md)
- [Deployment](docs/Deployment.md)
- [Contributing](docs/Contributing.md)

For full documentation, see the Documentation section below.

## Getting started

1) Install dependencies
```bash
pnpm install
```

2) Set environment variables (see below)

3) Run the dev server
```bash
pnpm dev
```
Open http://localhost:3000.

## Environment variables

- `COINCAP_API_KEY` (required): API key used by `src/adapters/coincap/client.ts` to set the `Authorization: Bearer <token>` header for CoinCap requests.
- `COINCAP_BASE_URL` (optional): Override the CoinCap REST base URL; defaults to `https://rest.coincap.io/v3`.
- `BINANCE_API_KEY` (optional): API key for Binance (not required for public endpoints).
- `BINANCE_BASE_URL` (optional): Override Binance base URL. Defaults to `https://api.binance.com/api/v3`.

Create a `.env.local` and add any you need, e.g.:
# CoinCap
COINCAP_API_KEY=your_coincap_key
# BINANCE (optional)
BINANCE_API_KEY=your_binance_key
```

## Scripts

- `pnpm dev`: Start Next.js dev server (Turbopack)
- `pnpm build`: Production build
- `pnpm start`: Start production server
- `pnpm lint`: ESLint (Next + TypeScript rules)
- `pnpm test`: Run Jest test suite
- `pnpm test:watch`: Jest in watch mode
- `pnpm test:coverage`: Coverage report

## Testing

Jest is configured via `jest.config.js` and `jest.setup.js`:
- jsdom environment
- Next and path aliases mapped (`@/...`)
- Mocks for `next/image`, CSS modules, GSAP, and animated sparkline
- Tests are located under `components/crypto/__tests__/` and `lib/**/__tests__/`

Run tests:
```bash
pnpm test
```

## Linting

ESLint flat config (`eslint.config.mjs`) extends Next core rules with TypeScript. Run:
```bash
pnpm lint
```

## CI

GitHub Actions workflow `.github/workflows/ci.yml` runs on pushes to `develop` and on pull requests:
- Setup Node.js 20.x and pnpm
- Cache pnpm store keyed by `pnpm-lock.yaml`
- Install dependencies: `pnpm install --frozen-lockfile --ignore-scripts`
- Lint: `pnpm run lint`
- Test: `pnpm test --silent`
- Build: `pnpm run build`

## Project structure

- `app/`: App Router pages (`/` grid, `/details/[symbol]` details)
- `components/crypto/`: Cards, grid, icons, sparkline, tests
- `components/ui/`: Shared UI (cards, grid, header, animations)
- `lib/data/`: Data fetching for assets and prices
- `lib/utils/`: Number formatting, UI helpers, random walk, sleep

## Notes

- The details page is dynamic (`force-dynamic`) and uses server components with suspenseful data loading
- Price sparkline uses generated sample data for the animated chart; asset list pulls from CoinCap
- Update `next.config.ts` as needed for additional features; default config is minimal

## License

MIT — see LICENSE if present in the repository.

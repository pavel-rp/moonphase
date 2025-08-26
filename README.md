# MoonPhase — AI‑powered crypto dashboard

A Next.js 15 app that displays live crypto assets with animated sparkline charts, price deltas, and a details view per token. Built with TypeScript, React 19, and Tailwind CSS 4, with comprehensive unit tests via Jest and Testing Library.

## Features

- Interactive assets grid with featured BTC tile and graceful loading states
- Token details page at `/details/[symbol]` with price change, market cap, and sparkline
- Animated UI with GSAP and custom Parallax background
- Accessible component library primitives (Radix UI) and iconography (Lucide, cryptocurrency icons)
- Strong typing, strict TS config, and Next.js App Router

## Tech stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS 4, Radix UI, Lucide
- **Animation**: GSAP, custom parallax background
- **Testing**: Jest 30, @testing-library/react, jest-dom
- **Linting**: ESLint (next/core-web-vitals + TypeScript rules)
- **Package manager**: pnpm

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

- `COINCAP_API_KEY` (required): API key for CoinCap used by `lib/data/assets.ts` to fetch assets. Example usage constructs:
  - `https://rest.coincap.io/v3/assets?limit=19&offset=0&apiKey=${process.env.COINCAP_API_KEY}`

Create a `.env.local` and add:
```bash
COINCAP_API_KEY=your_key_here
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

GitHub Actions workflow `.github/workflows/ci.yml` runs on pushes to `main` and on pull requests:
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

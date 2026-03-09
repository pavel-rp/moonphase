# MoonPhase

Crypto dashboard. npm package name is "token-pies" (historical). Sourcebot repo: `github.com/pavel-rp/moonphase`.

## Commands

- Dev: `pnpm dev`
- Test: `pnpm test`
- Lint/fix: `pnpm fix`
- Preflight: `pnpm preflight` — run before finishing any task

## Architecture

Clean/Hexagonal: `app/` → `lib/data/` → `src/usecases/` → `src/ports/` → `src/adapters/` → external APIs.

## Conventions

- Main branch: `develop`
- Tailwind v4 configless — no `tailwind.config.ts`; all config in `app/globals.css` via `@theme inline`
- Use `ActionButton` (not `Button`) for prominent CTAs
- Data display: green = gains, red = losses; always show `+`/`-` signs
- AI analysis: dedicated card on detail pages only (CTA → shimmer → reveal)
- Whitelist filtering: CoinCap request limit multiplied 5x to compensate for filtering

## Boundaries

Always:
- Run `pnpm preflight` before finishing work

Ask first:
- Changes to port interfaces (`src/ports/`)
- Modifications to the asset whitelist

Never:
- Commit secrets or API keys

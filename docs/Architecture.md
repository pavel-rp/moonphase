## Architecture & Design

### Overview
The app follows a Hexagonal (Ports & Adapters) architecture for data access, layered over Next.js App Router UI.

Key layers:
- **Domain**: Types and core entities (e.g., `src/domain/asset.ts`).
- **Ports**: Interfaces that define capabilities (e.g., `src/ports/CoinCapPort.ts`).
- **Adapters**: Implement ports by talking to external services (e.g., `src/adapters/coincap`).
- **Use cases**: Application services orchestrating domain and ports (e.g., `src/usecases/getAssets.ts`).
- **UI**: Next.js pages and components (`app/**`, `components/**`).
- **Lib**: Cross-cutting utilities (HTTP, env, observability, utils) (`src/lib/**`, `lib/**`).

### Module layout
```
src/
├─ domain/
│  └─ asset.ts
├─ ports/
│  └─ CoinCapPort.ts
├─ adapters/
│  └─ coincap/
│     ├─ client.ts           # builds requests, auth header, retry/timeout
│     ├─ CoinCapAdapter.ts   # implements CoinCapPort
│     └─ schema.ts           # zod validation + coercion
├─ usecases/
│  └─ getAssets.ts
└─ lib/
   ├─ env.ts                 # zod-based env parsing
   ├─ http/
   │  ├─ fetcher.ts          # fetchWithRetry + timeout
   │  └─ inflight.ts         # in-flight de-duplication
   └─ observability.ts       # minimal request/error logging

app/
├─ api/assets/route.ts       # GET /api/assets
└─ details/[symbol]/page.tsx # token detail page (server component)
```

### Data flow
```
UI (app/page.tsx, components)                                     
  ↳ lib/data/assets.ts → usecases/getAssets → ports/CoinCapPort    
      ↳ adapters/coincap/CoinCapAdapter                            
          ↳ adapters/coincap/client (env, logging)                 
              ↳ lib/http/fetcher (retry + timeout)                 
          ↳ adapters/coincap/schema (zod) → domain/asset           
```

The API route `app/api/assets/route.ts` exposes `GET /api/assets?limit&offset`, delegating to the same use case, with ISR caching (`export const revalidate = 60`) and Node runtime (`export const runtime = 'nodejs'`).

### Important components
- **HTTP retry/timeout**: `lib/http/fetcher.ts` wraps `fetch` with a timeout and retry on 5xx.
- **In-flight de-duplication**: `lib/http/inflight.ts` ensures concurrent identical requests share a single promise.
- **Schema validation**: `adapters/coincap/schema.ts` uses [Zod](https://zod.dev/) to coerce CoinCap JSON (strings) into typed `Asset` numbers.
- **Env handling**: `src/lib/env.ts` validates `COINCAP_*` variables.
- **Observability**: `src/lib/observability.ts` provides light-weight logging hooks.

### UI & rendering
- **Next.js App Router**: Server components with `Suspense` boundaries for async data.
- **Sparklines**: `components/ui/sparkline.tsx` renders an SVG sparkline; a client HOC adds a GSAP line-draw animation.
- **Details page**: `app/details/[symbol]/page.tsx` fetches assets, performs case-insensitive symbol lookup, and renders metrics.

### Design decisions
- Adopt Hexagonal boundaries to isolate external APIs and make testing easy.
- Use Zod for both environment parsing and HTTP response validation.
- Prefer server components and `Suspense` for fast-first render with progressive hydration.
- Keep caching simple initially (ISR + in-flight de-dupe); revisit with server caches as needed.

### References
- Hexagonal Architecture: [Alistair Cockburn's Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- Next.js App Router: [nextjs.org/docs/app](https://nextjs.org/docs/app)
- Zod: [zod.dev](https://zod.dev)

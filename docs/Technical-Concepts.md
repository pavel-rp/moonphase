## Technical Concepts & Background

### Hexagonal (Ports & Adapters) Architecture
An architectural style that decouples domain logic from external concerns via ports (interfaces) and adapters (implementations). In this project, `CoinCapPort` is the port; `CoinCapAdapter` is the adapter. See: [alistair.cockburn.us/hexagonal-architecture](https://alistair.cockburn.us/hexagonal-architecture/)

### Next.js App Router and Server Components
The App Router encourages nested layouts, streaming, and server components for efficient data fetching. Docs: [nextjs.org/docs/app](https://nextjs.org/docs/app)

### React Suspense for Data Fetching
`<Suspense>` lets you declaratively handle loading states around async boundaries. Docs: [react.dev/reference/react/Suspense](https://react.dev/reference/react/Suspense)

### Zod Validation
Schema-first validation and type inference used for environment parsing and API response coercion. Docs: [zod.dev](https://zod.dev)

### GSAP Animations
The sparkline animation uses GSAP and the DrawSVG plugin through a client-side HOC. Docs: [gsap.com/docs](https://gsap.com/docs/)

### Tailwind CSS
Utility-first CSS for rapid UI design. Docs: [tailwindcss.com/docs](https://tailwindcss.com/docs)

### Jest + Testing Library
Unit tests render components and assert behavior via DOM queries. Docs: [jestjs.io/docs](https://jestjs.io/docs/getting-started), [testing-library.com/docs/react-testing-library](https://testing-library.com/docs/react-testing-library/intro/)

### Geometric Brownian Motion (Random Walk)
`lib/utils/random-walk.ts` simulates a price series using geometric Brownian motion, commonly used for asset price modeling. Reference: [en.wikipedia.org/wiki/Geometric_Brownian_motion](https://en.wikipedia.org/wiki/Geometric_Brownian_motion)

### Fetch, Undici, and Timeouts
`fetchWithRetry` wraps `fetch` with retry and timeout behavior; Next.js fetch is built on [Undici](https://undici.nodejs.org/#/). Fetch API: [developer.mozilla.org/docs/Web/API/fetch](https://developer.mozilla.org/docs/Web/API/fetch)

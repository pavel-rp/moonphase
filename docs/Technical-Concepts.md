## Technical Concepts & Background

### Hexagonal (Ports & Adapters) Architecture
An architectural style that decouples domain logic from external concerns via ports (interfaces) and adapters (implementations). In this project, `CoinCapPort` is the port; `CoinCapAdapter` is the adapter. See: [Alistair Cockburn's Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

### Next.js App Router and Server Components
The App Router encourages nested layouts, streaming, and server components for efficient data fetching. Docs: [nextjs.org/docs/app](https://nextjs.org/docs/app)

### React Suspense for Data Fetching
`<Suspense>` lets you declaratively handle loading states around async boundaries. Docs: [react.dev/reference/react/Suspense](https://react.dev/reference/react/Suspense)

### Zod Validation
Schema-first validation and type inference used for environment parsing and API response coercion. Docs: [zod.dev](https://zod.dev)

### Motion Animations
The sparkline client HOC uses Motion to draw its non-scaling stroke over 0.8s (cubic-out) and fade its container over 0.4s (quadratic-in/out). Screen-scaled polyline lengths are measured once in a batch before dash writes. The same library drives route slides, hover tilt and parallax. Animations respect reduced motion, including live preference changes. Docs: [motion.dev/docs/react](https://motion.dev/docs/react)

### Tailwind CSS
Utility-first CSS for rapid UI design. Docs: [tailwindcss.com/docs](https://tailwindcss.com/docs)

### shadcn/ui and Radix Slot
UI components follow the shadcn/ui composition approach and use Radix Slot for `asChild` patterns (see `components/ui/button.tsx`).
Docs: [ui.shadcn.com](https://ui.shadcn.com) and [Radix Slot](https://www.radix-ui.com/primitives/docs/utilities/slot)

### Jest + Testing Library
Unit tests render components and assert behavior via DOM queries. Docs: [jestjs.io/docs](https://jestjs.io/docs/getting-started), [testing-library.com/docs/react-testing-library](https://testing-library.com/docs/react-testing-library/intro/)

### Geometric Brownian Motion (Random Walk)
`lib/utils/random-walk.ts` simulates a price series using geometric Brownian motion, commonly used for asset price modeling. Reference: [en.wikipedia.org/wiki/Geometric_Brownian_motion](https://en.wikipedia.org/wiki/Geometric_Brownian_motion)

### Fetch, Undici, and Timeouts
`fetchWithRetry` wraps `fetch` with retry and timeout behavior; Next.js fetch is built on [Undici](https://undici.nodejs.org/#/). Fetch API: [developer.mozilla.org/docs/Web/API/fetch](https://developer.mozilla.org/docs/Web/API/fetch)

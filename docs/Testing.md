## Testing

### Overview
This project uses **Jest** and **@testing-library/react** with a jsdom environment. Tests live alongside components (e.g., `components/**/__tests__`) and app pages (e.g., `app/**/__tests__`). Coverage targets UI behaviors and data-flow boundaries.

### Configuration
- Base config: `jest.config.js` (Next.js preset via `next/jest`)
- Setup file: `jest.setup.js`
  - Mocks `next/image`
  - Mocks CSS modules
  - Mocks GSAP and animation HOCs
  - Mocks `AnimatedSparkline`
- Module aliases (`^@/(.*)$`) map to `src/` and top-level folders

### Commands
```bash
pnpm test           # run once
pnpm test:watch     # watch mode
pnpm test:coverage  # coverage report
```

### What to test
- **Components**: rendering, states, and interactions (use `@testing-library/react` queries and assertions from `jest-dom`).
- **Use cases**: unit-test pure logic by mocking ports/adapters.
- **Adapters**: contract tests with mocked fetch or MSW when added in the future.
- **API routes**: integration tests for `app/api/**` can use Next.js route handlers with mocked dependencies.

### Examples
- `components/crypto/__tests__/AssetsGrid.test.tsx`: Suspense fallback and grid rendering.
- `app/details/[symbol]/__tests__/page.test.tsx`: server component rendering and conditional `notFound`.
- `components/crypto/__tests__/CryptoIcon.test.tsx`: mocking utility functions and verifying props.

### Linting & CI
CI runs lint, tests, and build (`.github/workflows/ci.yml`). Lint config is `eslint.config.mjs`.

### References
- Jest: [jestjs.io/docs](https://jestjs.io/docs/getting-started)
- Testing Library: [testing-library.com/docs/react-testing-library](https://testing-library.com/docs/react-testing-library/intro/)
- Next.js testing: [nextjs.org/docs/pages/building-your-application/optimizing/testing](https://nextjs.org/docs/pages/building-your-application/optimizing/testing)

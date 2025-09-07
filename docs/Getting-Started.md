## Getting Started (Developer Setup)

### Prerequisites
- **Node.js**: 20.x (CI uses Node 20)
- **pnpm**: Latest (`pnpm -v`)

### Installation
```bash
pnpm install
```

### Configuration
Create `.env.local` in the project root:
```bash
COINCAP_API_KEY=your_key_here
# optional override
COINCAP_BASE_URL=https://rest.coincap.io/v3
```
Environment validation is performed with Zod in `src/lib/env.ts`.

### Run the app (development)
```bash
pnpm dev
```
Open http://localhost:3000

### Build and run (production)
```bash
pnpm build
pnpm start
```

### Run tests
```bash
pnpm test           # run once
pnpm test:watch     # watch mode
pnpm test:coverage  # coverage report
```

### Troubleshooting
- **Invalid environment configuration**: Thrown from `getEnv()` if variables are malformed. Ensure `.env.local` matches `src/lib/env.ts` schema.
- **502 from /api/assets**: Upstream CoinCap error or bad API key. Verify `COINCAP_API_KEY` and network access.
- **ESM/test issues with animations**: GSAP and client-only animations are mocked in `jest.setup.js`.
- **Port in use (3000)**: Set `PORT=3001 pnpm dev` to use another port.
- **Node version mismatch**: Use Node 20.x to match CI.

### References
- Next.js App Router: [nextjs.org/docs/app](https://nextjs.org/docs/app)
- pnpm: [pnpm.io](https://pnpm.io)
- CoinCap API: [docs.coincap.io](https://docs.coincap.io/)

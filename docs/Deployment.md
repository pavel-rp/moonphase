## Deployment / Operations

### Build artifacts
```bash
pnpm build  # outputs .next
pnpm start  # starts production server
```

### Environment
Set variables via your platform's secret manager or a `.env` file:
- `COINCAP_API_KEY`: required
- `COINCAP_BASE_URL`: optional override

### Runtime
- Route handlers run with `runtime = 'nodejs'`.
- ISR: `revalidate = 60` on `/api/assets`.

### Hosting options
- **Vercel**: Native for Next.js. Configure env vars in Project → Settings → Environment Variables.
- **Node server**: Any Node 20+ environment. Use `pnpm build && pnpm start` behind a process manager (e.g., PM2) and reverse proxy (e.g., Nginx).

### Health and monitoring
- Upstream dependency: CoinCap REST API. Monitor request failures and latency.
- Basic logging: `src/lib/observability.ts` logs outbound requests and errors.
- Consider adding structured logging and metrics in production (e.g., pino, OpenTelemetry).

### Scaling
- Stateless server; scale horizontally.
- Cache-friendly endpoints with ISR reduce upstream load; add server-side caching if traffic increases.

### Maintenance tasks
- Dependency updates: use Renovate/Dependabot.
- Security: rotate `COINCAP_API_KEY`; restrict access.
- Testing: CI runs lint, tests, and build on PRs and pushes to `develop`.

### Migrations
No database or migrations are present.

### References
- Next.js deployment: [nextjs.org/docs/app/building-your-application/deploying](https://nextjs.org/docs/app/building-your-application/deploying)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

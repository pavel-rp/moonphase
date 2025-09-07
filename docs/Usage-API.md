## Usage / API Documentation

### Public API Route
`GET /api/assets?limit={number}&offset={number}`

- **Description**: Returns a list of assets from CoinCap, validated and normalized to the `Asset` domain shape.
- **Caching**: Revalidated every 60 seconds (`export const revalidate = 60`).
- **Runtime**: Node.js (`export const runtime = 'nodejs'`).

#### Response
```json
[
  {
    "id": "bitcoin",
    "rank": 1,
    "symbol": "BTC",
    "name": "Bitcoin",
    "supply": 19759206,
    "maxSupply": 21000000,
    "marketCapUsd": 1989079039632.52,
    "volumeUsd24Hr": 15692705919.39,
    "priceUsd": 100654.39,
    "changePercent24Hr": 1.23,
    "vwap24Hr": 99887.76,
    "explorer": "https://blockchain.info/"
  }
]
```

#### Example request
```bash
curl "http://localhost:3000/api/assets?limit=19&offset=0"
```

### Internal Library Usage

#### Fetch assets in server components
```ts
import { fetchAssets } from "@/lib/data/assets";

export default async function Page() {
  const assets = await fetchAssets();
  // ...render
}
```

#### Sparkline component
```tsx
import { CryptoSparkline } from "@/components/crypto/crypto-sparkline";

<CryptoSparkline symbol="BTC" />
```

#### Crypto icon
```tsx
import { CryptoIcon } from "@/components/crypto/crypto-icon";

<CryptoIcon symbol="BTC" size={32} style="color" />
```

### Notes
- The adapter layer (`CoinCapAdapter`) uses `fetchWithRetry` with timeouts and validates responses via Zod.
- Configure `COINCAP_API_KEY` and optionally `COINCAP_BASE_URL` in `.env.local`.

### References
- Next.js Route Handlers: [nextjs.org/docs/app/building-your-application/routing/router-handlers](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)
- CoinCap API: [docs.coincap.io](https://docs.coincap.io/)

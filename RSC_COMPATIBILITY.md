# RSC (React Server Components) Compatibility

This document explains how the price data integration works with Next.js React Server Components (RSC) and the improvements made for server-side rendering.

## ✅ RSC-Compatible Implementation

The implementation now includes RSC-compatible versions of all components and services:

### 🔧 **Key Changes for RSC**

#### 1. **Proper Server-Side Caching**
```typescript
// Using Next.js unstable_cache for server-side caching
const cachedFetch = unstable_cache(
  async () => this.getSparklineDataCached(symbol, options),
  [cacheKey],
  {
    revalidate: 60, // Cache for 1 minute
    tags: [`sparkline-${symbol}`],
  }
);
```

#### 2. **React cache() for Request Deduplication**
```typescript
// Prevents duplicate requests during the same render
private getSparklineDataCached = cache(async (symbol: string, options: PriceDataOptions = {}) => {
  // Implementation
});
```

#### 3. **Removed Instance-Level Rate Limiting**
- ❌ **Before**: `private lastRequestTime = 0;` (doesn't work across server instances)
- ✅ **After**: Relies on Next.js caching and exchange rate limits

#### 4. **Better Error Handling**
```typescript
// RSC-compatible error handling
export async function getSparklineDataRSC(symbol: string, options: PriceDataOptions = {}): Promise<SparklineData | null> {
  try {
    return await priceDataServiceRSC.getSparklineData(symbol, options);
  } catch (error) {
    console.error(`RSC: Failed to fetch sparkline data for ${symbol}:`, error);
    return null; // Return null instead of throwing
  }
}
```

## 🏗️ **Architecture for RSC**

### **Files Structure**
```
lib/
├── services/
│   ├── price-data-rsc.ts          # RSC-compatible main service
│   └── exchanges/
│       ├── binance-rsc.ts         # RSC-compatible Binance provider
│       └── ...                    # Other providers (to be updated)
└── types/
    └── price-data.ts              # Shared types

components/
└── crypto/
    └── CryptoSparklineRSC.tsx     # RSC-compatible component
```

### **Server Components vs Client Components**

#### ✅ **Server Components (RSC)**
- `CryptoSparklineRSC` - Fetches data on the server
- `CryptoCard` - Renders on the server with cached data
- `AssetsGrid` - Server-side data fetching

#### 🔄 **Client Components (when needed)**
- `Sparkline` - Interactive SVG rendering
- `LoadingSparkline` - Animation states

## 🚀 **Performance Benefits**

### **1. Server-Side Caching**
- **Sparkline data**: Cached for 1 minute
- **Kline data**: Cached for 5 minutes
- **Request deduplication**: Same requests during render are deduplicated

### **2. Reduced Client-Side JavaScript**
- API calls happen on the server
- No need to ship exchange provider code to client
- Faster initial page load

### **3. Better SEO**
- Price data is available during server-side rendering
- Search engines can index actual price information
- No loading states for initial render

## 🔧 **Usage**

### **Basic Usage (RSC)**
```tsx
import { CryptoSparklineRSC } from '@/components/crypto/CryptoSparklineRSC';

// Server component - data fetched on server
export default function MyPage() {
  return (
    <div>
      <CryptoSparklineRSC symbol="BTC" />
    </div>
  );
}
```

### **Advanced Usage (RSC)**
```tsx
import { getSparklineDataRSC } from '@/lib/services/price-data-rsc';

export default async function DetailedPage() {
  const btcData = await getSparklineDataRSC('BTC');
  
  if (!btcData) {
    return <div>Unable to load Bitcoin data</div>;
  }
  
  return (
    <div>
      <h1>Bitcoin Price: ${btcData.prices[btcData.prices.length - 1]}</h1>
      <p>24h Change: {btcData.changePercent24h.toFixed(2)}%</p>
    </div>
  );
}
```

### **Client-Side Usage (when needed)**
```tsx
'use client';

import { useEffect, useState } from 'react';
import { priceDataService } from '@/lib/services/price-data';

export default function ClientComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    priceDataService.getSparklineData('BTC').then(setData);
  }, []);
  
  return <div>{/* Client-side rendering */}</div>;
}
```

## 📊 **Caching Strategy**

### **Cache Levels**
1. **React cache()**: Request-level deduplication
2. **Next.js unstable_cache**: Server-side persistence
3. **Exchange rate limits**: API-level protection

### **Cache Duration**
- **Sparkline**: 60 seconds (frequent updates)
- **Kline data**: 300 seconds (less frequent updates)
- **Error states**: No caching (immediate retry)

### **Cache Invalidation**
```typescript
// Manual cache invalidation (if needed)
import { revalidateTag } from 'next/cache';

// Invalidate specific symbol
revalidateTag('sparkline-BTC');

// Invalidate all sparklines
revalidateTag('sparkline');
```

## 🔒 **Error Handling**

### **Graceful Degradation**
```tsx
// Component renders even if data fails
async function CryptoSparklineLoaderRSC({ symbol }: { symbol: string }) {
  const sparklineData = await getSparklineDataRSC(symbol, { period: '24h' });
  
  if (!sparklineData) {
    // Fallback UI instead of error
    return (
      <div className="h-8 w-full bg-gray-200 rounded opacity-50 flex items-center justify-center">
        <span className="text-xs text-gray-500">No data</span>
      </div>
    );
  }
  
  // Normal rendering
  return <Sparkline data={sparklineData.prices} className={color} />;
}
```

### **Error Boundaries**
```tsx
// Wrap components in error boundaries for production
import { ErrorBoundary } from 'react-error-boundary';

export default function SafeSparkline({ symbol }: { symbol: string }) {
  return (
    <ErrorBoundary fallback={<div>Chart unavailable</div>}>
      <CryptoSparklineRSC symbol={symbol} />
    </ErrorBoundary>
  );
}
```

## 🧪 **Testing RSC Compatibility**

### **Development Testing**
```bash
# Start development server
pnpm dev

# Test server-side rendering
curl -H "Accept: text/html" http://localhost:3000

# Check for hydration errors in browser console
# Verify data is present in initial HTML
```

### **Production Testing**
```bash
# Build and test
pnpm build
pnpm start

# Test different cache scenarios
# Verify performance in production mode
```

## 🚧 **Migration Guide**

### **From Client Components**
```tsx
// OLD: Client component
'use client';
import { CryptoSparkline } from './CryptoSparkline';

// NEW: Server component
import { CryptoSparklineRSC } from './CryptoSparklineRSC';
```

### **From Instance-Based Services**
```tsx
// OLD: Instance-based service
const service = new PriceDataService();
const data = await service.getSparklineData('BTC');

// NEW: RSC-compatible function
import { getSparklineDataRSC } from '@/lib/services/price-data-rsc';
const data = await getSparklineDataRSC('BTC');
```

## 🔮 **Future Enhancements**

### **Planned Improvements**
- [ ] Convert all exchange providers to RSC-compatible versions
- [ ] Add streaming for real-time updates
- [ ] Implement proper error boundaries
- [ ] Add metrics and monitoring
- [ ] Edge runtime compatibility

### **Performance Optimizations**
- [ ] Implement Redis caching for production
- [ ] Add CDN caching for API responses
- [ ] Optimize bundle size for server components
- [ ] Add preloading for critical price data

## 📈 **Benefits Summary**

### ✅ **What RSC Provides**
- **Faster initial loads**: Data fetched on server
- **Better SEO**: Real data in HTML
- **Reduced JavaScript**: Less client-side code
- **Improved caching**: Server-side persistence
- **Better error handling**: Graceful degradation

### ⚠️ **Trade-offs**
- **Complexity**: More setup required
- **Debugging**: Server-side errors harder to debug
- **Real-time updates**: Requires additional setup
- **Client interactivity**: Some features need client components

---

*The RSC implementation provides a robust, performant, and SEO-friendly solution for cryptocurrency price data integration.*
# Price Data Integration

This branch (`fearure/price-action-data`) implements real-time price data loading from multiple cryptocurrency exchanges for sparkline display and technical analysis.

## Features

### 🔥 Multi-Exchange Support
- **Binance**: Global leader with high liquidity
- **Bybit**: Popular derivatives and spot trading
- **Coinbase**: Major US-based exchange
- **Kraken**: Established exchange with good API
- **KuCoin**: Growing exchange with diverse offerings

### 📈 Real-Time Data
- Live price data fetching
- Automatic fallback between exchanges
- Rate limiting for API compliance
- Error handling and resilience

### 🎯 Technical Analysis
- Moving averages (SMA, EMA)
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- Volatility calculations
- Support/Resistance levels
- Pattern detection
- Trading signals

## Architecture

### Core Components

#### 1. Type Definitions (`lib/types/price-data.ts`)
```typescript
export interface PricePoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SparklineData {
  symbol: string;
  prices: number[];
  timestamps: number[];
  change24h: number;
  changePercent24h: number;
}
```

#### 2. Exchange Providers (`lib/services/exchanges/`)
Each exchange implements the `PriceDataProvider` interface:
- `BinanceProvider`
- `BybitProvider`
- `CoinbaseProvider`
- `KrakenProvider`
- `KucoinProvider`

#### 3. Price Data Service (`lib/services/price-data.ts`)
Central service that coordinates multiple exchanges with automatic fallback.

#### 4. Technical Analysis (`lib/utils/technical-analysis.ts`)
Comprehensive technical analysis utilities for price data.

## Usage

### Basic Sparkline Integration

The `CryptoSparkline` component now automatically fetches real price data:

```tsx
import { CryptoSparkline } from '@/components/crypto/CryptoSparkline';

// Automatically fetches 24h price data for BTC
<CryptoSparkline symbol="BTC" />
```

### Manual Price Data Fetching

```typescript
import { priceDataService } from '@/lib/services/price-data';

// Get sparkline data
const sparklineData = await priceDataService.getSparklineData('BTC', {
  period: '24h',
  preferredExchange: 'binance'
});

// Get detailed kline data
const klineData = await priceDataService.getKlineData('ETH', {
  interval: '1h',
  limit: 100,
  preferredExchange: 'bybit'
});
```

### Technical Analysis

```typescript
import { TechnicalAnalysis } from '@/lib/utils/technical-analysis';

// Generate technical indicators
const indicators = TechnicalAnalysis.generateIndicators(sparklineData);

// Generate trading signals
const signal = TechnicalAnalysis.generateTradingSignal(indicators, currentPrice);

// Calculate support/resistance
const levels = TechnicalAnalysis.calculateSupportResistance(prices);
```

## Exchange Configuration

### Symbol Formats
Different exchanges use different symbol formats:
- **Binance**: `BTCUSDT`
- **Bybit**: `BTCUSDT`
- **Coinbase**: `BTC-USD`
- **Kraken**: `XBTUSD`
- **KuCoin**: `BTC-USDT`

The providers automatically handle symbol conversion.

### Rate Limiting
All providers implement rate limiting to comply with exchange APIs:
- Default: 1 request per second
- Automatic retry with exponential backoff
- Fallback to alternative exchanges

## Error Handling

### Automatic Fallback
If one exchange fails, the system automatically tries the next available exchange in this order:
1. Binance (highest priority)
2. Bybit
3. Coinbase
4. Kraken
5. KuCoin

### Error States
- Network errors: Automatic retry
- API errors: Fallback to next exchange
- Symbol not found: Try alternative symbol formats
- Rate limit exceeded: Wait and retry

## Performance Considerations

### Caching
- Built-in rate limiting prevents excessive API calls
- Consider implementing Redis caching for production
- Sparkline data is cached in React components

### Data Freshness
- Sparkline data refreshes every component mount
- Consider implementing WebSocket connections for real-time updates
- Background refresh for better UX

## Environment Variables

No API keys are required for public endpoints, but you can configure:

```env
# Optional: Configure preferred exchanges
PREFERRED_EXCHANGE=binance
FALLBACK_EXCHANGES=bybit,coinbase,kraken,kucoin

# Optional: Custom rate limits (milliseconds)
RATE_LIMIT_BINANCE=1000
RATE_LIMIT_BYBIT=1000
```

## Future Enhancements

### 🚀 Potential Improvements
- WebSocket connections for real-time updates
- Redis caching for better performance
- More advanced technical indicators
- Portfolio tracking
- Price alerts
- Historical data storage
- Chart visualization improvements

### 📊 Additional Exchanges
- Huobi
- OKX
- Gate.io
- Bitfinex
- FTX (if available)

### 🔧 Technical Enhancements
- TypeScript strict mode compliance
- Unit tests for all providers
- Integration tests
- Performance monitoring
- Error tracking
- Metrics collection

## Testing

### Manual Testing
```bash
# Start the development server
pnpm dev

# Open http://localhost:3000
# Check browser console for any API errors
# Verify sparklines are loading real data
```

### API Testing
```typescript
// Test individual exchange providers
const binance = new BinanceProvider();
const data = await binance.fetchSparklineData('BTC');
console.log(data);
```

## Deployment

### Production Considerations
- Monitor API rate limits
- Implement proper error logging
- Set up monitoring for exchange availability
- Consider CDN for static assets
- Implement proper CORS policies

### Security
- All exchanges use HTTPS
- No API keys stored in client-side code
- Rate limiting prevents abuse
- Input validation for symbols

## Troubleshooting

### Common Issues

1. **Sparklines not loading**
   - Check network connectivity
   - Verify exchange API status
   - Check browser console for errors

2. **API rate limiting**
   - Reduce request frequency
   - Implement caching
   - Use multiple exchanges

3. **Symbol not found**
   - Check symbol format
   - Verify exchange supports the symbol
   - Try alternative exchanges

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug', 'price-data:*');
```

## Contributing

### Adding New Exchanges
1. Create new provider in `lib/services/exchanges/`
2. Implement `PriceDataProvider` interface
3. Add to `PriceDataService` constructor
4. Update documentation
5. Add tests

### Code Style
- Use TypeScript strict mode
- Follow existing patterns
- Add JSDoc comments
- Handle errors gracefully
- Implement rate limiting

---

*This implementation provides a robust foundation for real-time cryptocurrency price data integration with multiple exchange support and comprehensive technical analysis capabilities.*
import { PricePoint, SparklineData } from '@/lib/types/price-data';

export interface TechnicalIndicators {
  sma: number;
  ema: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: number;
  volatility: number;
}

export interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  strength: number; // 0-100
  reasons: string[];
}

export class TechnicalAnalysis {
  /**
   * Calculate Simple Moving Average
   */
  static calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  /**
   * Calculate Exponential Moving Average
   */
  static calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA is just the first price
    ema[0] = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    
    return ema;
  }

  /**
   * Calculate Relative Strength Index (RSI)
   */
  static calculateRSI(prices: number[], period: number = 14): number[] {
    const gains: number[] = [];
    const losses: number[] = [];
    const rsi: number[] = [];

    // Calculate gains and losses
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }

    // Calculate average gains and losses
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Calculate RSI
    for (let i = period; i < prices.length; i++) {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));

      // Update averages
      if (i < prices.length - 1) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      }
    }

    return rsi;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  static calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    const macdLine: number[] = [];
    const startIndex = Math.max(0, slowPeriod - fastPeriod);
    
    for (let i = startIndex; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
    
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const histogram: number[] = [];
    
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(macdLine[i + (macdLine.length - signalLine.length)] - signalLine[i]);
    }
    
    return {
      macd: macdLine[macdLine.length - 1] || 0,
      signal: signalLine[signalLine.length - 1] || 0,
      histogram: histogram[histogram.length - 1] || 0,
    };
  }

  /**
   * Calculate Bollinger Bands
   */
  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.calculateSMA(prices, period);
    const lastSMA = sma[sma.length - 1];
    
    // Calculate standard deviation
    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - lastSMA, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: lastSMA + (standardDeviation * stdDev),
      middle: lastSMA,
      lower: lastSMA - (standardDeviation * stdDev),
    };
  }

  /**
   * Calculate price volatility
   */
  static calculateVolatility(prices: number[], period: number = 14): number {
    if (prices.length < period) return 0;
    
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
    
    const recentReturns = returns.slice(-period);
    const mean = recentReturns.reduce((a, b) => a + b, 0) / recentReturns.length;
    const variance = recentReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / recentReturns.length;
    
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  /**
   * Generate comprehensive technical indicators
   */
  static generateIndicators(sparklineData: SparklineData): TechnicalIndicators {
    const { prices } = sparklineData;
    
    const sma20 = this.calculateSMA(prices, 20);
    const ema12 = this.calculateEMA(prices, 12);
    const rsi = this.calculateRSI(prices);
    const macd = this.calculateMACD(prices);
    const bollinger = this.calculateBollingerBands(prices);
    const volatility = this.calculateVolatility(prices);
    
    return {
      sma: sma20[sma20.length - 1] || 0,
      ema: ema12[ema12.length - 1] || 0,
      rsi: rsi[rsi.length - 1] || 50,
      macd,
      bollinger,
      volume: 0, // Would need volume data from klines
      volatility,
    };
  }

  /**
   * Generate trading signals based on technical indicators
   */
  static generateTradingSignal(indicators: TechnicalIndicators, currentPrice: number): TradingSignal {
    const reasons: string[] = [];
    let buySignals = 0;
    let sellSignals = 0;
    
    // RSI signals
    if (indicators.rsi < 30) {
      buySignals++;
      reasons.push('RSI indicates oversold condition');
    } else if (indicators.rsi > 70) {
      sellSignals++;
      reasons.push('RSI indicates overbought condition');
    }
    
    // MACD signals
    if (indicators.macd.macd > indicators.macd.signal && indicators.macd.histogram > 0) {
      buySignals++;
      reasons.push('MACD showing bullish momentum');
    } else if (indicators.macd.macd < indicators.macd.signal && indicators.macd.histogram < 0) {
      sellSignals++;
      reasons.push('MACD showing bearish momentum');
    }
    
    // Bollinger Bands signals
    if (currentPrice < indicators.bollinger.lower) {
      buySignals++;
      reasons.push('Price below lower Bollinger Band');
    } else if (currentPrice > indicators.bollinger.upper) {
      sellSignals++;
      reasons.push('Price above upper Bollinger Band');
    }
    
    // Moving Average signals
    if (currentPrice > indicators.sma && currentPrice > indicators.ema) {
      buySignals++;
      reasons.push('Price above moving averages');
    } else if (currentPrice < indicators.sma && currentPrice < indicators.ema) {
      sellSignals++;
      reasons.push('Price below moving averages');
    }
    
    // Determine signal
    const totalSignals = buySignals + sellSignals;
    const strength = totalSignals > 0 ? Math.min(100, (Math.max(buySignals, sellSignals) / totalSignals) * 100) : 0;
    
    let type: 'buy' | 'sell' | 'hold' = 'hold';
    if (buySignals > sellSignals) {
      type = 'buy';
    } else if (sellSignals > buySignals) {
      type = 'sell';
    }
    
    return { type, strength, reasons };
  }

  /**
   * Calculate support and resistance levels
   */
  static calculateSupportResistance(prices: number[], lookback: number = 20): { support: number; resistance: number } {
    const recentPrices = prices.slice(-lookback);
    const sorted = [...recentPrices].sort((a, b) => a - b);
    
    const support = sorted[Math.floor(sorted.length * 0.2)]; // 20th percentile
    const resistance = sorted[Math.floor(sorted.length * 0.8)]; // 80th percentile
    
    return { support, resistance };
  }

  /**
   * Detect chart patterns
   */
  static detectPatterns(prices: number[]): string[] {
    const patterns: string[] = [];
    
    if (prices.length < 10) return patterns;
    
    const recent = prices.slice(-10);
    const trend = recent[recent.length - 1] - recent[0];
    
    // Simple pattern detection
    if (trend > 0) {
      patterns.push('Uptrend');
    } else if (trend < 0) {
      patterns.push('Downtrend');
    }
    
    // Check for consolidation
    const volatility = this.calculateVolatility(recent);
    if (volatility < 0.1) {
      patterns.push('Consolidation');
    }
    
    return patterns;
  }
}
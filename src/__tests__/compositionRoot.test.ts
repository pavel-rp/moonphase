import {
  assetsDeps,
  pricesDeps,
  marketDataDeps,
  tradingActivityDeps,
} from '../compositionRoot';

describe('compositionRoot', () => {
  describe('assetsDeps', () => {
    it('exports coinCap and whitelist properties', () => {
      expect(assetsDeps).toHaveProperty('coinCap');
      expect(assetsDeps).toHaveProperty('whitelist');
    });

    it('coinCap has listAssets method', () => {
      expect(typeof assetsDeps.coinCap.listAssets).toBe('function');
    });

    it('whitelist has listAllowedSymbols method', () => {
      expect(typeof assetsDeps.whitelist.listAllowedSymbols).toBe('function');
    });
  });

  describe('pricesDeps', () => {
    it('exports binance property', () => {
      expect(pricesDeps).toHaveProperty('binance');
    });

    it('binance has getDailyCandles and get24HrStats methods', () => {
      expect(typeof pricesDeps.binance.getDailyCandles).toBe('function');
      expect(typeof pricesDeps.binance.get24HrStats).toBe('function');
    });
  });

  describe('marketDataDeps', () => {
    it('exports marketData property', () => {
      expect(marketDataDeps).toHaveProperty('marketData');
    });

    it('marketData has getBySymbol method', () => {
      expect(typeof marketDataDeps.marketData.getBySymbol).toBe('function');
    });
  });

  describe('tradingActivityDeps', () => {
    it('exports tradingActivity property', () => {
      expect(tradingActivityDeps).toHaveProperty('tradingActivity');
    });

    it('tradingActivity has getBySymbol method', () => {
      expect(typeof tradingActivityDeps.tradingActivity.getBySymbol).toBe('function');
    });
  });

  describe('singleton behavior', () => {
    it('returns the same object references on repeated access', async () => {
      const { assetsDeps: a1 } = await import('../compositionRoot');
      const { assetsDeps: a2 } = await import('../compositionRoot');
      expect(a1).toBe(a2);
      expect(a1.coinCap).toBe(a2.coinCap);
    });
  });
});

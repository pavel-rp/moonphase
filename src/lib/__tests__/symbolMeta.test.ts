import { toBinancePair, toDisplayName } from '../symbolMeta';

describe('toBinancePair', () => {
  it('returns mapped pair for known symbols', () => {
    expect(toBinancePair('BTC')).toBe('BTCUSDT');
    expect(toBinancePair('ETH')).toBe('ETHUSDT');
    expect(toBinancePair('TON')).toBe('TONUSDT');
  });

  it('normalizes input to uppercase', () => {
    expect(toBinancePair('btc')).toBe('BTCUSDT');
    expect(toBinancePair('Eth')).toBe('ETHUSDT');
  });

  it('falls back to ${UPPER}USDT for unknown symbols', () => {
    expect(toBinancePair('SHIB')).toBe('SHIBUSDT');
    expect(toBinancePair('pepe')).toBe('PEPEUSDT');
  });
});

describe('toDisplayName', () => {
  it('returns human-readable name for known symbols', () => {
    expect(toDisplayName('BTC')).toBe('Bitcoin');
    expect(toDisplayName('ETH')).toBe('Ethereum');
    expect(toDisplayName('DOGE')).toBe('Dogecoin');
  });

  it('normalizes input to uppercase', () => {
    expect(toDisplayName('btc')).toBe('Bitcoin');
    expect(toDisplayName('Eth')).toBe('Ethereum');
  });

  it('falls back to uppercased symbol for unknown symbols', () => {
    expect(toDisplayName('SHIB')).toBe('SHIB');
    expect(toDisplayName('pepe')).toBe('PEPE');
  });
});

/** @jest-environment node */

import { getEnv } from '../env';

describe('getEnv', () => {
  const ORIGINAL_ENV = process.env;
  let warn: jest.SpyInstance;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.AI_ANALYSIS_MODE;
    delete process.env.COINCAP_BASE_URL;
    delete process.env.BINANCE_BASE_URL;
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => warn.mockRestore());

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('AI_ANALYSIS_MODE', () => {
    it.each([
      ['live', 'live'],
      ['mock', 'mock'],
      [' Live ', 'live'],
      ['MOCK', 'mock'],
    ])('normalizes %j to %j', (raw, expected) => {
      process.env.AI_ANALYSIS_MODE = raw;
      expect(getEnv().AI_ANALYSIS_MODE).toBe(expected);
    });

    it.each(['', '   '])('treats blank %j as unset', (raw) => {
      process.env.AI_ANALYSIS_MODE = raw;
      expect(getEnv().AI_ANALYSIS_MODE).toBeUndefined();
    });

    it('fails closed to mock for an unrecognized value instead of throwing', () => {
      process.env.AI_ANALYSIS_MODE = 'off';
      expect(getEnv().AI_ANALYSIS_MODE).toBe('mock');
    });
  });

  describe('base URLs', () => {
    it('keeps a valid URL', () => {
      process.env.COINCAP_BASE_URL = 'https://example.com/v3';
      expect(getEnv().COINCAP_BASE_URL).toBe('https://example.com/v3');
    });

    it.each(['', 'not a url'])('treats %j as unset instead of throwing', (raw) => {
      process.env.COINCAP_BASE_URL = raw;
      process.env.BINANCE_BASE_URL = raw;
      const env = getEnv();
      expect(env.COINCAP_BASE_URL).toBeUndefined();
      expect(env.BINANCE_BASE_URL).toBeUndefined();
    });
  });
});

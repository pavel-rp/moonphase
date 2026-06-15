import {
  resolveAiAnalysisMode,
  isClientOverrideAllowed,
  parseRequestedMode,
  type AiAnalysisEnv,
} from '@/lib/aiAnalysisMode';

describe('parseRequestedMode', () => {
  it('accepts the two valid modes', () => {
    expect(parseRequestedMode('live')).toBe('live');
    expect(parseRequestedMode('mock')).toBe('mock');
  });

  it('rejects anything else', () => {
    expect(parseRequestedMode('LIVE')).toBeUndefined();
    expect(parseRequestedMode('real')).toBeUndefined();
    expect(parseRequestedMode('')).toBeUndefined();
    expect(parseRequestedMode(null)).toBeUndefined();
    expect(parseRequestedMode(undefined)).toBeUndefined();
  });
});

describe('isClientOverrideAllowed', () => {
  it('allows in any non-production environment', () => {
    expect(isClientOverrideAllowed({ VERCEL_ENV: 'preview' })).toBe(true);
    expect(isClientOverrideAllowed({ VERCEL_ENV: 'development' })).toBe(true);
    expect(isClientOverrideAllowed({})).toBe(true);
  });

  it('disallows when an explicit AI_ANALYSIS_MODE kill-switch is set', () => {
    expect(isClientOverrideAllowed({ AI_ANALYSIS_MODE: 'mock', VERCEL_ENV: 'preview' })).toBe(false);
    expect(
      isClientOverrideAllowed({
        AI_ANALYSIS_MODE: 'live',
        AI_ANALYSIS_ALLOW_CLIENT_OVERRIDE: 'true',
      }),
    ).toBe(false);
  });

  it('disallows in production unless explicitly enabled', () => {
    expect(isClientOverrideAllowed({ VERCEL_ENV: 'production' })).toBe(false);
    expect(
      isClientOverrideAllowed({ VERCEL_ENV: 'production', AI_ANALYSIS_ALLOW_CLIENT_OVERRIDE: 'true' }),
    ).toBe(true);
    expect(
      isClientOverrideAllowed({ VERCEL_ENV: 'production', AI_ANALYSIS_ALLOW_CLIENT_OVERRIDE: '1' }),
    ).toBe(true);
    expect(
      isClientOverrideAllowed({ VERCEL_ENV: 'production', AI_ANALYSIS_ALLOW_CLIENT_OVERRIDE: 'false' }),
    ).toBe(false);
  });
});

describe('resolveAiAnalysisMode', () => {
  const withKey: AiAnalysisEnv = { OPENAI_API_KEY: 'sk-test' };

  it('lets an explicit AI_ANALYSIS_MODE win over the env default', () => {
    expect(
      resolveAiAnalysisMode({ ...withKey, AI_ANALYSIS_MODE: 'mock', VERCEL_ENV: 'production' }),
    ).toBe('mock');
    expect(
      resolveAiAnalysisMode({ ...withKey, AI_ANALYSIS_MODE: 'live', VERCEL_ENV: 'preview' }),
    ).toBe('live');
  });

  it('degrades an explicit live with no key to mock', () => {
    expect(resolveAiAnalysisMode({ AI_ANALYSIS_MODE: 'live' })).toBe('mock');
  });

  it('treats an explicit mode as a kill-switch that beats a client override', () => {
    expect(
      resolveAiAnalysisMode({ ...withKey, AI_ANALYSIS_MODE: 'mock', VERCEL_ENV: 'preview' }, 'live'),
    ).toBe('mock');
  });

  it('falls back to mock when no API key is present, regardless of environment', () => {
    expect(resolveAiAnalysisMode({ VERCEL_ENV: 'production' })).toBe('mock');
    expect(resolveAiAnalysisMode({ VERCEL_ENV: 'preview' })).toBe('mock');
  });

  it('defaults by environment: production with key is live, others mock', () => {
    expect(resolveAiAnalysisMode({ ...withKey, VERCEL_ENV: 'production' })).toBe('live');
    expect(resolveAiAnalysisMode({ ...withKey, VERCEL_ENV: 'preview' })).toBe('mock');
    expect(resolveAiAnalysisMode({ ...withKey })).toBe('mock');
  });

  it('honors a permitted client override', () => {
    expect(resolveAiAnalysisMode({ ...withKey, VERCEL_ENV: 'preview' }, 'live')).toBe('live');
    expect(resolveAiAnalysisMode({ ...withKey, VERCEL_ENV: 'development' }, 'mock')).toBe('mock');
  });

  it('ignores a client override in production unless explicitly enabled', () => {
    expect(resolveAiAnalysisMode({ ...withKey, VERCEL_ENV: 'production' }, 'mock')).toBe('live');
    expect(
      resolveAiAnalysisMode(
        { ...withKey, VERCEL_ENV: 'production', AI_ANALYSIS_ALLOW_CLIENT_OVERRIDE: 'true' },
        'mock',
      ),
    ).toBe('mock');
  });

  it('degrades a requested live with no key to mock', () => {
    expect(resolveAiAnalysisMode({ VERCEL_ENV: 'preview' }, 'live')).toBe('mock');
  });
});

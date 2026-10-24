import { z } from 'zod';

const warned = new Set<string>();

function warnOnce(name: string, message: string) {
  if (warned.has(name)) return;
  warned.add(name);
  console.warn(`⚠️  ${name}: ${message}`);
}

// The CoinCap and Binance clients call getEnv() at import time, so a strict
// failure on one optional, feature-scoped value would take down every route.
// These degrade to "unset" (with a warning) instead.
function lenientOptional<T extends z.ZodTypeAny>(name: string, schema: T) {
  return schema.optional().catch(({ input }) => {
    if (input !== '') warnOnce(name, `ignoring invalid value ${JSON.stringify(input)}`);
    return undefined;
  });
}

// Extend as new env vars are required
const EnvSchema = z.object({
  // example: "NEXT_PUBLIC_API_URL": z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  // Vercel sets VERCEL_ENV to distinguish production from preview/development.
  // Unlike NODE_ENV (which is "production" for preview builds too), this is the
  // correct discriminator for the AI-analysis mode default.
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  COINCAP_API_KEY: z.string().optional(),
  COINCAP_BASE_URL: lenientOptional('COINCAP_BASE_URL', z.string().url()),
  BINANCE_API_KEY: z.string().optional(),
  BINANCE_BASE_URL: lenientOptional('BINANCE_BASE_URL', z.string().url()),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  NEWS_API_KEY: z.string().optional(),
  // AI-analysis mode kill-switch: forces the live or mock analysis adapter
  // regardless of environment. Unset/blank → resolved from VERCEL_ENV / key
  // presence. Case-insensitive; any other value (e.g. "off") fails closed to
  // `mock` rather than failing the whole env parse.
  AI_ANALYSIS_MODE: z
    .string()
    .optional()
    .transform((raw): 'live' | 'mock' | undefined => {
      const value = raw?.trim().toLowerCase();
      if (!value) return undefined;
      if (value === 'live' || value === 'mock') return value;
      warnOnce('AI_ANALYSIS_MODE', `unrecognized value ${JSON.stringify(raw)}, forcing mock`);
      return 'mock';
    }),
  // When truthy, permits the gated per-browser `x-ai-analysis-mode` override
  // even in production. In non-prod the override is allowed regardless.
  AI_ANALYSIS_ALLOW_CLIENT_OVERRIDE: z.string().optional(),
  // Request timeout (ms) for the AI analysis model call. String here; the
  // adapter parses and positive-integer-guards it, falling back to
  // AI_LLM_TIMEOUT_MS when unset or invalid.
  AI_ANALYSIS_TIMEOUT_MS: z.string().optional(),
});

type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}
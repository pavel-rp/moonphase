import { z } from 'zod';

// Extend as new env vars are required
const EnvSchema = z.object({
  // example: "NEXT_PUBLIC_API_URL": z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  // Vercel sets VERCEL_ENV to distinguish production from preview/development.
  // Unlike NODE_ENV (which is "production" for preview builds too), this is the
  // correct discriminator for the AI-analysis mode default.
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  COINCAP_API_KEY: z.string().optional(),
  COINCAP_BASE_URL: z.string().url().optional(),
  BINANCE_API_KEY: z.string().optional(),
  BINANCE_BASE_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  NEWS_API_KEY: z.string().optional(),
  // AI-analysis mode kill-switch: forces the live or mock analysis adapter
  // regardless of environment. Unset → resolved from VERCEL_ENV / key presence.
  AI_ANALYSIS_MODE: z.enum(['live', 'mock']).optional(),
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
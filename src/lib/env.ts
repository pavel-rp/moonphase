import { z } from 'zod';

// Extend as new env vars are required
const EnvSchema = z.object({
  // example: "NEXT_PUBLIC_API_URL": z.string().url().optional(),
  COINCAP_API_KEY: z.string().optional(),
  COINCAP_BASE_URL: z.string().url().optional(),
  BINANCE_API_KEY: z.string().optional(),
  BINANCE_BASE_URL: z.string().url().optional(),
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
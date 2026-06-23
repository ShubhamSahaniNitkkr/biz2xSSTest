import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DB_PATH: z.string().default('./data/app.db'),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('8h'),
  LLM_API_URL: z.string().url(),
  LLM_API_TOKEN: z.string().min(1),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  USE_MOCK_LLM: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_UPLOAD_MB: z.coerce.number().default(5),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(overrides?: Record<string, string>): Env {
  if (cached && !overrides) return cached;
  const parsed = envSchema.safeParse({ ...process.env, ...overrides });
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Invalid environment: ${msg}`);
  }
  cached = parsed.data;
  return parsed.data;
}

export function resetEnvCache(): void {
  cached = null;
}

import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    // Optional — Google OAuth is enabled only when both are present.
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    // Optional — OTP email delivery via Resend (falls back to dev log when unset).
    // Must match the key read in lib/email.ts and mapped in runtimeEnv below;
    // a mismatch here silently disables sending, since t3-env only exposes keys
    // declared in this schema.
    RESEND_API_KEY: z.string().optional(),
    FROM_EMAIL: z.string().optional(),
    // Org-scoped signed token from the dashboard's Crawler Logs page. Read by
    // middleware.ts to report AI-crawler visits to the backend. Server-only on
    // purpose: it authorizes writing crawler hits for one organization, so a
    // NEXT_PUBLIC_ name would hand that capability to every browser. Unset =
    // crawler reporting stays dormant.
    SIGNALOR_CRAWLER_INGEST_TOKEN: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    // Existing signalor (Django) backend for org/account/analyzer endpoints.
    NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:8000'),
    // When 'true', the onboarding service returns mocked data instead of calling
    // the backend/OTP — lets the full UI be clicked through without infra.
    NEXT_PUBLIC_USE_STUBS: z.enum(['true', 'false']).default('false'),
    // Analytics — all optional; each tracker stays dormant (or falls back to a
    // built-in default) when its key is unset, and none fire until the user
    // grants consent via the cookie banner.
    NEXT_PUBLIC_AMPLITUDE_API_KEY: z.string().optional(),
    NEXT_PUBLIC_CLARITY_PROJECT_ID: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    SIGNALOR_CRAWLER_INGEST_TOKEN: process.env.SIGNALOR_CRAWLER_INGEST_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_USE_STUBS: process.env.NEXT_PUBLIC_USE_STUBS,
    NEXT_PUBLIC_AMPLITUDE_API_KEY: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
    NEXT_PUBLIC_CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})

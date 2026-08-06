import { betterAuth } from 'better-auth'
import { emailOTP, jwt } from 'better-auth/plugins'
import { Pool } from 'pg'

import { sendOtpEmail } from '@/lib/email'
import { env } from '@/lib/env'

// better-auth talks to Postgres directly via a pg Pool (Kysely under the hood),
// using the same `user`/`session`/`account`/`verification` tables as before —
// no ORM. Reuse one Pool across dev hot-reloads so we don't exhaust connections.
const globalForPool = globalThis as unknown as { authPool: Pool | undefined }
const pool = globalForPool.authPool ?? new Pool({ connectionString: env.DATABASE_URL })
if (env.NODE_ENV !== 'production') globalForPool.authPool = pool

// Better Auth runs its CSRF origin check whenever a request carries cookies
// (i.e. every real browser call) and compares the request Origin against this
// list with an exact string match. A trailing slash or a www/apex difference
// therefore fails as INVALID_ORIGIN. Normalise to the bare origin (scheme +
// host + port, no trailing slash) and trust both the apex and www hosts.
function buildTrustedOrigins(appUrl: string): string[] {
  const { protocol, host } = new URL(appUrl)
  const bareHost = host.replace(/^www\./, '')
  return [`${protocol}//${bareHost}`, `${protocol}//www.${bareHost}`]
}

// Google OAuth is wired only when both credentials are present, so the app
// still boots (and email/password still works) without them configured.
const socialProviders =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : undefined

export const auth = betterAuth({
  database: pool,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  // Allow account self-deletion (immediate, no email step) — the Profile
  // danger zone calls authClient.deleteUser() then the backend hard-delete.
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  socialProviders,
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60, // 10 minutes
      async sendVerificationOTP({ email, otp }) {
        await sendOtpEmail(email, otp)
      },
    }),
    // Issues the short-lived, JWKS-verifiable token the Django backend needs to
    // know *who* is calling. Every account endpoint there is still keyed on a
    // client-supplied `email`, which anyone can spoof; the backend already ships
    // the verifier (core/auth/jwt.py) and an identity seam gated on
    // REQUIRE_VERIFIED_IDENTITY, but it was dormant because nothing ever sent a
    // token. Exposes GET /api/auth/token and GET /api/auth/jwks.
    //
    // Requires the `jwks` table: run `npx @better-auth/cli migrate` (or apply
    // the equivalent SQL) before deploying, or /api/auth/token 500s.
    jwt({
      jwt: {
        // Pinned rather than left to default so the backend can enforce both.
        issuer: env.BETTER_AUTH_URL,
        audience: env.BETTER_AUTH_URL,
        expirationTime: '15m',
        // A JWT is readable by anyone holding it, so it carries only the two
        // claims the backend actually scopes on - not the whole user record.
        definePayload: ({ user }) => ({ id: user.id, email: user.email }),
      },
    }),
  ],
  // Rate limiting protects auth endpoints from brute-force / credential-stuffing.
  // Default storage is in-memory; for multi-instance deployments swap to a
  // distributed store (Redis/Upstash) via `rateLimit.storage = 'secondary-storage'`
  // and pass a `secondaryStorage` adapter at the top level.
  rateLimit: {
    enabled: true,
    window: 60, // seconds
    max: 100, // global default per window per IP
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 5 },
      '/forget-password': { window: 60, max: 3 },
      '/reset-password': { window: 60, max: 5 },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  trustedOrigins: buildTrustedOrigins(env.NEXT_PUBLIC_APP_URL),
})

export type Session = typeof auth.$Infer.Session

import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

/** @type {import('next').NextConfig} */

const projectRoot = dirname(fileURLToPath(import.meta.url))

// Headers applied to every response. Tune CSP for your asset/CDN/auth setup.
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
]

const nextConfig = {
  // Pin the workspace root — a stray lockfile in a parent dir otherwise makes
  // Turbopack infer the wrong root (C:\Users\mrido).
  turbopack: {
    root: projectRoot,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Optimization ON. It was disabled, which meant every next/image served the
    // original file at full size: /auth-illustration.png alone is 4.6 MB of PNG
    // on sign-in, sign-up and onboarding, and that is what put LCP at 4.77s.
    // Vercel now serves AVIF/WebP at the requested width instead.
    //
    // Safe to enable: every external image in the app (Google favicons) uses a
    // plain <img>, not next/image, so nothing needs `remotePatterns`.
    formats: ['image/avif', 'image/webp'],
    // A year: these are content-hashed build assets, so a stale cache is not a
    // risk and it keeps repeat views off the optimizer entirely.
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  // Canonical domain: send all www traffic to the apex so Better Auth (which
  // only trusts https://signalor.ai) sees a matching Origin. Runs before
  // middleware, so auth gating still works on the apex host.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.signalor.ai' }],
        destination: 'https://signalor.ai/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig

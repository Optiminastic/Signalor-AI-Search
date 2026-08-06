export type IntegrationGroup = 'Platforms' | 'Analytics' | 'Automation & alerts'

export interface Integration {
  slug: string
  name: string
  group: IntegrationGroup
  logo: string
  description: string
  /** Brand accent used for the logo tint + hover accent line. */
  accent: string
}

/**
 * A catalog entry plus live connection state from the backend.
 *
 * `connected` deliberately lives here and not on `Integration`: the catalog is a
 * static list, and a hardcoded flag on it can only ever be a guess that drifts
 * from reality (Google Analytics shipped as `connected: true` for everyone).
 */
export type IntegrationWithStatus = Integration & { connected: boolean }

export const INTEGRATION_GROUPS: IntegrationGroup[] = [
  'Platforms',
  'Analytics',
  'Automation & alerts',
]

export const INTEGRATIONS: Integration[] = [
  // ── Platforms ──────────────────────────────────────────────
  {
    slug: 'shopify',
    name: 'Shopify',
    group: 'Platforms',
    logo: '/logos/shopify.svg',
    description: 'Connect your store to auto-fix SEO/GEO issues and inject schema.',
    accent: '#95BF47',
  },
  {
    slug: 'wordpress',
    name: 'WordPress',
    group: 'Platforms',
    logo: '/logos/wordpress.svg',
    description: 'Install the SignalorAI plugin to apply fixes and serve llms.txt.',
    accent: '#21759B',
  },
  {
    slug: 'webflow',
    name: 'Webflow',
    group: 'Platforms',
    logo: '/logos/webflow.svg',
    description: 'Run GEO analysis on your Webflow site — no plugin required.',
    accent: '#146EF5',
  },
  {
    slug: 'framer',
    name: 'Framer',
    group: 'Platforms',
    logo: '/logos/framer.svg',
    description: 'Connect your Framer site via the SignalorAI plugin.',
    accent: '#0055FF',
  },
  // Code repos (Next.js, Astro, any framework) connect once through the dedicated
  // GitHub connector — it powers auto-fix PRs regardless of framework, so it isn't
  // a per-framework catalog entry. See GithubIntegrationCard.
  // ── Analytics ──────────────────────────────────────────────
  {
    slug: 'google-analytics',
    name: 'Google Analytics',
    group: 'Analytics',
    logo: '/logos/google-analytics.svg',
    description: 'Track AI-referral traffic from ChatGPT, Perplexity and more.',
    accent: '#E8710A',
  },
  {
    slug: 'search-console',
    name: 'Search Console',
    group: 'Analytics',
    logo: '/logos/search-console.svg',
    description: 'Monitor indexing, impressions and search performance.',
    accent: '#458CF5',
  },
  // ── Automation & alerts ────────────────────────────────────
  // Slack is NOT a catalog entry. It connects through the dedicated OAuth
  // connector in the Notifications section (SlackIntegrationCard), which owns
  // the workspace link and the channel picker. A catalog card here rendered a
  // second, inert Slack tile on the same page — its switch did nothing, since
  // 'slack' was never in CONNECTABLE — and double-counted in the connected tally.
  {
    slug: 'zapier',
    name: 'Zapier',
    group: 'Automation & alerts',
    logo: '/logos/zapier.svg',
    description: 'Pipe SignalorAI events into 6,000+ apps and workflows.',
    accent: '#FF4A00',
  },
]

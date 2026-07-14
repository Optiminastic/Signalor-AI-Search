import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/features/site/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    '/api/',
    '/sign-in',
    '/sign-up',
    '/dashboard',
    '/dashboard/',
    '/onboarding',
    '/onboarding/',
    '/settings',
    '/settings/',
    '/payments',
    '/payments/',
    '/profile',
    '/profile/',
    '/loading',
    '/studio',
    '/studio/',
    '/creator/sign-in',
    '/creator/sign-up',
    '/creator-dashboard',
    '/creator-dashboard/',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow,
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'Perplexity-User',
          'ClaudeBot',
          'Claude-Web',
          'Claude-User',
          'Claude-SearchBot',
          'anthropic-ai',
          'Google-Extended',
          'Googlebot',
          'Bingbot',
          'DuckDuckBot',
          'Applebot',
          'Applebot-Extended',
          'CCBot',
          'Bytespider',
          'MistralAI-User',
          'Meta-ExternalAgent',
          'Amazonbot',
          'YouBot',
          'cohere-ai',
          'FacebookBot',
          'Diffbot',
        ],
        allow: ['/'],
        disallow,
      },
    ],
    // Note: no `host` directive - `Host:` is non-standard (Yandex-only) and is
    // flagged "Rule ignored by Googlebot" in Search Console. The canonical host
    // is already conveyed via the absolute sitemap URL + per-page canonicals.
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

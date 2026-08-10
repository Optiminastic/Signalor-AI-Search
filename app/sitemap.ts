import type { MetadataRoute } from 'next'
import { groq } from 'next-sanity'

import { SITE_URL } from '@/features/site/lib/seo'
import { client } from '@/features/site/sanity/lib/client'

interface Route {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}

const PUBLIC_ROUTES: Route[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/about-us', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.9 },
  { path: '/ai-visibility', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/recommendations', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/explorer', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/solutions/visibility', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/solutions/competitive-lens', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/solutions/fix-playbook', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/prompt-tracking', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/prompt-tracking/ai-surfaces', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/prompt-tracking/prompt-library', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/integration', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/integration/shopify', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/integration/wordpress', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/tools', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/tools/competitors-analysis', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/tools/domain-rating', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/tools/llms-check', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/tools/schema-validator', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/tools/url-analyzer', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/creators-program', changeFrequency: 'monthly', priority: 0.6 },
  // /creators-program/apply is auth-gated (guests are redirected to /creator/sign-up),
  // so it's intentionally not indexed - kept out of the sitemap.
  { path: '/site-map', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
]

const BLOG_POSTS_FOR_SITEMAP = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    "slug": slug.current,
    "lastModified": coalesce(_updatedAt, publishedAt)
  }
`

interface BlogPostEntry {
  slug: string
  lastModified: string
}

export const revalidate = 3600

/**
 * Validates and normalizes a date to ensure it's not in the future.
 * This handles server clock issues or incorrect dates from CMS.
 * @param date - The date to validate
 * @param fallback - Fallback date if validation fails
 * @returns A valid date that is not in the future
 */
function getValidLastModified(date: Date, fallback: Date): Date {
  const now = Date.now()
  const timestamp = date.getTime()
  
  // If date is in the future or invalid, use fallback
  if (isNaN(timestamp) || timestamp > now) {
    return fallback
  }
  
  return date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use a known valid date as fallback (project launch or a reasonable past date)
  // This ensures we never show future dates even if server clock is wrong
  const fallbackDate = new Date('2024-01-01T00:00:00.000Z')
  const now = new Date()
  
  // Validate that 'now' is reasonable (not in the far future)
  // If current year is beyond 2025, cap it to prevent future dates
  const safeNow = now.getFullYear() > 2025 ? fallbackDate : now

  const posts = await client
    .fetch<BlogPostEntry[]>(BLOG_POSTS_FOR_SITEMAP)
    .catch(() => [] as BlogPostEntry[])

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: safeNow,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const postEntries: MetadataRoute.Sitemap = posts.map(p => {
    const postDate = p.lastModified ? new Date(p.lastModified) : safeNow
    return {
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: getValidLastModified(postDate, fallbackDate),
      changeFrequency: 'monthly',
      priority: 0.6,
    }
  })

  return [...staticEntries, ...postEntries]
}

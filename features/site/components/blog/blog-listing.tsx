'use client'

import { useMemo, useState } from 'react'

import { BlogPostCard } from '@/features/site/components/blog/blog-post-card'
import { FeaturedBlogCard } from '@/features/site/components/blog/featured-blog-card'
import { GridCornerHandles } from '@/features/site/components/landing/home-grid'
import { HomeFaq } from '@/features/site/components/landing/home-faq'
import {
  BLOG_CATEGORIES,
  BLOG_FAQ,
  type BlogCategory,
} from '@/features/site/lib/landing-blog-content'
import { cn } from '@/features/site/lib/utils'
import type { SanityBlogPost } from '@/features/site/sanity/lib/queries'

const ALL_FILTER = 'All' as const
type Filter = typeof ALL_FILTER | BlogCategory

const FILTERS: Filter[] = [ALL_FILTER, ...BLOG_CATEGORIES]
const FEATURED_COUNT = 2

interface BlogListingProps {
  posts: SanityBlogPost[]
}

export function BlogListing({ posts }: BlogListingProps): React.ReactElement {
  const [active, setActive] = useState<Filter>(ALL_FILTER)

  const filtered = useMemo(
    () => (active === ALL_FILTER ? posts : posts.filter(p => p.category === active)),
    [posts, active],
  )

  const featured = filtered.slice(0, FEATURED_COUNT)
  const rest = filtered.slice(FEATURED_COUNT)

  return (
    <section className="@container">
      {/* Hairline-grid frame — 1px vertical rails run the full height of the
          page, with square handles marking every rail/rule intersection. */}
      <div className="border-border relative mx-auto max-w-5xl border-x">
        <GridCornerHandles top bottom />

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="px-6 pt-16 pb-10 md:pt-24">
          <div className="max-w-md">
            <span className="text-muted-foreground">Blog</span>
            <h1 className="text-muted-foreground mt-4 text-4xl font-semibold text-balance">
              News, insights and more from{' '}
              <strong className="text-foreground font-semibold">SignalorAI</strong>
            </h1>
          </div>

          {/* ─── Category filters ──────────────────────────────────────── */}
          <div className="mt-12 -ml-0.5 flex justify-between gap-4 max-md:-mx-6 md:mt-16">
            <div className="-ml-0.5 flex snap-x snap-mandatory overflow-x-auto py-3 max-md:px-6">
              {FILTERS.map(filter => {
                const isActive = filter === active
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActive(filter)}
                    aria-pressed={isActive}
                    className="text-muted-foreground group snap-center px-1"
                  >
                    <span
                      className={cn(
                        'flex w-fit items-center gap-2 rounded-md px-3 py-1 text-sm transition-colors',
                        isActive
                          ? 'bg-card ring-border text-primary-ink font-medium shadow-sm ring-1 shadow-black/6.5'
                          : 'hover:text-foreground group-hover:bg-foreground/5',
                      )}
                    >
                      <span className="capitalize">{filter}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="border-border relative border-t px-6 py-20 text-center">
            <GridCornerHandles top />
            <p className="text-foreground text-xl font-semibold">No posts yet</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Check back soon, posts will appear here once published.
            </p>
          </div>
        ) : (
          <>
            {/* ─── Featured ──────────────────────────────────────────── */}
            {featured.length > 0 && (
              <div className="border-border relative border-t px-6 py-12 md:py-16">
                <GridCornerHandles top />
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:gap-12">
                  {featured.map(post => (
                    <FeaturedBlogCard key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── More articles ─────────────────────────────────────── */}
            {rest.length > 0 && (
              <div className="border-border relative border-t px-6 py-12 md:py-16">
                <GridCornerHandles top />
                <div className="space-y-8">
                  <h2 className="text-foreground text-2xl font-semibold">More Articles</h2>
                  <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
                    {rest.map(post => (
                      <BlogPostCard key={post.slug} post={post} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── FAQ (shared landing design) ───────────────────────────── */}
        <HomeFaq items={BLOG_FAQ} />
      </div>
    </section>
  )
}

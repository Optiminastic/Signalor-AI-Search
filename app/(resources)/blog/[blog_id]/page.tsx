import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import { ArrowLeft, ArrowRight, Clock } from '@/features/site/components/icons'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import { ScreenHR } from '@/features/site/components/ui/intersection-diamonds'
import type { BlogPost } from '@/features/site/lib/landing-blog-content'
import { buildMetadata, breadcrumbJsonLd, articleJsonLd, SITE_URL } from '@/features/site/lib/seo'
import { cn } from '@/features/site/lib/utils'
import { client } from '@/features/site/sanity/lib/client'
import {
  POST_BY_SLUG_QUERY,
  ALL_POST_SLUGS_QUERY,
  ALL_POSTS_NAV_QUERY,
  type SanityBlogPost,
  type AdjacentPost,
} from '@/features/site/sanity/lib/queries'

export const revalidate = 60

// ─── Static params (pre-render known slugs) ───────────────────────────────────

export async function generateStaticParams() {
  const slugs = await client
    .fetch<Array<{ slug: string }>>(ALL_POST_SLUGS_QUERY)
    .catch(() => [] as Array<{ slug: string }>)
  return slugs.map(({ slug }) => ({ blog_id: slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ blog_id: string }>
}): Promise<Metadata> {
  const { blog_id } = await params
  const post = await client
    .fetch<SanityBlogPost | null>(POST_BY_SLUG_QUERY, { slug: blog_id })
    .catch(() => null)

  if (!post) {
    return buildMetadata({ title: 'Post Not Found', path: '/blog', noindex: true })
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    ogType: 'article',
  })
}

// ─── Category colours (mirrors blog listing page) ────────────────────────────

const CATEGORY_TONE: Record<BlogPost['category'], { bg: string; fg: string }> = {
  Playbooks: { bg: 'bg-warning/10', fg: 'text-warning' },
  'AI visibility': { bg: 'bg-info/10', fg: 'text-info' },
  Product: { bg: 'bg-primary/10', fg: 'text-primary-ink' },
  Research: { bg: 'bg-[var(--feature-violet-tint)]', fg: 'text-[var(--feature-violet)]' },
  Guides: { bg: 'bg-success/10', fg: 'text-success' },
}

function formatDate(iso: string) {
  const normalized = iso.length === 10 ? iso + 'T00:00:00' : iso
  return new Date(normalized).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Portable Text renderer ───────────────────────────────────────────────────
// Handles: normal, h1–h4, blockquote, bullet lists, strong, em, link, image

type PTSpan = {
  _type: 'span'
  _key?: string
  text: string
  marks?: string[]
}

type PTMarkDef = {
  _key: string
  _type: string
  href?: string
}

type PTBlock = {
  _type: 'block'
  _key?: string
  style?: string
  listItem?: string
  level?: number
  children?: PTSpan[]
  markDefs?: PTMarkDef[]
}

type PTImage = {
  _type: 'image'
  _key?: string
  asset?: { _ref?: string; url?: string }
  alt?: string
}

type PTValue = PTBlock | PTImage

function renderSpan(span: PTSpan, markDefs: PTMarkDef[], key: string | number): React.ReactNode {
  const marks = span.marks ?? []
  let node: React.ReactNode = span.text

  for (const mark of marks) {
    if (mark === 'strong') {
      node = <strong key={key}>{node}</strong>
    } else if (mark === 'em') {
      node = <em key={key}>{node}</em>
    } else {
      const def = markDefs.find(d => d._key === mark)
      if (def?._type === 'link' && def.href) {
        node = (
          <a
            key={key}
            href={def.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-warning font-medium underline underline-offset-2 hover:brightness-110"
          >
            {node}
          </a>
        )
      }
    }
  }

  return node
}

function slugifyHeading(block: PTBlock): string | undefined {
  const text = (block.children ?? [])
    .map(c => c.text ?? '')
    .join(' ')
    .trim()
  if (!text) return undefined
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function renderBlock(block: PTBlock, idx: number): React.ReactNode {
  const markDefs = block.markDefs ?? []
  const children = (block.children ?? []).map((span, i) =>
    renderSpan(span, markDefs, `${idx}-${i}`),
  )

  if (block.listItem === 'bullet') {
    return (
      <li
        key={block._key ?? idx}
        className="text-foreground/80 ml-5 list-disc text-sm leading-relaxed"
      >
        {children}
      </li>
    )
  }

  const headingId = slugifyHeading(block)

  switch (block.style) {
    case 'h1':
      return (
        <h1
          key={block._key ?? idx}
          id={headingId}
          className="text-foreground mt-10 mb-4 scroll-mt-24 text-3xl font-bold tracking-tight"
        >
          {children}
        </h1>
      )
    case 'h2':
      return (
        <h2
          key={block._key ?? idx}
          id={headingId}
          className="text-foreground mt-8 mb-3 scroll-mt-24 text-2xl font-bold tracking-tight"
        >
          {children}
        </h2>
      )
    case 'h3':
      return (
        <h3
          key={block._key ?? idx}
          id={headingId}
          className="text-foreground mt-6 mb-2.5 scroll-mt-24 text-xl font-semibold tracking-tight"
        >
          {children}
        </h3>
      )
    case 'h4':
      return (
        <h4
          key={block._key ?? idx}
          id={headingId}
          className="text-foreground mt-5 mb-2 scroll-mt-24 text-lg font-semibold"
        >
          {children}
        </h4>
      )
    case 'blockquote':
      return (
        <blockquote
          key={block._key ?? idx}
          className="border-warning/40 text-foreground/70 my-6 border-l-4 pl-5 text-sm leading-relaxed italic"
        >
          {children}
        </blockquote>
      )
    default:
      return (
        <p key={block._key ?? idx} className="text-foreground/80 my-4 text-sm leading-relaxed">
          {children}
        </p>
      )
  }
}

function PortableTextContent({ value }: { value: PTValue[] }) {
  const nodes: React.ReactNode[] = []
  let listBuffer: PTBlock[] = []

  function flushList() {
    if (listBuffer.length === 0) return
    nodes.push(
      <ul key={`list-${nodes.length}`} className="my-4 space-y-1">
        {listBuffer.map((b, i) => renderBlock(b, i))}
      </ul>,
    )
    listBuffer = []
  }

  for (let i = 0; i < value.length; i++) {
    const block = value[i]

    if (block._type === 'block') {
      const b = block as PTBlock
      if (b.listItem === 'bullet') {
        listBuffer.push(b)
        continue
      }
      flushList()
      nodes.push(renderBlock(b, i))
    } else if (block._type === 'image') {
      flushList()
      const img = block as PTImage
      const src = img.asset?.url
      if (src) {
        nodes.push(
          <figure key={img._key ?? i} className="my-8">
            {}
            <img
              src={src}
              alt={img.alt ?? ''}
              className="w-full rounded-none border border-black/6 object-cover shadow-sm"
            />
            {img.alt && (
              <figcaption className="text-muted-foreground mt-2 text-center text-[11px]">
                {img.alt}
              </figcaption>
            )}
          </figure>,
        )
      }
    }
  }

  flushList()
  return <>{nodes}</>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: { params: Promise<{ blog_id: string }> }) {
  const { blog_id } = await params
  const post = await client
    .fetch<SanityBlogPost | null>(POST_BY_SLUG_QUERY, { slug: blog_id })
    .catch(() => null)

  if (!post) notFound()

  const allNavPosts = await client
    .fetch<AdjacentPost[]>(ALL_POSTS_NAV_QUERY)
    .catch(() => [] as AdjacentPost[])

  const currentIdx = allNavPosts.findIndex(p => p.slug === post.slug)
  // allNavPosts is ordered newest→oldest, so idx-1 is newer (next), idx+1 is older (prev)
  const nextPost: AdjacentPost | null = currentIdx > 0 ? allNavPosts[currentIdx - 1] : null
  const prevPost: AdjacentPost | null =
    currentIdx !== -1 && currentIdx < allNavPosts.length - 1 ? allNavPosts[currentIdx + 1] : null

  const tone = CATEGORY_TONE[post.category as BlogPost['category']] ?? {
    bg: 'bg-muted',
    fg: 'text-foreground',
  }

  const articleLd = articleJsonLd({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    datePublished: post.publishedAt,
  })

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ])

  return (
    <MarketingShell>
      <JsonLd id="ld-article" data={articleLd} />
      <JsonLd id="ld-article-breadcrumb" data={breadcrumbLd} />

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section className="bg-background relative px-6 pt-14 pb-12 lg:px-12 lg:pt-16 lg:pb-14">
        <div className="relative z-10 mx-auto max-w-7xl">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[11px] font-medium transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Blog
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                tone.bg,
                tone.fg,
              )}
            >
              {post.category}
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
              <Clock className="h-3 w-3" />
              {post.readingMinutes} min read
            </span>
            <span className="text-muted-foreground text-[11px]">
              · {formatDate(post.publishedAt)}
            </span>
          </div>

          <h1 className="text-foreground mt-5 text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-[2.4rem]">
            {post.title}
          </h1>

          <p className="text-accent-foreground mt-4 text-base leading-relaxed font-light lg:text-base">
            {post.excerpt}
          </p>
        </div>
      </section>

      <ScreenHR />

      {/* ─── Body ───────────────────────────────────────────────────── */}
      <section className="bg-background px-6 py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-7xl">
          {post.coverImage?.url && (
            <figure className="mb-10">
              {}
              <img
                src={post.coverImage.url}
                alt={post.coverImage.alt ?? post.title}
                className="w-full rounded-none border border-black/6 object-cover shadow-sm"
                style={{ maxHeight: '480px' }}
              />
            </figure>
          )}
          {post.body && post.body.length > 0 ? (
            <PortableTextContent value={post.body as PTValue[]} />
          ) : (
            <p className="text-muted-foreground text-sm italic">
              Full article content coming soon.
            </p>
          )}
        </div>
      </section>

      <ScreenHR />

      {/* ─── Post navigation ────────────────────────────────────────── */}
      <section className="bg-background px-6 pb-14 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Previous (older) */}
            <div className="flex justify-start">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-none border border-black/10 bg-white px-4 py-2 text-xs font-semibold shadow-sm transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
                  Previous blog
                </Link>
              ) : null}
            </div>

            <div />

            {/* Next (newer) */}
            <div className="flex justify-end">
              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-none border border-black/10 bg-white px-4 py-2 text-xs font-semibold shadow-sm transition"
                >
                  Next blog
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}

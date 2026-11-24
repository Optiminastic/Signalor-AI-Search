'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { groq } from 'next-sanity'
import {
  ArrowRight,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Youtube,
  CirclePlus,
  Sparkles,
} from '@/features/site/components/icons'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import LogoComp from '@/features/site/components/LogoComp'
import { MailLink, parseMailto } from '@/features/site/components/mail-link'
import { Button } from '@/features/site/components/ui/button'
import { cn } from '@/features/site/lib/utils'
import { CornerDiamonds } from '@/features/site/components/ui/intersection-diamonds'
import { client } from '@/features/site/sanity/lib/client'

type FooterLink = {
  href: string
  label: string
  external?: boolean
}

type FooterColumn = {
  title: string
  links: FooterLink[]
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Platform',
    links: [
      { href: '/sign-up', label: 'Get started' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/integration', label: 'Integrations' },
      { href: '/prompt-tracking', label: 'Prompt tracking' },
      { href: '/ai-visibility', label: 'AI visibility' },
      { href: '/recommendations', label: 'Recommendations' },
      { href: '/creators-program', label: 'Creators program' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { href: '/solutions/competitive-lens', label: 'Agencies' },
      { href: '/solutions/visibility', label: 'Brands' },
      { href: '/solutions/fix-playbook', label: 'SEO & growth teams' },
      { href: 'mailto:hello@signalor.ai', label: 'Contact sales', external: true },
    ],
  },
  {
    title: 'Free tools',
    links: [
      { href: '/tools', label: 'All free tools' },
      { href: '/tools/url-analyzer', label: 'URL analyzer' },
      { href: '/tools/llms-check', label: 'LLM checker' },
      { href: '/tools/competitors-analysis', label: 'Competitors analysis' },
      { href: '/tools/schema-validator', label: 'Schema validator' },
      { href: '/tools/domain-rating', label: 'Domain rating' },
    ],
  },
  {
    title: 'Blog & resources',
    links: [{ href: '/blog', label: 'Blog' }],
  },
]

const SOCIAL = [
  { href: 'https://x.com/SignalorAI', label: 'X (Twitter)', icon: Twitter },
  { href: 'https://www.linkedin.com/in/signalorai/', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://github.com/signalorai', label: 'Github', icon: Github },
] as const

const RECENT_POSTS_QUERY = groq`*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...3] {
  "slug": slug.current,
  title
}`

interface RecentPost {
  slug: string
  title: string
}

function truncateTitle(title: string, max = 34): string {
  if (title.length <= max) return title
  return title.slice(0, max).trimEnd() + '…'
}

function RecentBlogLinks() {
  const [posts, setPosts] = useState<RecentPost[]>([])

  useEffect(() => {
    client
      .fetch<RecentPost[]>(RECENT_POSTS_QUERY)
      .then(setPosts)
      .catch(() => {})
  }, [])

  return (
    <>
      {posts.map(post => (
        <li key={post.slug}>
          <FooterLinkRow href={`/blog/${post.slug}`} label={truncateTitle(post.title)} />
        </li>
      ))}
    </>
  )
}

function FooterLinkRow({ href, label, external }: FooterLink) {
  const className = cn(
    'inline-flex items-center gap-1 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground',
  )
  if (href.startsWith('mailto:')) {
    return (
      <MailLink {...parseMailto(href)} className={className} target="_blank" rel="noreferrer">
        {label}
        {external && <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />}
      </MailLink>
    )
  }
  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {label}
        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}

export function LandingFooter() {
  return (
    <footer className="relative border-t border-black/6 bg-white p-1">
      <CornerDiamonds top />
      <div className="relative overflow-hidden border-b border-black/6 bg-linear-to-br from-[#eff6ff] via-white to-[#fafafa]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, #e04a3d, #f4748f, #f3a6ce, #efd6f2, #ffffff)',
            // backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-2">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
            <div className="min-w-0">
              <p className="text-primary-ink/90 text-[11px] font-semibold tracking-[0.22em] uppercase">
                Get started
              </p>
              <h2 className="text-foreground mt-3 font-sans text-3xl leading-[1.12] font-bold tracking-tight sm:text-4xl lg:text-[2.35rem] xl:text-5xl">
                Turn{' '}
                <Sparkles
                  className="text-primary-ink inline-block h-[0.85em] w-[0.85em] shrink-0 align-middle"
                  strokeWidth={2.25}
                  aria-hidden
                />{' '}
                search into your{' '}
                <span className="text-primary-ink whitespace-nowrap">highest-intent pipeline</span>
              </h2>
              <p className="text-muted-foreground mt-4 max-w-lg text-sm leading-relaxed sm:text-base">
                Run a free GEO audit, track citations across models, and ship fixes that move how
                ChatGPT, Perplexity, and Gemini talk about you.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild className={`${LANDING_PRIMARY_CTA_CLASS} h-10 px-5`}>
                  <Link href="/sign-up">
                    Get started
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative min-w-0 lg:pl-2">
              <div className="relative rounded-none border border-black/8 bg-white/90 p-2 shadow-xl backdrop-blur-[2px] sm:p-3">
                <Image
                  src="/carousel1.png"
                  alt="SignalorAI dashboard showing AI visibility and GEO scores"
                  width={2000}
                  height={2000}
                  unoptimized
                  className="h-auto w-full rounded-none object-contain select-none"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-black/8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row">
            <div className="min-w-0 border-b border-black/8 bg-white px-6 py-10 sm:px-8 sm:py-12 lg:w-[min(100%,380px)] lg:max-w-md lg:shrink-0 lg:border-r lg:border-b-0 lg:border-black/8 lg:px-10 lg:py-14">
              <Link href="/" className="inline-block">
                <LogoComp compact size={32} />
              </Link>
              <p className="text-muted-foreground mt-5 max-w-xs text-sm leading-relaxed font-normal">
                The AI visibility platform to monitor, score, and grow how generative search cites
                your brand.{' '}
                <MailLink
                  user="hello"
                  subject="Careers"
                  className="hover:text-foreground text-primary-ink inline-flex align-middle text-sm font-medium transition-colors"
                >
                  <CirclePlus width={16} height={16} />
                </MailLink>
              </p>
              <ul className="mt-6 flex flex-wrap items-center gap-2">
                {SOCIAL.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="bg-muted text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md border border-black/8 transition-colors hover:border-black/15 hover:bg-white"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-muted min-w-0 flex-1">
              <div className="grid grid-cols-1 divide-y divide-black/8 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
                {FOOTER_COLUMNS.map(col => (
                  <div
                    key={col.title}
                    className="min-w-0 px-6 py-10 sm:px-8 sm:py-12 lg:px-8 lg:py-14"
                  >
                    <p className="text-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
                      {col.title}
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {col.links.map(item => (
                        <li key={item.label}>
                          <FooterLinkRow {...item} />
                        </li>
                      ))}
                      {col.title === 'Blog & resources' && <RecentBlogLinks />}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-muted border-t border-black/8 px-6 py-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <nav
                aria-label="Legal"
                className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium"
              >
                <Link href="/policy" className="hover:text-foreground transition-colors">
                  Privacy policy
                </Link>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of service
                </Link>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <MailLink user="hello" className="hover:text-foreground transition-colors">
                  Contact us
                </MailLink>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <Link href="/about-us" className="hover:text-foreground transition-colors">
                  About
                </Link>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <MailLink
                  user="hello"
                  subject="Press inquiry"
                  className="hover:text-foreground transition-colors"
                >
                  Press
                </MailLink>
              </nav>

              <div className="flex flex-col items-start gap-2 lg:items-end">
                <a
                  href="https://status.signalor.ai/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-1.5 text-[11px] font-medium shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-colors hover:border-black/15"
                >
                  <span className="bg-success h-2 w-2 shrink-0 rounded-full" aria-hidden />
                  All systems online
                </a>
                <p className="text-muted-foreground text-[11px] leading-snug">
                  © {new Date().getFullYear()} SignalorAI. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

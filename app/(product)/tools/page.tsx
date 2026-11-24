import Link from 'next/link'
import type { ComponentType } from 'react'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import { BlogCardFrame } from '@/features/site/components/blog/blog-card-frame'
import {
  ArrowRight,
  Globe,
  MessageSquare,
  BarChart3,
  ListChecks,
  Radar,
} from '@/features/site/components/icons'
import { HomeFaq } from '@/features/site/components/landing/home-faq'
import { GridCornerHandles, MeasureBox } from '@/features/site/components/landing/home-grid'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import { ToolsHeroFloaters } from '@/features/site/components/tools/tools-hero-floaters'
import { buildMetadata, faqJsonLd } from '@/features/site/lib/seo'
import { TOOLS_FAQ } from '@/features/site/lib/tools-content'

export const metadata = buildMetadata({
  title: 'Free GEO & AI Visibility Tools',
  description:
    'Free, no-signup tools to check your AI search visibility: GEO score, llms.txt readiness, schema validation, competitor citation share, and domain rating. Built on the SignalorAI engine.',
  path: '/tools',
  keywords: [
    'free GEO tools',
    'AI visibility tools',
    'free SEO AI tools',
    'GEO score checker',
    'llms.txt checker',
    'schema validator',
    'competitor analysis tool',
    'domain rating checker',
    'AI citation tools',
    'generative engine optimization tools',
  ],
})

type Tool = {
  href: string
  title: string
  desc: string
  icon: ComponentType<{ className?: string }>
}

const TOOLS: Tool[] = [
  {
    href: '/tools/url-analyzer',
    title: 'URL analyzer',
    desc: 'Paste any URL for an instant GEO & AI visibility score, schema audit, and top fixes.',
    icon: Globe,
  },
  {
    href: '/tools/llms-check',
    title: 'llms.txt checker',
    desc: 'Check your llms.txt and LLM readiness — AI-bot access, schema, and metadata — in seconds.',
    icon: MessageSquare,
  },
  {
    href: '/tools/competitors-analysis',
    title: 'Competitor analysis',
    desc: 'Compare your AI citation share against rivals across ChatGPT, Gemini, and Perplexity.',
    icon: BarChart3,
  },
  {
    href: '/tools/schema-validator',
    title: 'Schema validator',
    desc: 'Validate your JSON-LD and schema.org coverage for AI engines and rich results.',
    icon: ListChecks,
  },
  {
    href: '/tools/domain-rating',
    title: 'Domain rating',
    desc: "Check any domain's authority score (DR) on a 0–100 scale, sourced from Ahrefs.",
    icon: Radar,
  },
]

export default function ToolsIndexPage() {
  return (
    <MarketingShell>
      <JsonLd id="ld-tools-faq" data={faqJsonLd(TOOLS_FAQ)} />
      <div className="border-border relative mx-auto max-w-6xl border-x">
        <GridCornerHandles top bottom />

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-6 pt-14 pb-16 md:pt-20 md:pb-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_65%_at_50%_0%,rgba(224,74,61,0.05),transparent_70%)]"
          />
          <ToolsHeroFloaters />
          <div className="relative mx-auto max-w-3xl text-center">
            <MeasureBox className="mx-auto w-fit">
              <div className="bg-card ring-border relative flex items-center gap-2 rounded-full px-3 py-1 shadow-sm ring-1 shadow-black/5">
                <span className="bg-primary h-1.5 w-1.5 rounded-full" aria-hidden />
                <span className="text-foreground text-sm">
                  {TOOLS.length} free tools · no sign-up required
                </span>
              </div>
            </MeasureBox>
            <h1 className="text-foreground mt-8 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Free GEO &amp; AI-visibility{' '}
              <span className="decoration-primary/60 underline decoration-dashed decoration-2 underline-offset-[6px]">
                tools
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-balance">
              Run instant, no-signup checks on any domain — GEO score, llms.txt readiness, schema
              coverage, competitor citation share, and domain authority. Each one runs on the same
              engine that powers SignalorAI.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tools/url-analyzer"
                className="bg-primary-strong inline-flex h-11 items-center gap-2 rounded-md px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                Analyze your site free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="ring-border bg-card text-foreground hover:bg-muted/50 inline-flex h-11 items-center gap-2 rounded-md px-5 text-sm font-medium shadow-sm ring-1 transition"
              >
                Compare plans
              </Link>
            </div>
          </div>
        </section>

        {/* ── Tools grid: rounded, bordered, shadowed cards ───────────────── */}
        <section
          className="border-border relative border-t px-6 py-14 lg:px-12 lg:py-16"
          aria-labelledby="tools-heading"
        >
          <GridCornerHandles top />
          <h2 id="tools-heading" className="sr-only">
            All free tools
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
            {TOOLS.map(tool => (
              <Link key={tool.href} href={tool.href} className="group flex flex-col">
                <BlogCardFrame seed={tool.href}>
                  <span className="ring-foreground/10 grid h-14 w-14 place-items-center rounded-xl bg-white shadow-md ring-1">
                    <tool.icon className="text-primary-ink h-6 w-6" />
                  </span>
                </BlogCardFrame>
                <h3 className="text-foreground group-hover:text-primary-ink mt-5 text-lg font-bold tracking-tight transition-colors">
                  {tool.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{tool.desc}</p>
                <span className="text-primary-ink mt-4 inline-flex items-center gap-1 text-sm font-medium transition group-hover:gap-1.5">
                  Open tool
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FAQ (shared landing design) ─────────────────────────────────── */}
        <HomeFaq items={TOOLS_FAQ} />
      </div>
    </MarketingShell>
  )
}

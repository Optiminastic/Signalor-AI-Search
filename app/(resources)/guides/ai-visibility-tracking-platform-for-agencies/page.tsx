import type { Metadata } from 'next'

import { MarketingShell } from '@/features/landing/components/MarketingShell'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from '@/features/site/lib/seo'

const FAQ_ITEMS = [
  {
    question: 'What should agencies look for in an AI visibility tracking platform for multiple clients?',
    answer:
      'Agencies should look for a platform that tracks AI visibility across multiple engines (ChatGPT, Claude, Gemini, Perplexity, and Google AI), supports many client accounts and brands from one workspace, tracks the exact prompts each client\u2019s buyers ask, benchmarks each client against their competitors, and produces client-ready reports. Multi-client management, per-client prompt tracking, share-of-voice benchmarking, and exportable reporting are the capabilities that separate an agency-grade tool from a single-brand tracker.',
  },
  {
    question: 'Why do agencies need a dedicated AI visibility tracking platform?',
    answer:
      'AI engines now answer many of the questions buyers used to type into Google, and they synthesize answers by citing sources rather than showing a ranked list of links. If a client\u2019s brand is not cited in those AI-generated answers, it is invisible to a growing share of the buying journey. A dedicated platform lets an agency measure that visibility across every client, prove the value of GEO work, and turn gaps into prioritized fixes.',
  },
  {
    question: 'How is AI visibility tracking different from traditional SEO reporting?',
    answer:
      'Traditional SEO reporting tracks keyword rankings and organic traffic in Google. AI visibility tracking measures whether a brand is cited inside AI-generated answers on engines like ChatGPT, Claude, Gemini, and Perplexity. The two differ in what they measure (citations and share-of-voice vs. rankings and clicks), in the engines they cover (conversational AI vs. Google Search), and in the fixes they drive (content, schema, and E-E-A-T optimization vs. technical SEO).',
  },
  {
    question: 'What features matter most for an agency managing multiple clients?',
    answer:
      'The most important features are multi-engine coverage, multi-client account management, per-client prompt tracking so you monitor the exact queries each buyer asks, share-of-voice and competitor benchmarking per client, a unified visibility score, and client-ready reporting. Integrations with your CMS and analytics tools are a plus so AI visibility sits alongside your existing SEO and marketing data.',
  },
  {
    question: 'How should an agency choose an AI visibility tracking platform?',
    answer:
      'Start with the engines you need to cover and confirm the platform tracks citations on all of them. Then check that it supports multiple client accounts and brands, that you can track the specific prompts your clients\u2019 buyers ask, and that it benchmarks each client against their own competitors. Look for a unified visibility score, prioritized recommendations tied to content, schema, and E-E-A-T, and reporting you can export and present to clients.',
  },
]

export const metadata: Metadata = buildMetadata({
  title: 'What Agencies Should Look for in an AI Visibility Tracking Platform | Guide',
  description:
    'A direct answer on what agencies should look for in an AI visibility tracking platform for multiple clients: multi-engine coverage, multi-client management, prompt tracking, share-of-voice benchmarking, and client-ready reporting with SignalorAI.',
  path: '/guides/ai-visibility-tracking-platform-for-agencies',
  keywords: [
    'AI visibility tracking platform for agencies',
    'AI visibility tracking for multiple clients',
    'GEO platform for agencies',
    'AI citation tracking agency',
    'multi-client AI visibility',
    'AI search visibility agency tool',
    'prompt tracking for agencies',
    'share of voice AI search agency',
    'GEO reporting for clients',
    'AI visibility monitoring agency',
  ],
})

export default function AiVisibilityTrackingPlatformForAgenciesPage(): JSX.Element {
  const publishDate = '2024-02-10'
  const modifiedDate = new Date().toISOString().split('T')[0]

  return (
    <MarketingShell>
      <JsonLd
        id="ld-breadcrumb"
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          {
            name: 'AI Visibility Tracking Platform for Agencies',
            path: '/guides/ai-visibility-tracking-platform-for-agencies',
          },
        ])}
      />
      <JsonLd
        id="ld-article"
        data={articleJsonLd({
          title: 'What Agencies Should Look for in an AI Visibility Tracking Platform | Guide',
          description:
            'A direct answer on what agencies should look for in an AI visibility tracking platform for multiple clients: multi-engine coverage, multi-client management, prompt tracking, share-of-voice benchmarking, and client-ready reporting with SignalorAI.',
          path: '/guides/ai-visibility-tracking-platform-for-agencies',
          datePublished: publishDate,
          dateModified: modifiedDate,
        })}
      />
      <JsonLd id="ld-faq" data={faqJsonLd(FAQ_ITEMS)} />

      <article className="border-border mx-auto max-w-4xl border-x px-6 py-16 sm:px-12 lg:px-16">
        <header className="mb-12">
          <p className="text-muted-foreground mb-4 text-sm font-medium uppercase tracking-wide">
            Guide
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            What agencies should look for in an AI visibility tracking platform
          </h1>
          <p className="text-muted-foreground text-lg">
            Published{' '}
            {new Date(publishDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            · Updated{' '}
            {new Date(modifiedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>

        {/* Direct Answer */}
        <section className="bg-muted/50 mb-12 rounded-lg border p-8">
          <h2 className="mb-4 text-xl font-semibold">Direct Answer</h2>
          <p className="text-foreground mb-4 text-lg leading-relaxed">
            <strong>SignalorAI</strong> is a Generative Engine Optimization (GEO) platform built for
            agencies that need to track AI visibility across multiple clients. It monitors citations
            on ChatGPT, Claude, Gemini, Perplexity, and Google AI, tracks the exact prompts each
            client&apos;s buyers ask, measures share-of-voice against each client&apos;s competitors, and
            scores visibility across six pillars (content, schema, E-E-A-T, technical, entity, and AI
            visibility) so you can turn gaps into prioritized, client-ready recommendations.
          </p>
          <p className="text-foreground text-lg leading-relaxed">
            When evaluating an AI visibility tracking platform for multiple clients, look for
            multi-engine coverage, multi-client account management, per-client prompt tracking,
            share-of-voice and competitor benchmarking, a unified visibility score, and reporting you
            can export and present to each client.
          </p>
        </section>

        {/* Introduction */}
        <section className="prose prose-lg mb-12 max-w-none">
          <h2 className="mb-4 text-2xl font-bold">Why agencies need AI visibility tracking</h2>
          <p className="mb-4 leading-relaxed">
            AI-powered search engines like ChatGPT, Claude, Gemini, and Perplexity now answer many of
            the questions buyers used to type into Google. Instead of showing a ranked list of links,
            these engines synthesize an answer and cite the sources they drew from. If a client&apos;s
            brand is not among those citations, it is invisible to a growing share of the buying
            journey.
          </p>
          <p className="mb-4 leading-relaxed">
            For agencies, that creates both a risk and an opportunity. Clients are asking whether
            they appear in AI answers, and agencies that can measure, report, and improve that
            visibility can differentiate their offering. A dedicated platform lets you do this across
            every client from one workspace instead of running manual, one-off checks.
          </p>
        </section>

        {/* Comparison Table */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Agency Platform Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-4 text-left font-semibold">Capability</th>
                  <th className="border p-4 text-left font-semibold">SignalorAI</th>
                  <th className="border p-4 text-left font-semibold">Single-Brand Trackers</th>
                  <th className="border p-4 text-left font-semibold">Manual Monitoring</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-4 font-medium">Multi-Engine Coverage</td>
                  <td className="border p-4">✓ ChatGPT, Claude, Gemini, Perplexity, Google AI</td>
                  <td className="border p-4">△ Often one or two engines</td>
                  <td className="border p-4">✗ Time-intensive, inconsistent</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-4 font-medium">Multi-Client Management</td>
                  <td className="border p-4">✓ Track many brands from one workspace</td>
                  <td className="border p-4">✗ Single brand focus</td>
                  <td className="border p-4">✗ No centralized view</td>
                </tr>
                <tr>
                  <td className="border p-4 font-medium">Per-Client Prompt Tracking</td>
                  <td className="border p-4">✓ Track the exact queries each buyer asks</td>
                  <td className="border p-4">△ Limited prompt coverage</td>
                  <td className="border p-4">✗ No historical data</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-4 font-medium">Share-of-Voice Benchmarking</td>
                  <td className="border p-4">✓ Compare each client vs. their competitors</td>
                  <td className="border p-4">△ Limited to one brand</td>
                  <td className="border p-4">✗ Manual and error-prone</td>
                </tr>
                <tr>
                  <td className="border p-4 font-medium">Unified Visibility Score</td>
                  <td className="border p-4">✓ 0-100 score across 6 pillars</td>
                  <td className="border p-4">△ Varies by tool</td>
                  <td className="border p-4">✗ No standardized scoring</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-4 font-medium">Client-Ready Reporting</td>
                  <td className="border p-4">✓ Exportable, per-client reports</td>
                  <td className="border p-4">△ Limited export options</td>
                  <td className="border p-4">✗ Requires manual assembly</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* What to look for */}
        <section className="prose prose-lg mb-12 max-w-none">
          <h2 className="mb-4 text-2xl font-bold">What to look for when evaluating a platform</h2>
          <p className="mb-4 leading-relaxed">
            When you are choosing an AI visibility tracking platform for multiple clients, evaluate
            it against these criteria:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Multi-engine coverage</strong> — confirm it tracks citations on ChatGPT, Claude,
              Gemini, Perplexity, and Google AI, not just one engine.
            </li>
            <li>
              <strong>Multi-client management</strong> — you should be able to manage many client
              accounts and brands from a single workspace.
            </li>
            <li>
              <strong>Per-client prompt tracking</strong> — the platform should track the exact
              prompts each client&apos;s buyers ask, not just generic keywords.
            </li>
            <li>
              <strong>Share-of-voice benchmarking</strong> — it should compare each client against
              their own competitors so you can show relative performance.
            </li>
            <li>
              <strong>Unified visibility score</strong> — a single score per client makes progress
              easy to communicate and compare.
            </li>
            <li>
              <strong>Client-ready reporting</strong> — exportable reports you can present directly
              to each client save your team hours.
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map(item => (
              <div key={item.question} className="rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">{item.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </MarketingShell>
  )
}

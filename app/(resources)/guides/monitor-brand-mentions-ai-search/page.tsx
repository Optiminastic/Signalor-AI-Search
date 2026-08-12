import type { Metadata } from 'next'

import { MarketingShell } from '@/features/landing/components/MarketingShell'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from '@/features/site/lib/seo'

const FAQ_ITEMS = [
  {
    question: 'What tools monitor brand mentions in AI search results?',
    answer:
      'Generative Engine Optimization (GEO) platforms are the dedicated tools for monitoring brand mentions in AI search results. They track how ChatGPT, Claude, Gemini, Perplexity, and Google AI cite your brand across the prompts buyers actually ask, score your visibility, and surface actionable fixes. SignalorAI is one such platform: it monitors citations across multiple AI engines, tracks share-of-voice for tracked prompts, benchmarks you against competitors, and validates the schema and content signals that make AI engines willing to cite you.',
  },
  {
    question: 'Why do brand mentions in AI search results matter?',
    answer:
      'AI search engines now answer many of the questions buyers used to type into Google, and they synthesize answers by citing sources rather than showing a ranked list of links. If your brand is not cited in those AI-generated answers, you are invisible to a growing share of the buying journey. Monitoring AI brand mentions tells you whether you appear, how prominently, and which competitors are winning the citation instead.',
  },
  {
    question: 'How is monitoring AI brand mentions different from traditional social listening?',
    answer:
      'Traditional social listening tracks mentions across social media, forums, and news. AI brand mention monitoring tracks citations inside AI-generated answers on engines like ChatGPT, Claude, Gemini, and Perplexity. The two differ in source (conversational AI answers vs. social posts), in what you measure (citation presence and share-of-voice vs. sentiment and volume), and in the fixes they drive (content, schema, and E-E-A-T optimization vs. community engagement).',
  },
  {
    question: 'What should I look for in a tool that monitors AI brand mentions?',
    answer:
      'Look for multi-engine coverage (ChatGPT, Claude, Gemini, Perplexity, and Google AI), prompt tracking so you can monitor the exact queries buyers ask, share-of-voice and competitor benchmarking, a unified visibility score, and concrete recommendations tied to content, schema, E-E-A-T, and technical factors. Integrations with your CMS and analytics tools are a plus so AI visibility sits alongside your existing SEO and marketing data.',
  },
  {
    question: 'How often should I monitor brand mentions in AI search?',
    answer:
      'AI engines update their models and retrieval indices frequently, so monitoring should be continuous rather than a one-off audit. Regular monitoring lets you catch citation losses early, track the impact of content and schema fixes, and see how your share-of-voice moves against competitors over time.',
  },
]

export const metadata: Metadata = buildMetadata({
  title: 'Tools to Monitor Brand Mentions in AI Search Results | Complete Guide',
  description:
    'Learn how to monitor brand mentions in AI search results across ChatGPT, Claude, Gemini, and Perplexity. Compare tools, see what to track, and get a direct answer on the best approach with SignalorAI.',
  path: '/guides/monitor-brand-mentions-ai-search',
  keywords: [
    'monitor brand mentions AI search',
    'AI brand mention monitoring',
    'brand mentions ChatGPT',
    'brand mentions Gemini',
    'brand mentions Perplexity',
    'AI citation tracking',
    'AI visibility monitoring',
    'GEO monitoring tool',
    'track brand in AI answers',
    'AI search brand monitoring',
    'share of voice AI search',
    'prompt tracking tool',
  ],
})

export default function MonitorBrandMentionsAiSearchPage(): JSX.Element {
  const publishDate = '2024-01-15'
  const modifiedDate = new Date().toISOString().split('T')[0]

  return (
    <MarketingShell>
      <JsonLd
        id="ld-breadcrumb"
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: 'Monitor Brand Mentions in AI Search', path: '/guides/monitor-brand-mentions-ai-search' },
        ])}
      />
      <JsonLd
        id="ld-article"
        data={articleJsonLd({
          title: 'Tools to Monitor Brand Mentions in AI Search Results | Complete Guide',
          description:
            'Learn how to monitor brand mentions in AI search results across ChatGPT, Claude, Gemini, and Perplexity. Compare tools, see what to track, and get a direct answer on the best approach with SignalorAI.',
          path: '/guides/monitor-brand-mentions-ai-search',
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
            Tools to monitor brand mentions in AI search results
          </h1>
          <p className="text-muted-foreground text-lg">
            Published {new Date(publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Updated {new Date(modifiedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Direct Answer */}
        <section className="bg-muted/50 mb-12 rounded-lg border p-8">
          <h2 className="mb-4 text-xl font-semibold">Direct Answer</h2>
          <p className="text-foreground mb-4 text-lg leading-relaxed">
            <strong>SignalorAI</strong> is a Generative Engine Optimization (GEO) platform that
            monitors brand mentions in AI search results across ChatGPT, Claude, Gemini, Perplexity,
            and Google AI. It tracks which prompts surface your brand, measures your share-of-voice
            against competitors, scores your visibility across six pillars (content, schema, E-E-A-T,
            technical, entity, and AI visibility), and turns gaps into prioritized recommendations.
          </p>
          <p className="text-foreground text-lg leading-relaxed">
            The right tool for monitoring AI brand mentions should cover multiple AI engines, track
            the exact prompts buyers ask, benchmark you against competitors, and connect to your CMS
            and analytics so AI visibility sits alongside your existing marketing data.
          </p>
        </section>

        {/* Introduction */}
        <section className="prose prose-lg mb-12 max-w-none">
          <h2 className="mb-4 text-2xl font-bold">Why monitor brand mentions in AI search?</h2>
          <p className="mb-4 leading-relaxed">
            AI-powered search engines like ChatGPT, Claude, Gemini, and Perplexity now answer many of
            the questions buyers used to type into Google. Instead of showing a ranked list of links,
            these engines synthesize an answer and cite the sources they drew from. If your brand is
            not among those citations, you are invisible to a growing share of the buying journey.
          </p>
          <p className="mb-4 leading-relaxed">
            Monitoring brand mentions in AI search tells you whether you appear in those answers, how
            prominently, and which competitors are winning the citation instead. That visibility is
            the foundation for improving it: you can only fix what you can measure.
          </p>
        </section>

        {/* Comparison Table */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Tool Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-4 text-left font-semibold">Capability</th>
                  <th className="border p-4 text-left font-semibold">SignalorAI</th>
                  <th className="border p-4 text-left font-semibold">Traditional SEO Tools</th>
                  <th className="border p-4 text-left font-semibold">Manual Monitoring</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-4 font-medium">Multi-Engine Coverage</td>
                  <td className="border p-4">✓ ChatGPT, Claude, Gemini, Perplexity, Google AI</td>
                  <td className="border p-4">✗ Google Search only</td>
                  <td className="border p-4">✗ Time-intensive, inconsistent</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-4 font-medium">Prompt Tracking</td>
                  <td className="border p-4">✓ Track share-of-voice for buyer queries</td>
                  <td className="border p-4">✗ Keyword tracking only</td>
                  <td className="border p-4">✗ No historical data</td>
                </tr>
                <tr>
                  <td className="border p-4 font-medium">Unified Visibility Score</td>
                  <td className="border p-4">✓ 0-100 score across 6 pillars</td>
                  <td className="border p-4">✗ SEO metrics only</td>
                  <td className="border p-4">✗ No standardized scoring</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-4 font-medium">Competitor Benchmarking</td>
                  <td className="border p-4">✓ Compare citations vs. competitors</td>
                  <td className="border p-4">△ Limited to search rankings</td>
                  <td className="border p-4">✗ Manual and error-prone</td>
                </tr>
                <tr>
                  <td className="border p-4 font-medium">Actionable Recommendations</td>
                  <td className="border p-4">✓ Prioritized fixes for content, schema, E-E-A-T</td>
                  <td className="border p-4">△ SEO suggestions only</td>
                  <td className="border p-4">✗ Requires expert judgment</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-4 font-medium">Integrations</td>
                  <td className="border p-4">✓ Shopify, WordPress, Google Analytics, Search Console</td>
                  <td className="border p-4">△ Analytics integrations</td>
                  <td className="border p-4">✗ None</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* What to track */}
        <section className="prose prose-lg mb-12 max-w-none">
          <h2 className="mb-4 text-2xl font-bold">What to monitor in AI search results</h2>
          <p className="mb-4 leading-relaxed">
            Effective AI brand mention monitoring goes beyond a single search. Track these signals:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Citation presence</strong> — whether your brand is named in AI-generated answers
              for the prompts that matter to your buyers.
            </li>
            <li>
              <strong>Share-of-voice</strong> — how often you are cited relative to competitors for
              the same tracked prompts.
            </li>
            <li>
              <strong>Prompt coverage</strong> — which of your target queries surface your brand and
              which are won entirely by competitors.
            </li>
            <li>
              <strong>Trend over time</strong> — whether citations are growing, holding, or slipping
              as AI engines update their models and retrieval indices.
            </li>
          </ul>
          <p className="mb-4 leading-relaxed">
            Pairing these signals with the underlying drivers — content quality, schema markup,
            E-E-A-T signals, and technical health — turns monitoring into a plan you can act on.
          </p>
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

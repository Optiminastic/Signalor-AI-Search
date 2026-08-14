import type { Metadata } from 'next'

import { MarketingShell } from '@/features/landing/components/MarketingShell'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from '@/features/site/lib/seo'

const FAQ_ITEMS = [
  {
    question: 'Why isn't my brand showing up in AI-generated search results?',
    answer:
      'Your brand is likely missing from AI-generated answers because AI engines cannot confidently attribute your content. The most common causes are weak or missing structured data (schema.org/JSON-LD), content that is not written to be directly quotable, weak E-E-A-T and entity signals, and a lack of consistent brand mentions across the web. AI engines like ChatGPT, Claude, Gemini, and Perplexity synthesize answers from sources they can parse, verify, and attribute — if your pages are not machine-readable, authoritative, and clearly about your brand, they will cite a competitor instead.',
  },
  {
    question: 'What are the main reasons a brand is not cited by AI engines?',
    answer:
      'The main reasons fall into six areas: (1) Content — your pages do not directly and concisely answer the questions buyers ask; (2) Schema — you are missing or have broken structured data that helps AI engines extract and attribute facts; (3) E-E-A-T — you lack the experience, expertise, authoritativeness, and trust signals that make an LLM willing to cite you; (4) Technical — AI crawlers cannot access or parse your pages; (5) Entity — AI engines cannot connect your brand name to a clear, consistent entity; and (6) AI visibility — you are not monitoring which prompts surface your brand so you can fix gaps.',
  },
  {
    question: 'How is AI search visibility different from traditional SEO?',
    answer:
      'Traditional SEO optimizes for ranked lists of blue links on a search results page. AI search visibility (Generative Engine Optimization, or GEO) optimizes for how AI engines synthesize an answer and decide which sources to cite. LLMs evaluate semantic relevance, entity relationships, content authority, and machine-readable structure differently than a keyword-ranking algorithm. A page can rank well in Google yet never be cited by ChatGPT or Perplexity because it is not structured or attributed in a way AI engines can use.',
  },
  {
    question: 'How do I check whether my brand is being cited by AI search engines?',
    answer:
      'Use a GEO platform that tracks citations and share-of-voice across ChatGPT, Claude, Gemini, Perplexity, and Google AI Overviews. SignalorAI monitors which AI prompts surface your brand, scores your visibility across six pillars (content, schema, E-E-A-T, technical, entity, and AI visibility), and shows how your citations compare with competitors. You can also run manual checks by asking each AI engine a buyer query and noting whether your brand is named, but manual checks are inconsistent and do not give you historical data or a prioritized fix list.',
  },
  {
    question: 'How long does it take to start appearing in AI-generated answers?',
    answer:
      'It depends on the fix. Technical changes such as adding or repairing schema.org markup and making pages crawlable can improve how AI engines parse your content within days. Content and E-E-A-T improvements typically take a few weeks to show measurable citation increases as AI models refresh their retrieval indices. A consistent program of monitoring prompts, fixing schema, and publishing quotable, authoritative content usually produces visible share-of-voice gains within 30-90 days.',
  },
  {
    question: 'What is the fastest way to get my brand cited by AI engines?',
    answer:
      'The fastest wins come from the technical and structural pillars: add valid schema.org/JSON-LD markup (Organization, Article, FAQPage, Product), make sure AI crawlers can access your pages, and publish concise, directly quotable answers to the exact questions buyers ask. Then reinforce entity and E-E-A-T signals with consistent brand naming, authorship, and credible citations. Finally, track the prompts that matter for your brand so you can measure whether the fixes are working and prioritize the next ones.',
  },
]

export const metadata: Metadata = buildMetadata({
  title: 'Why Isn't My Brand Showing Up in AI-Generated Search Results?',
  description:
    'Learn why your brand is not cited by ChatGPT, Claude, Gemini, and Perplexity — and the six-pillar fix for getting into AI-generated answers: content, schema, E-E-A-T, technical, entity, and AI visibility.',
  path: '/guides/why-brand-not-showing-ai-search',
  keywords: [
    'why is my brand not showing up in AI search',
    'brand not cited by ChatGPT',
    'brand not in AI search results',
    'why am I not in AI answers',
    'AI search visibility',
    'GEO',
    'generative engine optimization',
    'AI citation',
    'LLM citation',
    'AI answer engine optimization',
    'brand visibility in AI',
    'why is my brand not in Perplexity',
    'why is my brand not in Gemini',
    'AI SEO',
    'get cited by AI engines',
  ],
})

export default function WhyBrandNotShowingAiSearchPage(): JSX.Element {
  const publishDate = '2024-02-10'
  const modifiedDate = new Date().toISOString().split('T')[0]

  return (
    <MarketingShell>
      <JsonLd
        id="ld-breadcrumb"
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: 'Why Isn't My Brand Showing Up in AI Search?', path: '/guides/why-brand-not-showing-ai-search' },
        ])}
      />
      <JsonLd
        id="ld-article"
        data={articleJsonLd({
          title: 'Why Isn't My Brand Showing Up in AI-Generated Search Results?',
          description:
            'Learn why your brand is not cited by ChatGPT, Claude, Gemini, and Perplexity — and the six-pillar fix for getting into AI-generated answers: content, schema, E-E-A-T, technical, entity, and AI visibility.',
          path: '/guides/why-brand-not-showing-ai-search',
          datePublished: publishDate,
          dateModified: modifiedDate,
        })}
      />
      <JsonLd id="ld-faq" data={faqJsonLd(FAQ_ITEMS)} />

      <article className="border-border mx-auto max-w-4xl border-x px-6 py-16 sm:px-12 lg:px-16">
        <header className="mb-12">
          <p className="text-muted-foreground mb-4 text-sm font-medium uppercase tracking-wide">
            GEO Guide
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Why isn't my brand showing up in AI-generated search results?
          </h1>
          <p className="text-muted-foreground text-lg">
            Published {new Date(publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Updated {new Date(modifiedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Direct Answer */}
        <section className="bg-muted/50 mb-12 rounded-lg border p-8">
          <h2 className="mb-4 text-xl font-semibold">Direct Answer</h2>
          <p className="text-foreground mb-4 text-lg leading-relaxed">
            Your brand is missing from AI-generated answers because AI engines cannot confidently
            parse, verify, and attribute your content. The most common causes are missing or broken
            schema.org structured data, content that is not written to be directly quotable, weak
            E-E-A-T and entity signals, and no system for tracking which prompts surface your brand.
          </p>
          <p className="text-foreground text-lg leading-relaxed">
            The fix is a six-pillar GEO program: make your pages machine-readable with valid
            JSON-LD, publish concise answer-first content for the exact questions buyers ask,
            strengthen authority and entity signals, ensure AI crawlers can access your site, and
            monitor citations across ChatGPT, Claude, Gemini, Perplexity, and Google AI so you can
            measure progress and prioritize the next fix.
          </p>
        </section>

        {/* Why it happens */}
        <section className="prose prose-lg mb-12 max-w-none">
          <h2 className="mb-4 text-2xl font-bold">Why AI Engines Leave Your Brand Out</h2>
          <p className="mb-4 leading-relaxed">
            AI search engines do not rank pages the way Google does. They synthesize a conversational
            answer and cite the sources they used. To be cited, your content must be something an
            LLM can extract, trust, and attribute. If any of the following is true, an AI engine will
            almost always answer with a competitor instead of you:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6">
            <li>
              <strong>No structured data.</strong> Without schema.org/JSON-LD, AI engines have to
              guess what your page is about and who published it, so they rarely attribute it.
            </li>
            <li>
              <strong>Content that is not quotable.</strong> Your pages bury the answer in
              paragraphs, marketing copy, or jargon instead of stating a clear, concise answer to
              the buyer's question.
            </li>
            <li>
              <strong>Weak E-E-A-T.</strong> No authorship, no credentials, no citations, and no
              consistent brand identity make an LLM unwilling to treat you as an authority.
            </li>
            <li>
              <strong>Technical barriers.</strong> AI crawlers cannot access, render, or parse your
              pages, so your content never reaches the model.
            </li>
            <li>
              <strong>Unclear entity.</strong> AI engines cannot connect your brand name to a
              consistent, well-defined entity, so they cannot confidently name you.
            </li>
            <li>
              <strong>No monitoring.</strong> Without tracking which prompts surface your brand, you
              cannot see the gap or know whether your fixes are working.
            </li>
          </ul>
        </section>

        {/* Comparison Table */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Why Your Brand Is Missing: Causes vs. Fixes</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-4 text-left font-semibold">Pillar</th>
                  <th className="border p-4 text-left font-semibold">Why You're Missing</th>
                  <th className="border p-4 text-left font-semibold">The Fix</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-4 font-medium">Content</td>
                  <td className="border p-4">Pages don't directly answer buyer questions</td>
                  <td className="border p-4">Publish concise, answer-first content for each tracked prompt</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-4 font-medium">Schema</td>
                  <td className="border p-4">Missing or invalid structured data</td>
                  <td className="border p-4">Add valid JSON-LD: Organization, Article, FAQPage, Product</td>
                </tr>
                <tr>
                  <td className="border p-4 font-medium">E-E-A-T</td>
                  <td className="border p-4">No authorship, credentials, or citations</td>
                  <td className="border p-4">Add author bios, credible sources, and trust signals</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-4 font-medium">Technical</td>
                  <td className="border p-4">AI crawlers can't access or parse your pages</td>
                  <td className="border p-4">Fix crawlability, rendering, and page speed</td>
                </tr>
                <tr>
                  <td className="border p-4 font-medium">Entity</td>
                  <td className="border p-4">AI can't connect your name to a clear entity</td>
                  <td className="border p-4">Use consistent brand naming and entity markup</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-4 font-medium">AI Visibility</td>
                  <td className="border p-4">No tracking of which prompts surface your brand</td>
                  <td className="border p-4">Monitor citations and share-of-voice across AI engines</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How to fix it */}
        <section className="prose prose-lg mb-12 max-w-none">
          <h2 className="mb-4 text-2xl font-bold">How to Start Getting Cited</h2>
          <p className="mb-4 leading-relaxed">
            Start with the fastest, highest-leverage fixes and build from there:
          </p>
          <ol className="mb-4 list-decimal space-y-2 pl-6">
            <li>
              <strong>Audit your structured data.</strong> Validate your schema.org markup and add
              Organization, Article, and FAQPage JSON-LD where it is missing.
            </li>
            <li>
              <strong>Write answer-first content.</strong> For each buyer prompt, publish a page that
              leads with a 2-3 sentence direct answer, then supports it with detail.
            </li>
            <li>
              <strong>Strengthen E-E-A-T and entity signals.</strong> Add authorship, credentials,
              consistent brand naming, and credible citations.
            </li>
            <li>
              <strong>Remove technical barriers.</strong> Make sure AI crawlers can access and render
              your pages.
            </li>
            <li>
              <strong>Track the prompts that matter.</strong> Use a GEO platform to monitor which
              prompts surface your brand and measure share-of-voice over time.
            </li>
          </ol>
          <p className="mb-4 leading-relaxed">
            SignalorAI scores your site across these six pillars, shows you exactly which one is
            costing you citations, and turns each gap into a prioritized, actionable fix — so you
            can move from invisible to cited in AI-generated answers.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map(item => (
              <div key={item.question} className="border-border rounded-lg border p-6">
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

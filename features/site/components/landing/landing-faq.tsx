'use client'

import { useState } from 'react'
import { ChevronDown } from '@/features/site/components/icons'
import { cn } from '@/features/site/lib/utils'
import { CornerDiamonds } from '@/features/site/components/ui/intersection-diamonds'

const DEFAULT_FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'How do I get started with SignalorAI?',
    answer:
      'Paste any public URL into the free analyzer. You’ll get a GEO score, citation signals, and a prioritized fix list, no install required. Create an account when you want to save runs and track changes over time.',
  },
  {
    question: 'Can I segment visibility by model, region, or audience?',
    answer:
      'Dashboard views let you filter by AI surface (e.g. ChatGPT-style answers vs. search-style overviews) and track how recommendations shift by page and topic. Deeper geo and audience segmentation is on the roadmap, tell us what you need via sales.',
  },
  {
    question: 'How often is the data refreshed?',
    answer:
      'Audit snapshots reflect the crawl and scoring pass at run time. Saved workspaces can re-run audits on a schedule you choose so you can see when schema, content, or external citations move the needle.',
  },
  {
    question: 'What are brand visibility vs. source visibility metrics?',
    answer:
      'Brand visibility is how often and how strongly your name and claims appear in AI-style answers for tracked prompts. Source visibility is whether your URLs are cited, paraphrased, or skipped, both matter for GEO, and SignalorAI surfaces gaps in each.',
  },
  {
    question: 'How do source citations work behind the scenes?',
    answer:
      'We analyze structured data, on-page signals, and how third-party pages reference you, then map that to patterns models use when selecting sources. You get plain-English fixes instead of a black box score.',
  },
  {
    question: 'How do I integrate SignalorAI into my BI or reporting tools?',
    answer:
      'Export summaries and share links from the product today. API access and webhook-style delivery for scores and recommendations are planned, contact us if you need an enterprise export path sooner.',
  },
]

type LandingFaqProps = {
  sectionId?: string
  headingId?: string
  heading?: string
  description?: string
  // readonly: every FAQ constant in the site is declared `as const`, so a mutable
  // array type forced all 13 call sites to pass `items={[...X]}` — a defensive
  // copy allocated on every render purely to satisfy the type. Forgetting that
  // spread is a build break, not a runtime bug, which is exactly how it failed.
  // Nothing here mutates `items`; it is only mapped over.
  items?: readonly { question: string; answer: string }[]
}

export function LandingFaq({
  sectionId = 'faq',
  headingId = 'landing-faq-heading',
  heading = 'FAQs',
  description = 'Get answers to the most common questions about AI search and SignalorAI.',
  items = DEFAULT_FAQ_ITEMS,
}: LandingFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      id={sectionId}
      className="bg-muted relative border-t border-black/8 px-6 py-20 sm:py-24 lg:px-12"
      aria-labelledby={headingId}
    >
      <CornerDiamonds top />
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id={headingId}
          className="text-foreground font-sans text-4xl font-bold tracking-tight sm:text-5xl"
        >
          {heading}
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed font-normal sm:text-lg">
          {description}
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <ul className="border-t border-black/10">
          {items.map((item, index) => {
            const isOpen = openIndex === index
            const panelId = `faq-panel-${index}`
            const buttonId = `faq-trigger-${index}`
            return (
              <li key={item.question} className="border-b border-black/10">
                <h3 className="text-foreground m-0 text-base leading-snug font-medium">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="hover:text-foreground/90 flex w-full items-center justify-between gap-4 py-5 text-left transition-colors sm:py-6"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span className="min-w-0 pr-2">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        'text-muted-foreground h-5 w-5 shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                      aria-hidden
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="text-muted-foreground pr-10 pb-5 text-sm leading-relaxed sm:text-sm sm:leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

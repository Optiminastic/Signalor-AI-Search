import type { Metadata } from 'next'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import { GrowthLeadCard } from '@/features/site/components/growth-lead/growth-lead-card'
import { buildMetadata } from '@/features/site/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: "Let's Get Your Website Growing | SignalorAI",
  description:
    'Tell us about your business and goals. We will show you how the SignalorAI agent can improve your visibility across Google search, AI search, and answer engines.',
  path: '/contact',
})

const SERVICES_SUMMARY = [
  { tag: 'SEO', text: 'Rank higher in Google search results.' },
  { tag: 'GEO', text: 'Get cited by ChatGPT, Gemini, and Perplexity.' },
  { tag: 'AEO', text: 'Become the answer in AI Overviews and assistants.' },
] as const

function ContactIntro(): JSX.Element {
  return (
    <div className="lg:pt-2">
      <h1 className="text-foreground text-3xl leading-[1.08] font-bold tracking-tight sm:text-4xl">
        Let&apos;s get your website{' '}
        <span className="decoration-primary/60 underline decoration-dashed decoration-2 underline-offset-4">
          growing.
        </span>
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed">
        Tell us a little about your business. We&apos;ll explore how our AI agent can help improve
        your online visibility.
      </p>
      <ul className="mt-10 hidden divide-y divide-black/6 border-y border-black/6 lg:block">
        {SERVICES_SUMMARY.map(s => (
          <li key={s.tag} className="flex items-baseline gap-4 py-3.5">
            <span className="text-foreground w-10 shrink-0 text-[13px] font-semibold">{s.tag}</span>
            <span className="text-muted-foreground text-[14px]">{s.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ContactPage(): JSX.Element {
  return (
    <MarketingShell>
      <section className="bg-background relative px-6 py-16 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <ContactIntro />
          <GrowthLeadCard />
        </div>
      </section>
    </MarketingShell>
  )
}

import Link from 'next/link'

import { ArrowRight } from '@/features/site/components/icons'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'

const SERVICES = [
  {
    tag: 'SEO',
    label: 'Search engine optimization',
    text: 'Rank higher in Google search results.',
  },
  {
    tag: 'GEO',
    label: 'Generative engine optimization',
    text: 'Get cited by ChatGPT, Gemini, and Perplexity.',
  },
  {
    tag: 'AEO',
    label: 'Answer engine optimization',
    text: 'Become the answer in AI Overviews and assistants.',
  },
] as const

function ServiceGrid(): JSX.Element {
  return (
    <ul className="divide-border grid h-full divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {SERVICES.map(s => (
        <li key={s.tag} className="px-6 py-8 sm:px-8 lg:py-20">
          <span className="text-primary-ink text-[12px] font-semibold tracking-[0.18em]">
            {s.tag}
          </span>
          <p className="text-foreground mt-3 text-[15px] font-semibold">{s.label}</p>
          <p className="text-muted-foreground mt-1.5 text-[13px] leading-relaxed">{s.text}</p>
        </li>
      ))}
    </ul>
  )
}

/**
 * Home-page "Let's talk" band between the FAQ and the pre-footer CTA. Sends
 * visitors to the /contact lead form rather than embedding it. Same 40/60 rail
 * split as HomeFaq: pitch + CTA on the left, the three services on the right.
 */
export function HomeLetsTalk(): JSX.Element {
  return (
    <section id="lets-talk" aria-labelledby="home-lets-talk-heading">
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <GridHandle className="-top-[3.5px] left-[40%] -ml-[3.5px] hidden lg:block" />
        <div className="lg:divide-border grid lg:grid-cols-[2fr_3fr] lg:divide-x">
          <div className="max-lg:border-border px-6 py-14 max-lg:border-b sm:px-10 lg:py-20">
            <p className="text-primary-ink text-[12px] font-semibold tracking-[0.18em] uppercase">
              Work with us
            </p>
            <h2
              id="home-lets-talk-heading"
              className="text-foreground mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Let&apos;s get your website growing.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed text-pretty">
              Tell us a little about your business. We&apos;ll explore how our AI agent can help
              improve your online visibility.
            </p>
            <Link href="/contact" className={`${LANDING_PRIMARY_CTA_CLASS} mt-8`}>
              Let&apos;s talk
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="bg-card">
            <ServiceGrid />
          </div>
        </div>
      </div>
    </section>
  )
}

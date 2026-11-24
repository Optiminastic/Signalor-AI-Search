import Link from 'next/link'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

export interface MarketingSection {
  heading: string
  body: string
}

export interface MarketingContentProps {
  eyebrow: string
  title: string
  subtitle: string
  sections: MarketingSection[]
  cta?: { label: string; href: string }
}

function Hero({
  eyebrow,
  title,
  subtitle,
  cta,
}: Omit<MarketingContentProps, 'sections'>): JSX.Element {
  return (
    <div>
      <p className="text-primary-ink text-[13px] font-semibold tracking-wider uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#171717] md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#52525b]">{subtitle}</p>
      {cta ? (
        <Link
          href={cta.href}
          className="auth-cta-btn mt-8 inline-flex h-10 items-center rounded-md px-5 text-[14px] font-semibold text-white"
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  )
}

function Sections({ sections }: { sections: MarketingSection[] }): JSX.Element {
  return (
    <div className="mt-14 grid gap-10 md:grid-cols-2">
      {sections.map(s => (
        <section key={s.heading}>
          <h2 className="text-[17px] font-semibold text-[#171717]">{s.heading}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#52525b]">{s.body}</p>
        </section>
      ))}
    </div>
  )
}

/**
 * Shared content shell for the new-signalor marketing pages that the top-nav
 * links to (Careers, Guides, Docs, etc.). Wraps a hero + a two-column section
 * grid in the standard MarketingShell chrome.
 */
export function MarketingContent(props: MarketingContentProps): JSX.Element {
  const { sections, ...hero } = props
  return (
    <MarketingShell>
      <main className="mx-auto w-full max-w-4xl px-6 py-16 md:px-10 md:py-24">
        <Hero {...hero} />
        <Sections sections={sections} />
      </main>
    </MarketingShell>
  )
}

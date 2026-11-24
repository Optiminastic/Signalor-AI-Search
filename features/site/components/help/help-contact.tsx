import Link from 'next/link'

import { MailLink } from '@/features/site/components/mail-link'
import { TESTIMONIALS } from '@/features/site/lib/landing-testimonials-content'

// Shared button recipes mirroring the Tailark contact reference: a soft raised
// secondary button and a primary-text ghost button.
const SECONDARY_BTN =
  'inline-flex h-8 w-fit items-center gap-2 rounded-md border border-transparent bg-card px-3 text-xs font-medium shadow-sm shadow-black/10 ring-1 ring-foreground/10 transition duration-200 hover:bg-muted/50'
const GHOST_BTN =
  'inline-flex h-8 w-fit items-center rounded-md px-3 text-xs font-medium text-primary-ink transition duration-200 hover:bg-foreground/5'

interface HelpCardProps {
  title: string
  body: string
  children: React.ReactNode
}

function HelpCard({ title, body, children }: HelpCardProps): React.ReactElement {
  return (
    <div className="ring-border bg-card text-card-foreground flex flex-col rounded-xl p-6 shadow ring-1 shadow-black/6.5">
      <div className="mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-muted-foreground mt-2 text-balance">{body}</p>
      </div>
      {children}
    </div>
  )
}

function HelpTestimonial(): React.ReactElement {
  const t = TESTIMONIALS[0]
  return (
    <div className="col-span-full flex flex-col p-6">
      <div className="space-y-6">
        <p className="text-foreground text-xl text-balance">&ldquo;{t.quote}&rdquo;</p>
        <div className="grid grid-cols-[auto_1fr] items-center gap-4">
          <div className="before:border-foreground/25 bg-primary/10 relative flex size-14 items-center justify-center overflow-hidden rounded-xl before:absolute before:inset-0 before:rounded-xl before:border">
            <span className="text-primary-ink text-base font-semibold">{t.initials}</span>
          </div>
          <div className="space-y-0.5">
            <p className="text-foreground text-sm font-medium text-balance">{t.name}</p>
            <p className="text-foreground/65 text-xs text-balance">
              {t.role}, {t.company}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HelpContact(): React.ReactElement {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="px-4 text-center">
          <h1 className="text-foreground text-4xl font-semibold text-balance md:text-5xl lg:tracking-tight">
            How can we help?
          </h1>
          <p className="text-muted-foreground mt-4 text-lg text-balance">
            Find answers to your questions and get support for SignalorAI.
          </p>
        </div>

        <div className="border-border mx-auto mt-12 grid max-w-2xl gap-1 rounded-2xl border p-1 md:grid-cols-2">
          <HelpCard
            title="Contact Sales"
            body="Talk to our team about pricing, demos, and rolling SignalorAI out across your brands."
          >
            <Link href="/contact-sales" className={`${SECONDARY_BTN} mt-auto`}>
              Talk to sales
            </Link>
          </HelpCard>

          <HelpCard
            title="Help &amp; Support"
            body="Browse the guides below or reach a real person, we usually reply the same working day."
          >
            <div className="mt-auto flex flex-wrap gap-1">
              <Link href="/contact-sales" className={SECONDARY_BTN}>
                Contact Support
              </Link>
              <MailLink user="hello" subject="Support request" className={GHOST_BTN}>
                hello@signalor.ai
              </MailLink>
            </div>
          </HelpCard>

          <HelpTestimonial />
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import { ArrowRight, Check } from '@/features/site/components/icons'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { LandingFaq } from '@/features/site/components/landing/landing-faq'
import { MailLink } from '@/features/site/components/mail-link'
import { Button } from '@/features/site/components/ui/button'
import { Input } from '@/features/site/components/ui/input'
import { Label } from '@/features/site/components/ui/label'
import { SignalorLoader } from '@/features/site/components/ui/signalor-loader'
import { submitEnterpriseLead } from '@/features/site/lib/api/enterprise'
import { CONTACT_SALES_FAQ } from '@/features/site/lib/landing-contact-content'
import { cn } from '@/features/site/lib/utils'

const SUPPORT_LEVELS = [
  { value: '', label: 'Select…' },
  { value: 'self_serve', label: 'Self-serve' },
  { value: 'managed', label: 'Managed / agency-style' },
  { value: 'dedicated', label: 'Dedicated team' },
]

const CURRENCIES = ['GBP', 'USD', 'EUR', 'INR']

const AI_ENGINES = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'claude', label: 'Claude' },
  { value: 'google', label: 'Google AI' },
  { value: 'bing', label: 'Bing / Copilot' },
]

const FIELD_CLASS =
  'w-full rounded-none border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary'

const CONTACT_CHANNELS = [
  {
    label: 'Prefer self-serve?',
    node: (
      <Link
        href="/pricing"
        className="text-foreground hover:text-primary inline-flex items-center gap-1 text-[15px] font-semibold transition-colors"
      >
        See plans & pricing
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    ),
  },
  {
    label: 'Email',
    node: (
      <MailLink
        user="hello"
        subject="Sales inquiry"
        className="text-foreground hover:text-primary inline-flex items-center gap-1 text-[15px] font-semibold transition-colors"
      >
        Email the sales team
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </MailLink>
    ),
  },
  {
    label: 'Build on SignalorAI',
    node: (
      <Link
        href="/api"
        className="text-foreground hover:text-primary inline-flex items-center gap-1 text-[15px] font-semibold transition-colors"
      >
        API & MCP docs
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    ),
  },
] as const

function ContactIntro(): JSX.Element {
  return (
    <div>
      <Link
        href="/pricing"
        className="text-muted-foreground hover:text-foreground text-xs font-medium"
      >
        ← Back to pricing
      </Link>
      <p className="text-muted-foreground mt-6 text-[11px] font-medium tracking-[0.22em] uppercase">
        [ enterprise ]
      </p>
      <h1 className="text-foreground mt-4 text-3xl leading-[1.08] font-bold tracking-tight sm:text-4xl">
        Talk to{' '}
        <span className="decoration-primary/60 underline decoration-dashed decoration-2 underline-offset-4">
          sales
        </span>
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed">
        For larger brands and agencies with higher prompt volumes, multiple domains, or advanced
        support needs. Tell us what you need and we&apos;ll put together a plan.
      </p>
      <dl className="mt-10 space-y-7">
        {CONTACT_CHANNELS.map(channel => (
          <div key={channel.label}>
            <dt className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
              {channel.label}
            </dt>
            <dd className="mt-1.5">{channel.node}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function SuccessCard(): JSX.Element {
  return (
    <div className="border-success/30 bg-success/5 border p-8 text-center">
      <div className="bg-success/15 mx-auto mb-4 grid h-12 w-12 place-content-center rounded-full">
        <Check className="text-success h-6 w-6" strokeWidth={2.5} aria-hidden />
      </div>
      <h2 className="text-foreground text-xl font-semibold">Thanks — we&apos;ve got it</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Our team will be in touch shortly. You can head back to pricing in the meantime.
      </p>
      <Link href="/pricing" className={`${LANDING_PRIMARY_CTA_CLASS} mt-6`}>
        Back to pricing
      </Link>
    </div>
  )
}

export default function ContactSalesPage() {
  const [form, setForm] = useState({
    brand_name: '',
    website: '',
    email: '',
    prompts_required: '',
    brands_count: '',
    current_investment: '',
    support_level: '',
    preferred_currency: 'GBP',
    team_size: '',
  })
  const [engines, setEngines] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleEngine(value: string) {
    setEngines(cur => (cur.includes(value) ? cur.filter(e => e !== value) : [...cur, value]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (!form.brand_name.trim()) {
      setError('Please enter your brand name.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const toInt = (v: string) => {
        const n = parseInt(v, 10)
        return Number.isFinite(n) && n > 0 ? n : null
      }
      await submitEnterpriseLead({
        brand_name: form.brand_name,
        website: form.website,
        email: form.email,
        prompts_required: toInt(form.prompts_required),
        brands_count: toInt(form.brands_count),
        current_investment: form.current_investment,
        support_level: form.support_level,
        preferred_currency: form.preferred_currency,
        team_size: form.team_size,
        ai_engines: engines,
      })
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again, or email hello@signalor.ai.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MarketingShell>
      <section className="bg-background relative px-6 py-16 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <ContactIntro />

          <div className="border border-black/8 bg-white p-6 shadow-xs sm:p-8">
            <div className="mb-8 space-y-4">
              <h2 className="text-foreground text-lg font-semibold">When you need enterprise</h2>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  You need to track a high volume of prompts per month
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  You manage multiple client brands or domains
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  You require dedicated support or API access
                </li>
              </ul>
              <p className="text-muted-foreground text-sm">
                Enterprise pricing is based on prompt volume and domain count. Fill out the form for
                a custom quote.
              </p>
            </div>
            {done ? (
              <SuccessCard />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="brand_name">Brand name *</Label>
                    <Input
                      id="brand_name"
                      value={form.brand_name}
                      onChange={e => update('brand_name', e.target.value)}
                      placeholder="Acme Inc."
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="website">Website / domain</Label>
                    <Input
                      id="website"
                      value={form.website}
                      onChange={e => update('website', e.target.value)}
                      placeholder="acme.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Work email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="you@acme.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="team_size">Team size</Label>
                    <Input
                      id="team_size"
                      value={form.team_size}
                      onChange={e => update('team_size', e.target.value)}
                      placeholder="e.g. 11–50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prompts_required">Number of prompts required</Label>
                    <Input
                      id="prompts_required"
                      type="number"
                      min={1}
                      value={form.prompts_required}
                      onChange={e => update('prompts_required', e.target.value)}
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="brands_count">Number of brands / domains</Label>
                    <Input
                      id="brands_count"
                      type="number"
                      min={1}
                      value={form.brands_count}
                      onChange={e => update('brands_count', e.target.value)}
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="support_level">Required support level</Label>
                    <select
                      id="support_level"
                      value={form.support_level}
                      onChange={e => update('support_level', e.target.value)}
                      className={FIELD_CLASS}
                    >
                      {SUPPORT_LEVELS.map(s => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="preferred_currency">Preferred currency</Label>
                    <select
                      id="preferred_currency"
                      value={form.preferred_currency}
                      onChange={e => update('preferred_currency', e.target.value)}
                      className={FIELD_CLASS}
                    >
                      {CURRENCIES.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="current_investment">Current SEO / content investment</Label>
                  <textarea
                    id="current_investment"
                    value={form.current_investment}
                    onChange={e => update('current_investment', e.target.value)}
                    rows={3}
                    placeholder="Roughly what you invest today, agencies/tools you use, etc."
                    className={FIELD_CLASS}
                  />
                </div>

                <div className="space-y-2">
                  <Label>AI engines you want to track</Label>
                  <div className="flex flex-wrap gap-2">
                    {AI_ENGINES.map(eng => {
                      const active = engines.includes(eng.value)
                      return (
                        <button
                          key={eng.value}
                          type="button"
                          onClick={() => toggleEngine(eng.value)}
                          aria-pressed={active}
                          className={cn(
                            'rounded-none border px-3 py-2 text-sm transition-colors',
                            active
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/50'
                          )}
                        >
                          {eng.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <SignalorLoader /> : 'Send'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <LandingFaq items={CONTACT_SALES_FAQ} />
    </MarketingShell>
  )
}

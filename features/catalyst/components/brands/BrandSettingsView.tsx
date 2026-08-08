import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Brand } from '@/features/catalyst/brands-data'
import { MembersTable } from '@/features/catalyst/components/brands/MembersTable'
import { ArrowLeft } from '@/lib/icons'

const INPUT =
  'h-9 w-full rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-3 text-[13px] text-[var(--cat-ink)] outline-none'
const LABEL = 'mb-1.5 block text-[12px] font-medium text-[var(--cat-ink-2)]'
const ENGINES = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Google', 'Bing']

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}): JSX.Element {
  return (
    <section className="cat-card-edge overflow-hidden rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)]">
      <header className="border-b border-[var(--cat-border)] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[var(--cat-ink)]">{title}</h2>
        {description && <p className="mt-0.5 text-[12px] text-[var(--cat-ink-3)]">{description}</p>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

function GeneralSection({ brand }: { brand: Brand }): JSX.Element {
  return (
    <Section title="General" description="Basic details for this brand.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Brand name</label>
          <input className={INPUT} defaultValue={brand.name} />
        </div>
        <div>
          <label className={LABEL}>Website</label>
          <input className={INPUT} defaultValue={brand.url} />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="h-9 rounded-md px-4 text-[13px] font-medium text-white"
          style={{ background: '#e04a3d' }}
        >
          Save changes
        </button>
      </div>
    </Section>
  )
}

function AnalysisSection(): JSX.Element {
  return (
    <Section
      title="Analysis"
      description="How often we re-score this brand, and which engines we track."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Schedule</label>
          <select className={INPUT} defaultValue="weekly">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Engines tracked</label>
          <div className="flex flex-wrap gap-1.5">
            {ENGINES.map(e => (
              <span
                key={e}
                className="rounded-md border border-[var(--cat-border)] bg-[var(--cat-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--cat-ink-2)]"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function DangerZone({ brand }: { brand: Brand }): JSX.Element {
  return (
    <section className="overflow-hidden rounded-lg border border-[rgba(229,72,77,0.4)] bg-[var(--cat-card)]">
      <header className="border-b border-[rgba(229,72,77,0.25)] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#E5484D]">Danger zone</h2>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-[13px] text-[var(--cat-ink-2)]">
          {brand.status === 'active' ? 'Pause' : 'Resume'} analysis or permanently delete this
          brand.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="h-9 rounded-md border border-[var(--cat-border)] px-3.5 text-[13px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]"
          >
            {brand.status === 'active' ? 'Pause brand' : 'Resume brand'}
          </button>
          <button
            type="button"
            className="h-9 rounded-md border border-[rgba(229,72,77,0.5)] px-3.5 text-[13px] font-medium text-[#E5484D] transition-colors hover:bg-[rgba(229,72,77,0.08)]"
          >
            Delete brand
          </button>
        </div>
      </div>
    </section>
  )
}

export function BrandSettingsView({ brand }: { brand: Brand }): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-[860px]">
      <Link
        href="/dashboard/brands"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--cat-ink-3)] transition-colors hover:text-[var(--cat-ink)]"
      >
        <ArrowLeft size={14} />
        Brands
      </Link>
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[rgba(224,74,61,0.12)] text-[17px] font-semibold text-[#e04a3d] uppercase">
          {brand.name[0]}
        </span>
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[var(--cat-ink)]">
            {brand.name}
          </h1>
          <p className="text-[13px] text-[var(--cat-ink-3)]">{brand.url} · Brand settings</p>
        </div>
      </header>

      <div className="space-y-5">
        <GeneralSection brand={brand} />
        <Section
          title="Team & access"
          description="Invite teammates and control what they can do (RBAC)."
        >
          <MembersTable />
        </Section>
        <AnalysisSection />
        <DangerZone brand={brand} />
      </div>
    </div>
  )
}

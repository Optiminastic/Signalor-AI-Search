'use client'

import { useState } from 'react'

import { DataState } from '@/features/catalyst/components/DataState'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandProfile, useBrandProfileMutations } from '@/hooks/useBrandProfile'
import type { BrandProfile, BrandProfileSections, ReviewDecision } from '@/lib/api/brand-profile'
import { BadgeCheck, XCircle } from '@/lib/icons'

const EDITABLE = [
  'identity',
  'positioning',
  'audience',
  'voice',
  'canonical_facts',
  'competitors',
] as const

type EditableKey = (typeof EDITABLE)[number]

const LABELS: Record<EditableKey, string> = {
  identity: 'Identity',
  positioning: 'Positioning',
  audience: 'Audience',
  voice: 'Voice',
  canonical_facts: 'Verified facts',
  competitors: 'Competitors',
}

interface Mutations {
  save: (patch: BrandProfileSections) => void
  review: (decision: ReviewDecision) => void
  saving: boolean
  reviewing: boolean
}

function toJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2)
}

function initDrafts(profile: BrandProfile): Record<EditableKey, string> {
  return {
    identity: toJson(profile.identity),
    positioning: toJson(profile.positioning),
    audience: toJson(profile.audience),
    voice: toJson(profile.voice),
    canonical_facts: toJson(profile.canonical_facts),
    competitors: toJson(profile.competitors),
  }
}

/** Parse every draft; return the patch, or the first key that isn't valid JSON. */
function parseDrafts(drafts: Record<EditableKey, string>): {
  patch: BrandProfileSections | null
  badKey: EditableKey | null
} {
  const patch: Record<string, unknown> = {}
  for (const key of EDITABLE) {
    try {
      patch[key] = JSON.parse(drafts[key])
    } catch {
      return { patch: null, badKey: key }
    }
  }
  return { patch: patch as BrandProfileSections, badKey: null }
}

function statusStyle(status: string): { label: string; className: string } {
  if (status === 'approved') return { label: 'Approved', className: 'bg-[#E7F7EF] text-[#1f8f5f]' }
  if (status === 'rejected') return { label: 'Rejected', className: 'bg-[#FDECEC] text-[#c0392b]' }
  return { label: 'Pending review', className: 'bg-[#FEF7E6] text-[#a37a12]' }
}

export function BrandProfileView(): JSX.Element {
  const { orgSlug, email, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = useBrandProfile(orgSlug, email)
  const mutations = useBrandProfileMutations(orgSlug, email)

  return (
    <>
      <div className="cat-rise border-b border-[var(--cat-border)] pb-4">
        <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">
          Brand Profile
        </h1>
        <p className="text-[13px] text-[var(--cat-ink-2)]">
          The AI&apos;s durable memory of this brand. Review, edit, then approve - only approved
          profiles are used in AI requests.
        </p>
      </div>

      <div className="-mx-3 mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto px-3">
        <DataState
          isLoading={projectLoading || isLoading}
          isError={isError}
          isEmpty={!orgSlug || !data}
          emptyTitle="No brand profile yet"
          emptyHint="Run an analysis for this project - a draft profile is generated automatically, then review it here."
        >
          {data && (
            <BrandProfileBody
              key={`${data.status}:${data.last_verified_at ?? ''}`}
              profile={data}
              mutations={mutations}
            />
          )}
        </DataState>
      </div>
    </>
  )
}

function BrandProfileBody({
  profile,
  mutations,
}: {
  profile: BrandProfile
  mutations: Mutations
}): JSX.Element {
  const [drafts, setDrafts] = useState<Record<EditableKey, string>>(() => initDrafts(profile))
  const [error, setError] = useState<string | null>(null)

  const handleSave = (): void => {
    const { patch, badKey } = parseDrafts(drafts)
    if (badKey) {
      setError(`"${LABELS[badKey]}" is not valid JSON.`)
      return
    }
    setError(null)
    if (patch) mutations.save(patch)
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <ReviewBar
        profile={profile}
        busy={mutations.reviewing}
        onApprove={() => mutations.review('approve')}
        onReject={() => mutations.review('reject')}
      />
      {EDITABLE.map(key => (
        <SectionEditor
          key={key}
          label={LABELS[key]}
          value={drafts[key]}
          big={key === 'competitors' || key === 'canonical_facts'}
          onChange={value => setDrafts(prev => ({ ...prev, [key]: value }))}
        />
      ))}
      <SourcesCard sources={profile.sources} />
      <SaveBar error={error} saving={mutations.saving} onSave={handleSave} />
    </div>
  )
}

function ReviewBar({
  profile,
  busy,
  onApprove,
  onReject,
}: {
  profile: BrandProfile
  busy: boolean
  onApprove: () => void
  onReject: () => void
}): JSX.Element {
  return (
    <div className="cat-card-edge flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] px-4 py-3">
      <StatusMeta profile={profile} />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-[var(--cat-border)] px-3 text-[13px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)] disabled:opacity-50"
        >
          <XCircle size={16} strokeWidth={2.2} />
          Reject
        </button>
        <PrimaryButton icon={BadgeCheck} onClick={onApprove} disabled={busy}>
          Approve
        </PrimaryButton>
      </div>
    </div>
  )
}

function StatusMeta({ profile }: { profile: BrandProfile }): JSX.Element {
  const badge = statusStyle(profile.status)
  const verified = profile.last_verified_at
    ? new Date(profile.last_verified_at).toLocaleString('en-US', { timeZone: 'UTC' })
    : '-'
  return (
    <div className="flex items-center gap-3 text-[13px] text-[var(--cat-ink-2)]">
      <span className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${badge.className}`}>
        {badge.label}
      </span>
      <span>Confidence: {Math.round((profile.confidence ?? 0) * 100)}%</span>
      <span>Last verified: {verified}</span>
    </div>
  )
}

function SectionEditor({
  label,
  value,
  big,
  onChange,
}: {
  label: string
  value: string
  big: boolean
  onChange: (value: string) => void
}): JSX.Element {
  return (
    <section className="cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-4">
      <label className="mb-2 block text-[13px] font-semibold text-[var(--cat-ink)]">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        rows={big ? 8 : 6}
        className="w-full resize-y rounded-md border border-[var(--cat-border)] bg-[var(--cat-canvas)] p-2.5 font-mono text-[12px] leading-relaxed text-[var(--cat-ink)] focus:border-[#e04a3d] focus:outline-none"
      />
    </section>
  )
}

function SourcesCard({ sources }: { sources: Record<string, unknown> }): JSX.Element {
  return (
    <section className="cat-card-edge rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-4">
      <p className="mb-2 text-[13px] font-semibold text-[var(--cat-ink)]">Sources (read-only)</p>
      <pre className="overflow-x-auto rounded-md bg-[var(--cat-canvas)] p-2.5 font-mono text-[12px] text-[var(--cat-ink-2)]">
        {JSON.stringify(sources ?? {}, null, 2)}
      </pre>
    </section>
  )
}

function SaveBar({
  error,
  saving,
  onSave,
}: {
  error: string | null
  saving: boolean
  onSave: () => void
}): JSX.Element {
  return (
    <div className="flex items-center justify-end gap-3">
      {error && <span className="text-[13px] text-[#c0392b]">{error}</span>}
      <PrimaryButton onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </PrimaryButton>
    </div>
  )
}

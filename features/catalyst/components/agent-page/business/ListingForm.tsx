'use client'

import { useState } from 'react'
import { z } from 'zod'

import {
  SECONDARY_BUTTON,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { EditField } from '@/features/catalyst/components/agent-page/approvals/EditField'
import { HoursEditor } from '@/features/catalyst/components/agent-page/business/HoursEditor'
import { PhotoUploader } from '@/features/catalyst/components/agent-page/business/PhotoUploader'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import type { BusinessProfile } from '@/hooks/useBusinessProfile'
import {
  DESCRIPTION_MAX,
  type BusinessDraft,
  type BusinessProfileReport,
} from '@/lib/api/agent-mode-business-profile'
import { Sparkles } from '@/lib/icons'

interface ListingFormProps {
  profile: BusinessProfile
  report: BusinessProfileReport
}

const MAX_EXTRA = 9
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'

/** Same rules as ranking-be, checked before saving so mistakes show at once. */
const draftRules = z.object({
  name: z.string().max(100),
  phone: z.union([
    z.literal(''),
    z.string().regex(/^[+0-9 ()-]{6,25}$/, 'Use digits, spaces, + ( ) or -.'),
  ]),
  website: z.union([
    z.literal(''),
    z.string().url('Enter a full web address, starting with https://'),
  ]),
  description: z.string().max(DESCRIPTION_MAX),
  extraCategories: z.array(z.string()).max(MAX_EXTRA, `Up to ${MAX_EXTRA} extra categories.`),
})

function splitList(text: string): string[] {
  return text
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function firstProblem(draft: BusinessDraft): string | null {
  const result = draftRules.safeParse(draft)
  return result.success ? null : (result.error.issues[0]?.message ?? 'Check the details.')
}

interface FieldsProps {
  draft: BusinessDraft
  update: (change: Partial<BusinessDraft>) => void
}

function AddressFields({ draft, update }: FieldsProps): JSX.Element {
  return (
    <>
      <EditField label="Address" value={draft.address} onChange={address => update({ address })} />
      <label className="flex items-center gap-2 text-[12px] text-[var(--cat-ink-2)]">
        <input
          type="checkbox"
          checked={draft.hideAddress}
          onChange={event => update({ hideAddress: event.target.checked })}
          className="accent-[#e04a3d]"
        />
        I visit customers; don’t show my address
      </label>
      {draft.hideAddress && (
        <EditField
          label="Areas you serve"
          value={draft.serviceArea}
          onChange={serviceArea => update({ serviceArea })}
          hint="Cities or regions, separated by commas."
        />
      )}
    </>
  )
}

function BusinessFields({ draft, update }: FieldsProps): JSX.Element {
  return (
    <section className="flex flex-col gap-3">
      <h3 className={SECTION_TITLE}>Your business</h3>
      <EditField
        label="Business name"
        value={draft.name}
        maxLength={100}
        onChange={name => update({ name })}
        hint="Your real-world name, exactly as customers see it. Google suspends listings that add keywords."
      />
      <EditField
        label="Main category"
        value={draft.primaryCategory}
        onChange={primaryCategory => update({ primaryCategory })}
        hint="For example: Marketing agency, Software company, Bakery."
      />
      <EditField
        label="Other categories"
        value={draft.extraCategories.join(', ')}
        onChange={text => update({ extraCategories: splitList(text) })}
        hint={`Optional, up to ${MAX_EXTRA}, separated by commas.`}
      />
      <AddressFields draft={draft} update={update} />
      <EditField label="Phone" value={draft.phone} onChange={phone => update({ phone })} />
      <EditField label="Website" value={draft.website} onChange={website => update({ website })} />
    </section>
  )
}

interface DescriptionProps extends FieldsProps {
  profile: BusinessProfile
}

function DescriptionField({ draft, update, profile }: DescriptionProps): JSX.Element {
  const suggest = async (): Promise<void> => {
    const idea = await profile.suggest()
    if (!idea) return
    update({
      description: idea.description || draft.description,
      primaryCategory: draft.primaryCategory || (idea.categories[0] ?? ''),
    })
  }
  return (
    <section className="flex flex-col gap-2">
      <EditField
        label="Description"
        value={draft.description}
        rows={6}
        maxLength={DESCRIPTION_MAX}
        onChange={description => update({ description })}
        hint="What you offer and who you serve. No links, prices or offers (Google’s rules)."
      />
      <button
        type="button"
        disabled={profile.suggesting}
        onClick={() => void suggest()}
        className={`${SECONDARY_BUTTON} self-start`}
      >
        <Sparkles size={14} aria-hidden="true" />
        {profile.suggesting ? 'Writing…' : 'Draft it for me'}
      </button>
    </section>
  )
}

/** The facts and photos for a new Google Business Profile, saved as a draft. */
export function ListingForm({ profile, report }: ListingFormProps): JSX.Element {
  const [draft, setDraft] = useState<BusinessDraft>(report.draft)
  const [problem, setProblem] = useState<string | null>(null)
  const update = (change: Partial<BusinessDraft>): void => setDraft(d => ({ ...d, ...change }))
  const save = (): void => {
    const found = firstProblem(draft)
    setProblem(found)
    if (!found) profile.saveDraft(draft)
  }
  return (
    <div className="flex flex-col gap-6">
      <BusinessFields draft={draft} update={update} />
      <HoursEditor hours={draft.hours} onChange={hours => update({ hours })} />
      <DescriptionField draft={draft} update={update} profile={profile} />
      {report.photosEnabled ? (
        <PhotoUploader profile={profile} photos={report.photos} />
      ) : (
        <p className={MUTED}>Photo uploads aren’t switched on for your account yet.</p>
      )}
      <div className="flex items-center gap-3">
        <PrimaryButton type="button" disabled={profile.saving} onClick={save}>
          {profile.saving ? 'Saving…' : 'Save details'}
        </PrimaryButton>
        {profile.saved && !profile.saving && (
          <span role="status" className={MUTED}>
            Saved
          </span>
        )}
      </div>
      {problem && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {problem}
        </p>
      )}
    </div>
  )
}

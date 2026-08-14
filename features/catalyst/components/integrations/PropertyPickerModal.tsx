'use client'

import { useState } from 'react'

import { GAPropertyPicker } from '@/features/integrations/components/GAPropertyPicker'
import { GscSitePicker } from '@/features/integrations/components/GscSitePicker'
import { CheckCircle2, Loader2, X } from '@/lib/icons'

/** Which Google provider's property is being chosen. */
export type PickerProvider = 'google-analytics' | 'search-console'

const COPY: Record<PickerProvider, { title: string; description: string; syncing: string }> = {
  'google-analytics': {
    title: 'Choose a GA4 property',
    description: 'Pick the property this brand reads its traffic from.',
    syncing: 'the analytics cards',
  },
  'search-console': {
    title: 'Choose a Search Console property',
    description: 'Pick the property this brand reads its search data from.',
    syncing: 'the Search Console cards',
  },
}

function ModalHeader({
  title,
  description,
  onClose,
}: {
  title: string
  description: string
  onClose: () => void
}): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[16px] font-semibold text-[var(--cat-ink)]">{title}</h2>
        <p className="mt-0.5 text-[12px] text-[var(--cat-ink-3)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        <X size={16} />
      </button>
    </div>
  )
}

/** Bound and syncing. Stays in the modal so the page behind it never changes. */
function SavedNote({ syncing, onClose }: { syncing: string; onClose: () => void }): JSX.Element {
  return (
    <div className="mt-4 flex flex-col items-start gap-2">
      <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1e8a5c]">
        <CheckCircle2 className="h-4 w-4" />
        Property connected
      </p>
      <p className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--cat-ink-2)]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        First sync in progress, usually 1-2 minutes.
      </p>
      <p className="text-[12px] text-[var(--cat-ink-3)]">
        You can keep working; {syncing} fill in automatically as data lands.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-1 inline-flex h-8 items-center rounded-md bg-[#e04a3d] px-3.5 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
      >
        Done
      </button>
    </div>
  )
}

interface PropertyPickerModalProps {
  provider: PickerProvider
  email: string
  onClose: () => void
}

/**
 * Property selection for GA4 and Search Console, on the Integrations page.
 *
 * Both pickers used to be full standalone routes outside the dashboard shell
 * (`/settings/integrations/.../property`), so choosing a property threw the user
 * onto a bare white page with no nav, no brand context and no way back except a
 * "Go to dashboard" button. The step belongs beside the card it configures.
 *
 * The pickers themselves are unchanged — they already took `email` + `onDone`,
 * so they drop straight in here and stay shared with the OAuth callback route
 * that Google redirects to (which has to remain a standalone page).
 */
export function PropertyPickerModal({
  provider,
  email,
  onClose,
}: PropertyPickerModalProps): JSX.Element {
  const [saved, setSaved] = useState(false)
  const copy = COPY[provider]

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-5 shadow-xl">
        <ModalHeader title={copy.title} description={copy.description} onClose={onClose} />
        {saved ? (
          <SavedNote syncing={copy.syncing} onClose={onClose} />
        ) : (
          <div className="mt-4">
            {provider === 'google-analytics' ? (
              <GAPropertyPicker email={email} onDone={() => setSaved(true)} />
            ) : (
              <GscSitePicker email={email} onDone={() => setSaved(true)} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

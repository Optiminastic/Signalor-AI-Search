'use client'

import { useEffect, useState } from 'react'

import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { useCreateBrand } from '@/hooks/useCreateBrand'
import { Loader2, X } from '@/lib/icons'

interface NewBrandModalProps {
  onClose: () => void
}

interface FieldProps {
  label: string
  hint: string
  value: string
  placeholder: string
  autoFocus?: boolean
  onChange: (v: string) => void
}

function Field({ label, hint, value, placeholder, autoFocus, onChange }: FieldProps): JSX.Element {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-[var(--cat-ink)]">{label}</span>
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-3 text-[13px] text-[var(--cat-ink)] placeholder:text-[var(--cat-ink-3)] focus:border-[#e04a3d] focus:outline-none"
      />
      <span className="text-[11px] text-[var(--cat-ink-3)]">{hint}</span>
    </label>
  )
}

function ModalHeader({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 id="new-brand-title" className="text-[16px] font-semibold text-[var(--cat-ink)]">
          New brand
        </h2>
        <p className="mt-0.5 text-[12px] text-[var(--cat-ink-3)]">
          Add a domain to this workspace. Its first analysis starts from the brand&rsquo;s
          dashboard.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="grid h-7 w-7 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        <X size={16} />
      </button>
    </div>
  )
}

function SubmitButton({
  disabled,
  isPending,
  onClick,
}: {
  disabled: boolean
  isPending: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <PrimaryButton
      wrapperClassName="mt-1 w-full"
      className="w-full justify-center"
      disabled={disabled}
      onClick={onClick}
    >
      {isPending ? (
        <>
          <Loader2 size={14} className="animate-spin" /> Creating…
        </>
      ) : (
        'Create brand'
      )}
    </PrimaryButton>
  )
}

function BrandForm({ onCreated }: { onCreated: () => void }): JSX.Element {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const { submit, isPending, error } = useCreateBrand(onCreated)
  const ready = name.trim().length > 0 && url.trim().length > 0

  return (
    <div className="mt-4 flex flex-col gap-3">
      <Field
        label="Brand name"
        hint="How it appears in the workspace switcher."
        value={name}
        placeholder="Acme"
        autoFocus
        onChange={setName}
      />
      <Field
        label="Website"
        hint="The domain to analyse. https:// is added if you leave it off."
        value={url}
        placeholder="acme.com"
        onChange={setUrl}
      />
      <SubmitButton
        disabled={!ready || isPending}
        isPending={isPending}
        onClick={() => submit({ name, url })}
      />
      {error && <p className="text-[12px] text-[#E5484D]">{error}</p>}
    </div>
  )
}

/** Close on Escape so the dialog behaves like the rest of the dashboard overlays. */
function useEscapeKey(onClose: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
}

export function NewBrandModal({ onClose }: NewBrandModalProps): JSX.Element {
  useEscapeKey(onClose)
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-brand-title"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-5 shadow-xl"
      >
        <ModalHeader onClose={onClose} />
        <BrandForm onCreated={onClose} />
      </div>
    </div>
  )
}

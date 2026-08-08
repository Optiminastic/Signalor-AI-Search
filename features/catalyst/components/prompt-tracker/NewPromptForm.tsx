'use client'

import { useState } from 'react'

import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { Plus } from '@/lib/icons'

const MAX_PROMPT_LENGTH = 2000

interface FormActionsProps {
  canSubmit: boolean
  isAdding: boolean
  onSubmit: () => void
  onClose: () => void
}

function FormActions({ canSubmit, isAdding, onSubmit, onClose }: FormActionsProps): JSX.Element {
  return (
    <div className="mt-2 flex items-center gap-2">
      <p className="text-[11px] text-[var(--cat-ink-3)]">
        Every engine answers it within a minute, then it is re-checked on each analysis.
      </p>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-[34px] items-center rounded-md border border-[var(--cat-border)] px-3 text-[13px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]"
        >
          Cancel
        </button>
        <PrimaryButton icon={Plus} disabled={!canSubmit || isAdding} onClick={onSubmit}>
          {isAdding ? 'Tracking…' : 'Track prompt'}
        </PrimaryButton>
      </div>
    </div>
  )
}

interface NewPromptFormProps {
  isAdding: boolean
  onSubmit: (text: string) => void
  onClose: () => void
}

/** Inline composer for tracking a new prompt. */
export function NewPromptForm({ isAdding, onSubmit, onClose }: NewPromptFormProps): JSX.Element {
  const [text, setText] = useState('')
  const trimmed = text.trim()

  const submit = (): void => {
    if (!trimmed || isAdding) return
    onSubmit(trimmed)
    setText('')
    onClose()
  }

  return (
    <div className="cat-rise cat-card-edge mb-3 rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
        }}
        rows={2}
        autoFocus
        placeholder='e.g. "What are the best GEO tools for e-commerce brands?"'
        className="w-full resize-none rounded-md border border-[var(--cat-border)] bg-transparent px-3 py-2 text-[13px] text-[var(--cat-ink)] placeholder:text-[var(--cat-ink-3)] focus:border-[#e04a3d] focus:outline-none"
      />
      <FormActions
        canSubmit={Boolean(trimmed)}
        isAdding={isAdding}
        onSubmit={submit}
        onClose={onClose}
      />
    </div>
  )
}

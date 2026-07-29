'use client'

import { useState } from 'react'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { useAnswerBlock } from '@/hooks/usePromptCoverage'
import type { AnswerBlock } from '@/lib/api/prompts'
import { Check, Copy, Loader2, Sparkles } from '@/lib/icons'

interface CopyButtonProps {
  value: string
  label: string
}

function CopyButton({ value, label }: CopyButtonProps): JSX.Element {
  const [copied, setCopied] = useState(false)

  async function copy(): Promise<void> {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--cat-ink-2)] transition-colors hover:text-[var(--cat-ink)]"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : label}
    </button>
  )
}

function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: JSX.Element
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="mt-3 border-t border-[var(--cat-border)] pt-2 first:mt-0 first:border-0 first:pt-0">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide text-[var(--cat-ink-3)] uppercase">
          {title}
        </span>
        {action}
      </div>
      {children}
    </div>
  )
}

const CODE_CLASS =
  'max-h-40 overflow-auto rounded-sm bg-[var(--cat-hover)] p-2 text-[11px] leading-relaxed text-[var(--cat-ink-2)]'

/** Where the block goes — the difference between advice and an instruction. */
function Placement({ draft }: { draft: AnswerBlock }): JSX.Element {
  if (draft.mode !== 'add_section') {
    return (
      <p className="mb-2 text-[11px] text-[var(--cat-ink-3)]">
        No page answers this yet. This is the opening for a new page.
      </p>
    )
  }
  return (
    <p className="mb-2 text-[11px] text-[var(--cat-ink-3)]">
      Add this section to <span className="text-[var(--cat-ink-2)]">{draft.target_url}</span>
      {draft.placement && ` — ${draft.placement}`}
    </p>
  )
}

function Prose({ draft }: { draft: AnswerBlock }): JSX.Element {
  return (
    <>
      <Section title={draft.mode === 'add_section' ? 'Heading (h2)' : 'Heading (h1)'}>
        <p className="text-[14px] font-semibold text-[var(--cat-ink)]">{draft.heading}</p>
      </Section>

      <Section title="Answer" action={<CopyButton value={draft.answer} label="Copy" />}>
        <p className="text-[13px] leading-relaxed text-[var(--cat-ink)]">{draft.answer}</p>
      </Section>

      {draft.supporting_points.length > 0 && (
        <Section title="Supporting points">
          <ul className="list-disc pl-4 text-[13px] leading-relaxed text-[var(--cat-ink-2)]">
            {draft.supporting_points.map(point => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </Section>
      )}

      {draft.faqs.length > 0 && (
        <Section title="Follow-up questions">
          <dl className="text-[13px] leading-relaxed">
            {draft.faqs.map(faq => (
              <div key={faq.question} className="mb-1.5 last:mb-0">
                <dt className="font-medium text-[var(--cat-ink)]">{faq.question}</dt>
                <dd className="text-[var(--cat-ink-2)]">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}
    </>
  )
}

function Snippets({ draft }: { draft: AnswerBlock }): JSX.Element {
  return (
    <>
      {draft.html_snippet && (
        <Section title="HTML" action={<CopyButton value={draft.html_snippet} label="Copy HTML" />}>
          <pre className={CODE_CLASS}>{draft.html_snippet}</pre>
        </Section>
      )}
      {draft.faq_jsonld && (
        <Section
          title="FAQ schema"
          action={<CopyButton value={draft.faq_jsonld} label="Copy JSON-LD" />}
        >
          <pre className={CODE_CLASS}>{draft.faq_jsonld}</pre>
        </Section>
      )}
    </>
  )
}

function Draft({ draft }: { draft: AnswerBlock }): JSX.Element {
  return (
    <div className="mt-2">
      <Placement draft={draft} />
      <Prose draft={draft} />
      <Snippets draft={draft} />
    </div>
  )
}

interface AnswerBlockPanelProps {
  slug: string | undefined
  trackId: number
  promptText: string
}

/**
 * Draft the passage that makes a page answer this prompt.
 *
 * Generated on click, never on render: each draft is a billed model call, so an
 * auto-draft for every prompt on every page load would charge for work nobody
 * reads.
 */
export function AnswerBlockPanel({
  slug,
  trackId,
  promptText,
}: AnswerBlockPanelProps): JSX.Element {
  const { draft, generate, isGenerating, isError } = useAnswerBlock(slug)

  let label = 'Draft answer'
  if (isGenerating) label = 'Drafting…'
  else if (draft) label = 'Draft again'

  return (
    <Card>
      <CardHead title="Answer block" />
      <p className="text-[12px] leading-relaxed text-[var(--cat-ink-2)]">
        Draft the passage that answers “{promptText}” so engines can extract and cite it.
      </p>

      <div className="mt-2">
        <PrimaryButton
          icon={isGenerating ? Loader2 : Sparkles}
          disabled={isGenerating || !slug}
          onClick={() => generate(trackId)}
        >
          {label}
        </PrimaryButton>
      </div>

      {isError && (
        <p className="mt-2 text-[12px] text-[var(--cat-ink-2)]">
          Could not draft an answer just now. Try again in a moment.
        </p>
      )}

      {draft && <Draft draft={draft} />}
    </Card>
  )
}

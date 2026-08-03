'use client'

import type { HighlightTerm } from '@/features/catalyst/brand-terms'

/**
 * Renders an AI engine answer with its original structure — headings, bullets and
 * `**bold**` runs — and marks every place the brand surfaces.
 *
 * Deliberately builds React elements rather than HTML: the text is model output
 * relayed through our API, so `dangerouslySetInnerHTML` (even via `marked`) would
 * be an injection vector. Everything here is escaped by React automatically.
 */

const HEADING_RE = /^#{1,6}\s+/
const BULLET_RE = /^[-*]\s+/

const MARK_CLASS: Record<HighlightTerm['kind'], string> = {
  // Domain cited = the site is a source. Green, matching the "Cited" chip.
  domain:
    'rounded-[2px] bg-[rgba(47,190,126,0.18)] px-0.5 font-semibold text-[#1e8a5c] underline decoration-[#1e8a5c]/40 underline-offset-2',
  // Name only = mentioned, not sourced. Brand tint, deliberately weaker.
  name: 'rounded-[2px] bg-[rgba(224,74,61,0.12)] px-0.5 font-semibold text-[#c53f34]',
}

const TITLE: Record<HighlightTerm['kind'], string> = {
  domain: 'Your site cited here',
  name: 'Your brand mentioned here',
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** One case-insensitive pattern for every term, longest alternative first. */
function buildPattern(terms: HighlightTerm[]): RegExp | null {
  if (terms.length === 0) return null
  return new RegExp(`(${terms.map(t => escapeRegExp(t.value)).join('|')})`, 'gi')
}

function kindOf(match: string, terms: HighlightTerm[]): HighlightTerm['kind'] {
  const lower = match.toLowerCase()
  return terms.find(t => t.value.toLowerCase() === lower)?.kind ?? 'name'
}

/** Wraps brand hits in a tinted mark; plain text passes through untouched. */
function Highlighted({ text, terms }: { text: string; terms: HighlightTerm[] }): JSX.Element {
  const pattern = buildPattern(terms)
  if (!pattern) return <>{text}</>
  return (
    <>
      {text.split(pattern).map((part, i) => {
        // Split with a capture group puts matches at odd indices.
        if (i % 2 === 0) return <span key={i}>{part}</span>
        const kind = kindOf(part, terms)
        return (
          <mark key={i} title={TITLE[kind]} className={MARK_CLASS[kind]}>
            {part}
          </mark>
        )
      })}
    </>
  )
}

/** Splits on `**bold**`; with a capture group, odd indices are the bold runs. */
function InlineBold({ text, terms }: { text: string; terms: HighlightTerm[] }): JSX.Element {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-[var(--cat-ink)]">
            <Highlighted text={part} terms={terms} />
          </strong>
        ) : (
          <span key={i}>
            <Highlighted text={part} terms={terms} />
          </span>
        ),
      )}
    </>
  )
}

export interface ResponseTextProps {
  text: string
  /** Brand name / domains to mark up. Omit to render the answer plain. */
  terms?: HighlightTerm[]
}

export function ResponseText({ text, terms = [] }: ResponseTextProps): JSX.Element {
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (HEADING_RE.test(trimmed)) {
          return (
            <p key={i} className="text-[12px] font-semibold text-[var(--cat-ink)]">
              <Highlighted text={trimmed.replace(HEADING_RE, '')} terms={terms} />
            </p>
          )
        }
        const isBullet = BULLET_RE.test(trimmed)
        return (
          <p
            key={i}
            className={`text-[12px] leading-relaxed text-[var(--cat-ink-2)] ${isBullet ? 'pl-3' : ''}`}
          >
            {isBullet && <span className="text-[var(--cat-ink-3)]">• </span>}
            <InlineBold text={trimmed.replace(BULLET_RE, '')} terms={terms} />
          </p>
        )
      })}
    </div>
  )
}

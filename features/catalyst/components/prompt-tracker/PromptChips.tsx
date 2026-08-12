// Small status pills shared by the prompt row and its detail sheet.

import { Chip } from '@/components/base/badges/chip'

/**
 * Colour + meaning per taxonomy value.
 *
 * Two different axes land side by side on the same row, so they must not read as
 * one flat set: `intent` is what the asker wants (brand / informational /
 * transactional) and `prompt_type` is who the question names (organic / branded
 * / competitive). Hue separates the axes — intent runs cool, type runs warm —
 * and the tooltip carries the definition, because "organic vs branded" is not
 * self-evident from the word alone.
 */
interface TagStyle {
  color: string
  hint: string
}

const TAG_STYLES: Record<string, TagStyle> = {
  // intent — cool hues
  informational: { color: '#2563EB', hint: 'Asks how something works. Top of funnel.' },
  transactional: { color: '#0891B2', hint: 'Ready to choose or buy. Bottom of funnel.' },
  brand: { color: '#7C3AED', hint: 'The asker already names your brand.' },
  // prompt type — warm hues
  organic: { color: '#C2410C', hint: 'No brand named. Anyone could be the answer.' },
  branded: { color: '#A16207', hint: 'Names your brand.' },
  competitive: { color: '#BE123C', hint: 'Names a competitor.' },
}

const NEUTRAL: TagStyle = { color: '#6B7280', hint: '' }

/** The colour a taxonomy value is drawn in, so chips and charts never drift apart. */
export function TAG_COLOR(value: string): string {
  return (TAG_STYLES[value.trim().toLowerCase()] ?? NEUTRAL).color
}

/** One taxonomy pill — a prompt's intent, or its type. */
export function PromptTag({ value }: { value: string }): JSX.Element | null {
  if (!value) return null
  const style = TAG_STYLES[value.trim().toLowerCase()] ?? NEUTRAL
  return (
    <span
      title={style.hint || undefined}
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap capitalize"
      style={{ color: style.color, backgroundColor: `${style.color}14` }}
    >
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: style.color }} />
      {value}
    </span>
  )
}

/* Tone per sentiment label. Lives here so the prompt table and the response
   detail cannot drift apart on what "negative" looks like. */
const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#1e8a5c',
  negative: '#BE123C',
  neutral: '#6B7280',
}

/** The colour a sentiment reads in, or null when the engine scored none. */
export function sentimentColor(value: string): string | null {
  return SENTIMENT_COLORS[value.trim().toLowerCase()] ?? null
}

interface MentionIndicatorProps {
  mentioned: boolean
  /** Rank the brand held in this answer; 0 or null when the engine gave none. */
  position?: number | null
  /** `md` for the detail header, `sm` for a table cell. */
  size?: 'sm' | 'md'
}

/** Missing, mentioned somewhere, or mentioned at a known rank. */
type MentionState = 'missing' | 'mentioned' | 'ranked'

function mentionState(mentioned: boolean, position?: number | null): MentionState {
  if (!mentioned) return 'missing'
  return typeof position === 'number' && position > 0 ? 'ranked' : 'mentioned'
}

function mentionLabel(state: MentionState, position?: number | null): string {
  if (state === 'missing') return 'Missing'
  if (state === 'ranked') return `#${position}`
  return 'Mentioned'
}

function mentionTitle(state: MentionState, position?: number | null): string {
  if (state === 'missing') return 'This answer did not mention the brand'
  if (state === 'ranked') return `Brand placed #${position} in this answer`
  return 'Brand mentioned, no rank given'
}

/**
 * Whether one answer named the brand, and where it placed.
 *
 * Deliberately not a percentage. Every percentage in this product is a share
 * across many answers; a single answer either mentions the brand or it does
 * not, so a per-answer score would have to be invented. Rank is the one extra
 * fact the engines do return, so it is shown whenever present — "#2" says far
 * more than "yes" about how well that answer went.
 */
export function MentionIndicator({
  mentioned,
  position,
  size = 'sm',
}: MentionIndicatorProps): JSX.Element {
  const state = mentionState(mentioned, position)
  const color = mentioned ? '#1e8a5c' : 'var(--cat-ink-3)'
  const label = mentionLabel(state, position)
  const title = mentionTitle(state, position)

  return (
    <span className="flex items-center gap-2 whitespace-nowrap" title={title}>
      <span
        aria-hidden
        className={`${size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'} shrink-0 rounded-full border-[2.5px]`}
        style={{ borderColor: color, backgroundColor: mentioned ? `${color}1f` : 'transparent' }}
      />
      <span
        className={`${size === 'md' ? 'text-[13px]' : 'text-[12.5px]'} font-semibold tabular-nums`}
        style={{ color }}
      >
        {label}
      </span>
    </span>
  )
}

/** Green when the brand's own domain was cited, muted otherwise. */
export function CitedChip({ cited }: { cited: boolean }): JSX.Element {
  return cited ? (
    <Chip variant="caption" color="lime" className="gap-1">
      <span className="h-1 w-1 rounded-full bg-current" />
      Cited
    </Chip>
  ) : (
    <Chip variant="caption" color="neutral" className="gap-1">
      <span className="h-1 w-1 rounded-full bg-current" />
      Not cited
    </Chip>
  )
}

// Small status pills shared by the prompt row and its detail sheet.

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

/** Green when the brand's own domain was cited, muted otherwise. */
export function CitedChip({ cited }: { cited: boolean }): JSX.Element {
  return cited ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(47,190,126,0.12)] px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-[#1e8a5c]">
      <span className="h-1 w-1 rounded-full bg-[#1e8a5c]" />
      Cited
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cat-hover)] px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-[var(--cat-ink-3)]">
      <span className="h-1 w-1 rounded-full bg-[var(--cat-ink-3)]" />
      Not cited
    </span>
  )
}

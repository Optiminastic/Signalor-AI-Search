import type { LiveBot, LiveSource } from '@/lib/api/live-visitors'
import { engineFromHost } from '@/lib/geo/engine-domains'

/**
 * Pure mappers for the live-visitors popover.
 *
 * Kept out of the components so the classification rules — which is the part
 * with actual logic — can be unit tested without rendering anything.
 */

/**
 * The crawler's bot key → the engine whose logo represents it.
 *
 * `BOT_LABELS` on the backend gives display text ("GPT Bot (OpenAI)"), which no
 * logo lookup will ever match. Several bots belong to one engine, so this is
 * many-to-one by design.
 */
const BOT_ENGINES: Record<string, string> = {
  gptbot: 'chatgpt',
  'oai-searchbot': 'chatgpt',
  'chatgpt-user': 'chatgpt',
  claudebot: 'claude',
  'claude-user': 'claude',
  'claude-searchbot': 'claude',
  'anthropic-ai': 'claude',
  perplexitybot: 'perplexity',
  'perplexity-user': 'perplexity',
  'google-extended': 'gemini',
  googleother: 'google',
  grok: 'grok',
  deepseek: 'deepseek',
  mistral: 'llama',
}

/** Engine key for a bot, or null when we have no mark for it. */
export function engineForBot(bot: string): string | null {
  return BOT_ENGINES[bot] ?? null
}

/** GA4 placeholders that carry no source information. */
const NO_SOURCE = new Set(['(direct)', '(not set)', '(none)', 'direct', ''])

export interface ClassifiedSource extends LiveSource {
  /** Set when the referrer is an AI answer engine — the signal we care about. */
  engine: string | null
}

/**
 * Split today's sources into AI-engine referrals and everything else.
 *
 * AI referrals lead regardless of volume: in an answer-engine product, three
 * visits from ChatGPT are more interesting than three hundred from Google.
 */
export function classifySources(rows: LiveSource[]): {
  ai: ClassifiedSource[]
  other: ClassifiedSource[]
} {
  const ai: ClassifiedSource[] = []
  const other: ClassifiedSource[] = []
  for (const row of rows) {
    const raw = row.source.trim().toLowerCase()
    const engine = NO_SOURCE.has(raw) ? null : engineFromHost(row.source)
    // `google` is search, not an answer engine — it must not inflate the AI cut.
    if (engine && engine !== 'google' && engine !== 'bing') ai.push({ ...row, engine })
    else other.push({ ...row, engine: null })
  }
  return { ai, other }
}

/** "2m ago" / "just now" — the popover has no room for a timestamp. */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return ''
  const mins = Math.floor((now - then) / 60000)
  if (mins <= 0) return 'just now'
  if (mins === 1) return '1m ago'
  return `${mins}m ago`
}

/**
 * "GPT Bot (OpenAI)" → "GPT Bot".
 *
 * The row already shows the vendor's logo, so the parenthetical is duplicated
 * information — and it is expensive here: it crowds out the path, which is the
 * genuinely new fact ("the crawler read /pricing").
 */
export function shortBotLabel(label: string): string {
  return label.replace(/\s*\([^)]*\)\s*$/, '').trim() || label
}

export interface BotRow extends LiveBot {
  engine: string | null
  when: string
  /** Vendor suffix stripped — see `shortBotLabel`. */
  short: string
}

export function botRows(rows: LiveBot[], now?: number): BotRow[] {
  return rows.map(row => ({
    ...row,
    engine: engineForBot(row.bot),
    when: relativeTime(row.last_seen, now),
    short: shortBotLabel(row.label),
  }))
}

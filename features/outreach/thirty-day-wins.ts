import type { OutreachReport } from '@/lib/api/outreach'

/** Distinct answer-engine labels as a natural list ("ChatGPT, Claude and Perplexity"). */
function engineList(report: OutreachReport): string {
  const labels = [...new Set(report.prompts.flatMap(p => p.engines.map(e => e.label)))].filter(
    Boolean,
  )
  if (labels.length === 0) return 'ChatGPT, Claude and Perplexity'
  if (labels.length === 1) return labels[0]
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

/**
 * The three concrete wins Signalor pitches for the next 30 days, each grounded
 * in this benchmark's own numbers — the rivals AI cites instead, the buyer
 * prompts the brand is invisible on, and the engines measured. Replaces the old
 * generic "what would move it" advice with outcomes tied to the brand's gaps.
 * Shared by the HTML mail and the plain-text mail so they never drift.
 */
export function thirtyDayWins(report: OutreachReport): string[] {
  const brand = report.brand || 'your brand'
  const rivals = report.competitors.length
  const prompts = report.prompts_measured || report.prompts.filter(p => p.measured).length
  return [
    rivals > 0
      ? `Get ahead of the ${rivals} competitor${rivals === 1 ? '' : 's'} AI cites instead of ${brand} today.`
      : 'Claim the answers in your category before a competitor does.',
    prompts > 0
      ? `Get ${brand} cited on the ${prompts} buyer prompt${prompts === 1 ? '' : 's'} you're invisible on right now.`
      : `Get ${brand} cited on the buyer prompts that decide your shortlist.`,
    `Lift ${brand}'s visibility across ${engineList(report)} so you make the shortlist before buyers reach Google.`,
  ]
}

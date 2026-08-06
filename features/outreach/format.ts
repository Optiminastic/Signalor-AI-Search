import type { OutreachReport } from '@/lib/api/outreach'

/**
 * Plain-text renderings of a benchmark, for pasting into an email client.
 *
 * Kept pure and separate from the React tree so the wording can be tested and
 * changed without touching the page. Everything here is derived from measured
 * data — no claim is introduced at formatting time that the run did not observe.
 */

/** Prompts where the brand was absent from every engine that actually answered. */
export function lostPrompts(report: OutreachReport): string[] {
  return report.prompts.filter(p => p.measured && p.mentions === 0).map(p => p.prompt)
}

function competitorLine(report: OutreachReport): string {
  const named = report.competitors.slice(0, 3).map(c => c.domain)
  if (named.length === 0) return ''
  return named.join(', ')
}

/** One engine's outcome for a prompt, as a word. */
function engineVerdict(engine: OutreachReport['prompts'][number]['engines'][number]): string {
  if (!engine.answered) return 'n/a'
  return engine.mentioned ? 'cited' : 'not cited'
}

/** The lines describing a single prompt in the plain-text report. */
function promptLines(prompt: OutreachReport['prompts'][number]): string[] {
  if (!prompt.measured) {
    return [`  ? ${prompt.prompt}`, '      not measured — no engine returned an answer']
  }

  const marker = prompt.mentions > 0 ? '+' : '-'
  const engines = prompt.engines.map(e => `${e.label}: ${engineVerdict(e)}`).join('  |  ')
  const lines = [`  ${marker} ${prompt.prompt}`, `      ${engines}`]

  if (prompt.cited_domains.length > 0) {
    lines.push(`      cited instead: ${prompt.cited_domains.slice(0, 4).join(', ')}`)
  }
  return lines
}

/** The full benchmark, formatted for pasting under an email or into a doc. */
export function formatReport(report: OutreachReport): string {
  const brand = report.brand || report.url
  const lines: string[] = [
    `AI VISIBILITY BENCHMARK — ${brand}`,
    report.url,
    '',
    `Buyer prompts tested: ${report.prompts_total}`,
    `Measured successfully: ${report.prompts_measured}`,
    `Not cited in any AI answer: ${report.prompts_lost}`,
    '',
    'PROMPTS',
  ]

  for (const prompt of report.prompts) lines.push(...promptLines(prompt))

  if (report.competitors.length > 0) {
    lines.push('', 'SOURCES AI ENGINES CITE INSTEAD')
    for (const competitor of report.competitors) {
      const plural = competitor.prompts === 1 ? 'prompt' : 'prompts'
      lines.push(`  ${competitor.domain} — ${competitor.prompts} ${plural}`)
    }
  }

  if (report.opportunities.length > 0) {
    lines.push('', 'OPPORTUNITIES')
    for (const opportunity of report.opportunities) lines.push(`  - ${opportunity}`)
  }

  lines.push('', 'Measured across ChatGPT, Claude and Perplexity with web search enabled.')
  return lines.join('\n')
}

/** Names the one prompt the recipient can go and verify for themselves. */
function openingLine(headline: string, rivals: string, brand: string): string {
  if (!headline) {
    return 'I ran a quick check on how AI platforms answer buying questions in your category.'
  }
  const tail = rivals ? `${rivals} came up, but ${brand} didn't` : `${brand} didn't come up`
  return `I was testing how AI platforms answer “${headline}” and noticed that ${tail}.`
}

/**
 * A cold-outreach email built around one concrete, checkable finding.
 *
 * Leads with a single named prompt rather than a score: the recipient can paste
 * that prompt into ChatGPT and verify the claim in seconds, which is the whole
 * reason the benchmark is worth sending.
 */
export function formatEmail(report: OutreachReport, senderName = ''): string {
  const brand = report.brand || report.url
  const lost = lostPrompts(report)
  const headline = lost[0] ?? report.prompts[0]?.prompt ?? ''
  const rivals = competitorLine(report)

  const opening = openingLine(headline, rivals, brand)

  const scope =
    report.prompts_measured > 0
      ? `I checked ${report.prompts_measured} buyer prompts across ChatGPT, Claude and Perplexity. ${brand} wasn't cited in ${report.prompts_lost} of them.`
      : ''

  const actions = report.opportunities.slice(0, 3)

  return [
    `Subject: ${brand} isn't showing up in AI answers for your category`,
    '',
    'Hi there,',
    '',
    opening,
    ...(scope ? ['', scope] : []),
    '',
    'Buyers increasingly ask ChatGPT, Claude and Perplexity which providers to consider before they ever reach Google. Whoever gets named in those answers makes the shortlist first.',
    ...(actions.length > 0
      ? ['', 'Three things that would move it:', ...actions.map(a => `  - ${a}`)]
      : []),
    '',
    "I've put the full benchmark below — the prompts, who gets cited instead, and what to do about it. Happy to walk through it if useful.",
    '',
    'Best,',
    senderName,
    '',
    '---',
    '',
    formatReport(report),
  ].join('\n')
}

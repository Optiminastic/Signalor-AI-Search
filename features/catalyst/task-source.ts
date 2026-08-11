import type { TaskDetail } from '@/hooks/useTaskDetail'

/** One measured number shown as a stat tile, e.g. {value: "9,148", label: "Impressions"}. */
export interface TaskMetric {
  value: string
  label: string
}

export interface TaskSource {
  label: string
  /** One line on what the system measured. */
  detail: string
  /** Favicon domain for the source system's mark. */
  domain: string
}

/**
 * The system a finding came from, presented as its own product mark.
 *
 * ``source`` alone is not enough to identify it. LLM-discovered page findings
 * are stored with source="ai_insight" as well (site_findings.py sets that
 * deliberately, to keep them out of the prompt that produced them), so keying
 * on it alone labelled a sitemap crawl finding "Google Search Console" — an
 * invented provenance, which is the one thing this card exists to prevent.
 * Discovered findings carry the "site:" finding-code prefix, which separates
 * them. Takes raw strings so the tasks table rows, which have no TaskDetail,
 * resolve through the same map as the detail page.
 */
export function sourceOf(source: string, findingCode = ''): TaskSource | null {
  const siteAnalysis: TaskSource = {
    label: 'Site analysis',
    detail: 'Found on your live pages during the last crawl',
    domain: 'signalor.ai',
  }
  if (findingCode.startsWith('site:')) return siteAnalysis
  if (source === 'ai_insight') {
    return {
      label: 'Google Search Console',
      detail: 'Found by analyzing your search performance data',
      domain: 'search.google.com',
    }
  }
  if (source === 'geo_signal') {
    return {
      label: 'Prompt tracking',
      detail: 'Measured across the AI engines your buyers ask',
      domain: 'signalor.ai',
    }
  }
  if (source === 'analyzer') return siteAnalysis
  return null
}

const METRIC_LABELS: Record<string, string> = {
  impressions: 'Impressions',
  clicks: 'Clicks',
  ctr: 'CTR',
  position: 'Avg. position',
  citations: 'Citations',
  brand_mentions: 'Brand mentions',
  competitor_score: 'Competitor score',
}

/** "9148" -> "9,148"; leaves non-numeric strings untouched. */
function formatNumber(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''))
  if (!Number.isFinite(n)) return String(value)
  return n % 1 === 0
    ? n.toLocaleString('en-US')
    : n.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

/** Numeric evidence entries with a known display label, in a stable order. */
function metricsFromEvidence(evidence: Record<string, unknown>): TaskMetric[] {
  const out: TaskMetric[] = []
  for (const [key, label] of Object.entries(METRIC_LABELS)) {
    const value = evidence[key]
    if (typeof value === 'number' || (typeof value === 'string' && value !== '')) {
      out.push({ value: key === 'ctr' ? `${formatNumber(value)}%` : formatNumber(value), label })
    }
  }
  return out
}

/**
 * Search-performance numbers quoted inside the task's own text, e.g.
 * "9,148 impressions but only 27 clicks (0.3% CTR) and position 69.9".
 *
 * GSC-derived tasks bake their numbers into the description rather than the
 * evidence dict, so this re-reads them for the stat tiles. Purely
 * presentational: a description with no recognisable numbers yields nothing,
 * and nothing is ever inferred — every value shown was already in the text.
 */
function metricsFromText(text: string): TaskMetric[] {
  const out: TaskMetric[] = []
  const impressions = text.match(/([\d,]+)\s+impressions/i)
  if (impressions) out.push({ value: formatNumber(impressions[1]), label: 'Impressions' })
  const clicks = text.match(/([\d,]+)\s+clicks?\b/i)
  if (clicks) out.push({ value: formatNumber(clicks[1]), label: 'Clicks' })
  const ctr = text.match(/\(?([\d.]+)%\s+CTR\)?/i)
  if (ctr) out.push({ value: `${ctr[1]}%`, label: 'CTR' })
  const position = text.match(/position\s+(?:of\s+)?([\d.]+)/i)
  if (position) out.push({ value: position[1], label: 'Avg. position' })
  return out
}

/** All measured numbers for a task: structured evidence first, else the text. */
export function extractMetrics(task: TaskDetail): TaskMetric[] {
  const structured = metricsFromEvidence(task.evidence)
  if (structured.length > 0) return structured
  return metricsFromText(`${task.title} ${task.description}`)
}

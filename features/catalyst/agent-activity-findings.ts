import type { ActivityLine } from '@/features/catalyst/agent-activity-log'
import type { ActivityEntry } from '@/lib/api/agent-mode-activity'

/**
 * Activity lines for what the agent published or sent (by channel), what it
 * found about keywords, and what it noticed on the brand's own site.
 */
type Describe = (entry: ActivityEntry) => ActivityLine

const compact = new Intl.NumberFormat(undefined, { notation: 'compact' })

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function num(value: unknown): number {
  return typeof value === 'number' ? value : 0
}

function list(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((v): v is Record<string, unknown> => typeof v === 'object' && v !== null)
    : []
}

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const PLATFORMS: Record<string, string> = {
  linkedin: 'LinkedIn',
  x: 'X',
  youtube: 'YouTube',
  instagram: 'Instagram',
  reddit: 'Reddit',
}

function recipient(e: ActivityEntry): string {
  return str(e.detail.domain) || e.taskTitle
}

function articleTitle(e: ActivityEntry): string {
  const where = host(str(e.detail.url)) || 'a signalor.ai site'
  const verb = e.detail.refreshed ? 'Refreshed' : 'Published'
  return `${verb} your article on ${where}`
}

/** What was sent, in words that fit each channel. Email channels name follow-ups. */
const SENT_TITLES: Record<string, (e: ActivityEntry) => string> = {
  satellite_content: articleTitle,
  owned_content: e => `Published on your site: ${e.taskTitle}`,
  owned_social: e => `Added your ${PLATFORMS[str(e.detail.platform)] ?? 'social'} post to Buffer`,
  guest_outreach: e => `Sent a guest-post pitch to ${recipient(e)}`,
  outreach_email: e => `Sent an outreach email to ${recipient(e)}`,
}

function sentTitle(e: ActivityEntry): string {
  const sequence = num(e.detail.sequence)
  if (sequence) return `Sent follow-up ${sequence} to ${recipient(e)}`
  const title = SENT_TITLES[e.channel]
  return title ? title(e) : `Sent: ${e.taskTitle}`
}

function sentDetail(e: ActivityEntry): string {
  if (e.channel === 'owned_social') return str(e.detail.buffer_channel)
  return str(e.detail.url) || str(e.detail.subject)
}

const publish: Describe = e =>
  e.outcome === 'succeeded'
    ? { title: sentTitle(e), detail: sentDetail(e), tone: 'success' }
    : {
        title: `Couldn't send: ${e.taskTitle}`,
        detail: str(e.detail.error),
        tone: 'danger',
      }

function goldenText(row: Record<string, unknown>): string {
  const rival = str(row.rival)
  const where = rival ? `, ${rival} is #${num(row.position)}` : ''
  return `${str(row.keyword)} (${compact.format(num(row.search_volume))}/mo${where})`
}

const golden: Describe = e => {
  const rows = list(e.detail.keywords)
  const first = rows[0]
  const title =
    rows.length === 1 && first
      ? `Golden keyword: ${str(first.keyword)}`
      : `Found ${rows.length} golden keywords`
  return {
    title,
    detail: `${rows.map(goldenText).join(' · ')}. Competitors rank, you don't.`,
    tone: 'success',
  }
}

function moves(label: string, rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const items = rows.map(r => {
    const to = num(r.to) ? `#${num(r.to)}` : 'gone'
    const from = num(r.from) ? `#${num(r.from)}` : 'new'
    return `${str(r.keyword)} ${from}→${to}`
  })
  return `${label}: ${items.join(', ')}`
}

const rankChanges: Describe = e => {
  const down = list(e.detail.down)
  const left = list(e.detail.left)
  const parts = [
    moves('Into the top 10', list(e.detail.entered)),
    moves('Up', list(e.detail.up)),
    moves('Out of the top 10', left),
    moves('Down', down),
  ].filter(Boolean)
  return {
    title: 'Your Google rankings moved',
    detail: parts.join(' · '),
    tone: down.length || left.length ? 'attention' : 'success',
  }
}

function bots(e: ActivityEntry): string {
  const names = e.detail.bots
  return Array.isArray(names) ? names.filter(n => typeof n === 'string').join(', ') : ''
}

const SITE: Record<string, Describe> = {
  site_down: e => ({
    title: 'Your site is down',
    detail: num(e.detail.status)
      ? `The homepage answered with an error (HTTP ${num(e.detail.status)}).`
      : 'The homepage could not be reached.',
    tone: 'danger',
  }),
  site_back_up: () => ({ title: 'Your site is back up', detail: '', tone: 'success' }),
  noindex_added: () => ({
    title: 'Your homepage now tells Google not to index it',
    detail: 'A "noindex" tag appeared. Remove it unless this is on purpose.',
    tone: 'danger',
  }),
  noindex_removed: () => ({
    title: 'The "noindex" tag is gone from your homepage',
    detail: '',
    tone: 'success',
  }),
  robots_blocked: e => ({
    title: `robots.txt now blocks ${bots(e)}`,
    detail:
      e.detail.severity === 'danger'
        ? 'Search engines can’t crawl your site.'
        : 'AI engines can’t read your site, so they can’t cite it.',
    tone: e.detail.severity === 'danger' ? 'danger' : 'attention',
  }),
  robots_unblocked: e => ({
    title: `robots.txt allows ${bots(e)} again`,
    detail: '',
    tone: 'success',
  }),
  sitemap_missing: () => ({
    title: 'Your sitemap can’t be found',
    detail: 'Search engines use it to find your pages.',
    tone: 'attention',
  }),
  title_changed: e => ({
    title: 'Your homepage title changed',
    detail: `From “${str(e.detail.from)}” to “${str(e.detail.to)}”.`,
    tone: 'neutral',
  }),
  clicks_drop: e => ({
    title: `Google clicks fell ${Math.round(num(e.detail.share) * 100)}% this week`,
    detail: `${num(e.detail.after)} clicks in the last 7 days, ${num(e.detail.before)} the week before (Search Console).`,
    tone: 'attention',
  }),
}

const siteAnomaly: Describe = e => {
  const describe = SITE[str(e.detail.kind)]
  return describe
    ? describe(e)
    : { title: 'Something changed on your site', detail: str(e.detail.kind), tone: 'attention' }
}

const KEYWORD_TOOLS: Record<string, string> = { semrush: 'Semrush', ahrefs: 'Ahrefs' }

export const FINDING_LINES: Record<string, Describe> = {
  publish,
  golden_keywords_found: golden,
  keyword_rank_changes: rankChanges,
  site_anomaly: siteAnomaly,
  site_checked: e => {
    const found = num(e.detail.anomalies)
    return found
      ? {
          title: `Checked your site: ${found} thing(s) changed`,
          detail: 'See the lines above.',
          tone: 'attention',
        }
      : { title: 'Checked your site: all looks fine', detail: '', tone: 'neutral' }
  },
  keyword_tool_connected: e => ({
    title: `You connected ${KEYWORD_TOOLS[str(e.detail.provider)] ?? 'a keyword tool'}`,
    detail: `Key ••••${str(e.detail.key_hint)}. Keywords are read from your account now.`,
    tone: 'success',
  }),
  keyword_tool_disconnected: e => ({
    title: `You disconnected ${KEYWORD_TOOLS[str(e.detail.provider)] ?? 'a keyword tool'}`,
    detail: 'Keywords come from Signalor’s data again.',
    tone: 'neutral',
  }),
  dispatch_refused: e => ({
    title: `Not sent: ${e.taskTitle}`,
    detail: str(e.detail.reason),
    tone: 'danger',
  }),
  outcome_closed: e => ({
    title: `Closed without sending: ${e.taskTitle}`,
    detail: '',
    tone: 'neutral',
  }),
  dispatch_unblocked: e => ({
    title: `Sending unblocked: ${e.taskTitle}`,
    detail: '',
    tone: 'neutral',
  }),
  preview: e => ({ title: `Previewed: ${e.taskTitle}`, detail: '', tone: 'neutral' }),
}

/** Bookkeeping rows that would only repeat another line (the daily check has its own line). */
export const HIDDEN_ACTIONS = new Set(['site_check_started'])

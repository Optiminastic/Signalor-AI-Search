import type { ActivityEntry } from '@/lib/api/agent-mode-activity'

/** How one line of the agent's log reads, and its colour. */
export interface ActivityLine {
  title: string
  detail: string
  tone: 'neutral' | 'success' | 'attention' | 'danger'
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function concerns(entry: ActivityEntry): string {
  const list = entry.detail.concerns
  return Array.isArray(list) ? list.filter(c => typeof c === 'string').join(' ') : ''
}

const FINDER_LABELS: Record<string, string> = { hunter: 'Hunter', apollo: 'Apollo' }

function finderLabel(entry: ActivityEntry): string {
  const provider = text(entry.detail.provider)
  return FINDER_LABELS[provider] ?? 'a contact finder'
}

function indexingDetail(entry: ActivityEntry): string {
  const change = entry.detail.indexed_change
  const delta =
    typeof change === 'number' && change !== 0
      ? `${change > 0 ? '+' : ''}${change} since last week. `
      : ''
  const reason = text(entry.detail.top_reason)
  const ready = typeof entry.detail.to_request === 'number' ? entry.detail.to_request : 0
  const requests = ready > 0 ? ` ${ready} pages ready to request in Search Console.` : ''
  return `${delta}${reason ? `Most common reason: ${reason}.` : ''}${requests}`.trim()
}

type Describe = (entry: ActivityEntry) => ActivityLine

const LINES: Record<string, Describe> = {
  prepared: e => ({
    title: `Drafted: ${e.taskTitle}`,
    detail: 'Waiting for your approval.',
    tone: 'success',
  }),
  drafted_with_concerns: e => ({
    title: `Drafted with fact-check concerns: ${e.taskTitle}`,
    detail: concerns(e) || 'Review the concerns before approving.',
    tone: 'attention',
  }),
  contact_not_found: e => ({
    title: `No public contact email on ${text(e.detail.domain) || 'this site'}`,
    detail: 'Waiting for you: add an email for the agent to write to, or skip it.',
    tone: 'attention',
  }),
  contact_added: e => ({
    title: `You added a contact for ${text(e.detail.domain) || e.taskTitle}`,
    detail: 'The agent is writing the pitch.',
    tone: 'neutral',
  }),
  contact_skipped: e => ({ title: `You skipped: ${e.taskTitle}`, detail: '', tone: 'neutral' }),
  draft_failed: e => ({
    title: `Couldn't draft: ${e.taskTitle}`,
    detail: text(e.detail.error),
    tone: 'danger',
  }),
  approved: e => ({ title: `You approved: ${e.taskTitle}`, detail: '', tone: 'success' }),
  rejected: e => ({ title: `You rejected: ${e.taskTitle}`, detail: '', tone: 'neutral' }),
  revoked: e => ({ title: `You withdrew approval: ${e.taskTitle}`, detail: '', tone: 'neutral' }),
  edited: e => ({
    title: `You edited: ${e.taskTitle}`,
    detail: `Now version ${text(String(e.detail.version ?? ''))}`,
    tone: 'neutral',
  }),
  publish: e =>
    e.outcome === 'succeeded'
      ? { title: `Sent: ${e.taskTitle}`, detail: '', tone: 'success' }
      : { title: `Couldn't send: ${e.taskTitle}`, detail: text(e.detail.error), tone: 'danger' },
  outcome_unknown: e => ({
    title: `Send result unknown: ${e.taskTitle}`,
    detail: 'It may or may not have gone out. It will not be sent again automatically.',
    tone: 'attention',
  }),
  approval_expired: e => ({
    title: `Approval expired: ${e.taskTitle}`,
    detail: 'Not sent.',
    tone: 'neutral',
  }),
  reply_received: e => ({
    title: `They replied: ${text(e.detail.domain)}`,
    detail: '',
    tone: 'success',
  }),
  opt_out_received: e => ({
    title: `They opted out: ${text(e.detail.domain)}`,
    detail: 'Never emailed again.',
    tone: 'neutral',
  }),
  finder_connected: e => ({
    title: `You connected ${finderLabel(e)}`,
    detail: `Key ••••${text(e.detail.key_hint)}. The agent will use it to find contacts.`,
    tone: 'success',
  }),
  finder_disconnected: e => ({
    title: `You disconnected ${finderLabel(e)}`,
    detail: '',
    tone: 'neutral',
  }),
  contacts_found: e => ({
    title: `Looked up contacts at ${text(e.detail.domain) || 'a site'}`,
    detail: `${String(e.detail.found ?? 0)} found.`,
    tone: 'neutral',
  }),
  indexing_check_started: () => ({
    title: 'Started the weekly indexing check',
    detail: 'Reading every sitemap page in Search Console.',
    tone: 'neutral',
  }),
  bing_autosubmit_on: () => ({
    title: 'You turned on weekly sending to Bing',
    detail: 'The agent sends new and changed pages every week.',
    tone: 'success',
  }),
  bing_autosubmit_off: () => ({
    title: 'You turned off weekly sending to Bing',
    detail: '',
    tone: 'neutral',
  }),
  bing_send_started: () => ({
    title: 'Checking the sitemap for pages to send to Bing',
    detail: '',
    tone: 'neutral',
  }),
  bing_submitted: e => ({
    title: `Sent ${String(e.detail.submitted ?? 0)} pages to Bing`,
    detail: 'Bing decides when to index them.',
    tone: 'success',
  }),
  bing_no_changes: () => ({
    title: 'No new or changed pages to send to Bing this week',
    detail: '',
    tone: 'neutral',
  }),
  bing_send_blocked: e => ({
    title: "Couldn't send pages to Bing",
    detail: text(e.detail.message),
    tone: 'danger',
  }),
  satellite_rank_started: () => ({
    title: 'Checking your articles on signalor.ai sites in Google',
    detail: '',
    tone: 'neutral',
  }),
  satellite_rank_checked: e => ({
    title: e.detail.indexed
      ? 'Your satellite article is on Google'
      : 'Your satellite article is not on Google yet',
    detail: text(e.detail.url),
    tone: e.detail.indexed ? 'success' : 'neutral',
  }),
  satellite_topics_planned: e => ({
    title: `Planned ${String(e.detail.count ?? 0)} articles on signalor.ai sites`,
    detail: 'One every 3 days, each mentioning you. See Approvals to skip any topic.',
    tone: 'success',
  }),
  social_check_started: () => ({
    title: 'Checking your social presence',
    detail: 'LinkedIn, X, YouTube, Instagram and Reddit.',
    tone: 'neutral',
  }),
  social_checked: e => ({
    title: `Social presence score: ${String((e.detail.overall as { score?: number } | undefined)?.score ?? 0)} of 100`,
    detail: 'See the Social tab for each platform.',
    tone: 'success',
  }),
  weekly_summary_posted: () => ({
    title: 'Posted your weekly summary in the chat',
    detail: 'Open it from your recent chats.',
    tone: 'neutral',
  }),
  indexing_requested: e => ({
    title: 'You opened a Request indexing link',
    detail: text(e.detail.url),
    tone: 'neutral',
  }),
  indexing_checked: e => ({
    title: `Indexing: ${String(e.detail.indexed ?? 0)} of ${String(e.detail.checked ?? 0)} pages on Google`,
    detail: indexingDetail(e),
    tone: 'success',
  }),
  guardrail: e => ({
    title: `Held back: ${e.taskTitle}`,
    detail: text(e.detail.reason),
    tone: 'neutral',
  }),
}

function humanize(action: string): string {
  const words = action.replace(/_/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** One log entry in plain words. Unknown actions still read sensibly. */
export function describeActivity(entry: ActivityEntry): ActivityLine {
  const describe = LINES[entry.action]
  if (describe) return describe(entry)
  return {
    title: `${humanize(entry.action)}${entry.taskTitle ? `: ${entry.taskTitle}` : ''}`,
    detail: '',
    tone: 'neutral',
  }
}

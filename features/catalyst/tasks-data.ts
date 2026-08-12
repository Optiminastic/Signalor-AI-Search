import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import type { LucideIcon } from '@/lib/icons'

export type Priority = 'High' | 'Medium' | 'Low'

export interface ProjectRef {
  name: string
  initial: string
  color: string
}

export interface TaskItem {
  /** Backend UserAction id — the key for assign / status mutations. */
  taskId: number
  name: string
  child: boolean
  project: ProjectRef
  description: string
  /** Email of the assigned teammate, or '' when unassigned. */
  assigneeEmail: string
  due: string
  priority: Priority
  /** 0 = Not Started, 100 = Done, else "N% Completed". */
  progress: number
  /** Linked Recommendation id — the key for Auto-fix (undefined = not fixable). */
  recommendationId?: number
  /** The finding this task came from, e.g. "no_llms_txt". Survives re-analysis,
   *  unlike recommendationId: Recommendation rows are per-run, so a task raised
   *  by an earlier run points at an id the current run no longer has. This is
   *  what lets Auto-fix re-resolve the task to the current run's equivalent. */
  findingCode?: string
  /** Provenance: "analyzer" | "ai_insight" | "geo_signal" ('' when unlinked). */
  source: string
  /** Short label for the signal this task moves, e.g. "E-E-A-T", "Schema". */
  signal: string
  /** One sentence on what completing it actually does. */
  effect: string
  /** Tracked prompt this task targets (undefined when it isn't prompt-derived).
   *  Lets the row deep-link to that prompt in the tracker. */
  promptTrackId?: number
}

export interface StatCard {
  icon: LucideIcon
  color: string
  label: string
  value: string
  fill?: boolean
  /** Sub-line explaining a value that is legitimately empty ("Verify to measure"). */
  hint?: string
}

export interface StatusTab {
  label: string
  count: number
  active?: boolean
}

export const PRIORITY_COLOR: Record<Priority, string> = {
  High: NEG,
  Medium: YELLOW,
  Low: GREEN,
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "Jul 12, 2026" from an ISO string; placeholder dash when missing/invalid. */
export function formatTaskDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

/** "45m" / "2h" from estimated minutes, else the difficulty word. */
export function formatEffort(effort: { difficulty: string; minutes: number }): string {
  if (effort.minutes > 0) {
    return effort.minutes >= 60 ? `${Math.round(effort.minutes / 60)}h` : `${effort.minutes}m`
  }
  return effort.difficulty || '—'
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'To do',
  open: 'To do',
  in_progress: 'In progress',
  completed: 'Completed',
  verified: 'Verified',
  dismissed: 'Dismissed',
}

/** Human label for a backend task status. */
export function formatStatus(status: string): string {
  if (!status) return '—'
  return STATUS_LABEL[status] ?? status.replace(/_/g, ' ')
}

/* Statuses that mean the work is over. `dismissed` counts: the user decided not
   to do it, so offering to do it for them is just as wrong as offering to redo
   something finished. */
const DONE_STATUSES = new Set(['completed', 'verified', 'dismissed'])

/**
 * Is this action finished?
 *
 * The single answer to that question. It used to be re-derived at each call
 * site — `progress >= 100` here, `=== 100` there, two different status lists on
 * the detail page — so the definitions drifted and any new control could simply
 * forget to ask. That is exactly how a completed action ended up in the Done
 * tab still offering an "Auto fix" button.
 *
 * Every control that acts ON an action (auto-fix, start, verify, complete) must
 * gate on this, not on whether the action is *capable* of that operation.
 */
export function isTaskDone(status: string): boolean {
  return DONE_STATUSES.has((status || '').trim().toLowerCase())
}

/* Terms whose casing a generic humaniser gets wrong. "ai_visibility" must read
   "AI visibility", not "Ai visibility". */
const ACRONYMS: Record<string, string> = {
  ai: 'AI',
  geo: 'GEO',
  seo: 'SEO',
  url: 'URL',
  faq: 'FAQ',
  ctr: 'CTR',
  eeat: 'E-E-A-T',
  llm: 'LLM',
  llms: 'LLMs',
  cta: 'CTA',
  api: 'API',
}

/**
 * A backend identifier, as a person would read it.
 *
 * `ai_visibility` -> `AI visibility`, `brand_mentions` -> `Brand mentions`.
 * The action detail page printed these raw, so it named things the way the
 * database does rather than the way the reader does.
 *
 * Sentence case, not Title Case: only the first word and known acronyms are
 * capitalised, so a label sits quietly beside prose instead of shouting.
 */
export function humanizeTerm(value: string): string {
  const words = (value || '').trim().replace(/[_-]+/g, ' ').split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''

  return words
    .map((word, index) => {
      const known = ACRONYMS[word.toLowerCase()]
      if (known) return known
      if (index > 0) return word.toLowerCase()
      return word[0].toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/** What kind of work a task is — drives its icon and type label. */
export type TaskType =
  | 'page'
  | 'content'
  | 'reddit'
  | 'schema'
  | 'technical'
  | 'authority'
  | 'general'

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  page: 'New page',
  content: 'Content',
  reddit: 'Reddit',
  schema: 'Schema',
  technical: 'Technical',
  authority: 'Authority',
  general: 'General',
}

/** Ordered keyword rules — the first match wins, so the most specific go first. */
const TYPE_PATTERNS: Array<[TaskType, RegExp]> = [
  ['reddit', /reddit|subreddit/i],
  ['schema', /schema|structured data|json-?ld|markup/i],
  [
    'technical',
    /technical|sitemap|robots|crawl|speed|performance|core web vitals|lcp|redirect|broken|404|https|canonical|meta (tag|description)|title tag/i,
  ],
  ['page', /\b(create|add|build|publish|launch|new)\b[^.]*\bpage\b|landing page/i],
  ['authority', /backlink|link building|mention|citation|directory|wikipedia|authority|e-?eat/i],
  ['content', /blog|article|content|faq|copy|\bwrite|rewrite|heading|keyword/i],
]

/** Backend pillar → task type, when the text itself doesn't give it away. */
const PILLAR_TYPE: Record<string, TaskType> = {
  content: 'content',
  schema: 'schema',
  technical: 'technical',
  eeat: 'authority',
  entity: 'authority',
  ai_visibility: 'authority',
}

interface TaskTypeSource {
  title: string
  description?: string
  pillar?: string
  group?: string
}

/**
 * Every type a task matches, most specific first — tasks can span several
 * (e.g. a Reddit task that is also authority work). Falls back to the pillar,
 * then the group, so the list is never empty.
 */
export function taskTypesOf(task: TaskTypeSource): TaskType[] {
  const text = `${task.title} ${task.description ?? ''}`
  const matched = TYPE_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([type]) => type)
  const pillarType = PILLAR_TYPE[(task.pillar ?? '').toLowerCase()]
  if (pillarType && !matched.includes(pillarType)) matched.push(pillarType)
  if (matched.length > 0) return matched
  return [task.group === 'Off-page' ? 'authority' : 'general']
}

/** The task's primary type — the first (most specific) match; drives its icon. */
export function taskTypeOf(task: TaskTypeSource): TaskType {
  return taskTypesOf(task)[0]
}

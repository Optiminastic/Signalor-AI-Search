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
  /** Short label for the signal this task moves, e.g. "E-E-A-T", "Schema". */
  signal: string
  /** One sentence on what completing it actually does. */
  effect: string
}

export interface StatCard {
  icon: LucideIcon
  color: string
  label: string
  value: string
  fill?: boolean
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

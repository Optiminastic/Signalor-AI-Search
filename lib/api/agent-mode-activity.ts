import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * The agent's own log of what it did, newest first: drafts it wrote, sites
 * where it found no contact, fact-check concerns, decisions and sends. Read
 * from ranking-be's append-only audit log.
 */
const entrySchema = z
  .object({
    id: z.number(),
    channel: z.string(),
    action: z.string(),
    outcome: z.string(),
    task_title: z.string().nullable().catch(''),
    detail: z.record(z.unknown()).nullable().catch(null),
    created_at: z.string(),
  })
  .transform(e => ({
    id: e.id,
    channel: e.channel,
    action: e.action,
    outcome: e.outcome,
    taskTitle: e.task_title ?? '',
    detail: e.detail ?? {},
    createdAt: e.created_at,
  }))

export type ActivityEntry = z.infer<typeof entrySchema>

const envelope = z.object({ activity: z.array(entrySchema) })

export async function listActivity(orgSlug: string): Promise<ActivityEntry[]> {
  return (await agentModeRequest(programPath(orgSlug, 'activity'), envelope)).activity
}

const contactResult = z.object({ task: z.object({ id: z.number(), status: z.string() }) })

export type ContactChoice =
  | { email: string }
  | { skip: true }
  | { candidate: { provider: string; ref: string } }

interface ContactInput {
  orgSlug: string
  taskId: number
  choice: ContactChoice
}

/**
 * The owner's answer when the agent found no contact email for a site: an
 * email for the agent to write to, or skip the task.
 */
export async function answerContact({ orgSlug, taskId, choice }: ContactInput): Promise<string> {
  const path = programPath(orgSlug, 'tasks', String(taskId), 'contact')
  const result = await agentModeRequest(path, contactResult, { method: 'POST', body: choice })
  return result.task.status
}

const PROVIDER_LABELS: Record<string, string> = { apollo: 'Apollo', hunter: 'Hunter' }

const candidateSchema = z
  .object({
    provider: z.string(),
    ref: z.string(),
    name: z.string(),
    title: z.string(),
    email: z.string(),
    confidence: z.string(),
  })
  .transform(c => ({ ...c, label: PROVIDER_LABELS[c.provider] ?? c.provider }))

export type ContactCandidate = z.infer<typeof candidateSchema>

const foundEnvelope = z.object({
  candidates: z.array(candidateSchema),
  providers: z.array(z.string()),
  errors: z.array(z.string()).optional(),
})

export interface FoundContacts {
  candidates: ContactCandidate[]
  /** Finders that are set up; empty means none is, so nothing could be looked up. */
  providers: string[]
  errors: string[]
}

/** Ask the contact finders (Hunter, Apollo) for people at the task's site. */
export async function findContacts(orgSlug: string, taskId: number): Promise<FoundContacts> {
  const path = programPath(orgSlug, 'tasks', String(taskId), 'find-contacts')
  const found = await agentModeRequest(path, foundEnvelope, { method: 'POST', body: {} })
  return { candidates: found.candidates, providers: found.providers, errors: found.errors ?? [] }
}

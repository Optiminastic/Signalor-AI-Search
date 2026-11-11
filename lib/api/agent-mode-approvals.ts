import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * Agent mode approvals: drafts the agent prepared, waiting on the brand owner.
 *
 * Every decision names the exact version and content hash the owner reviewed.
 * The backend refuses it (409 `stale`) if the draft changed since, so what the
 * owner approved is always exactly what would be sent. Approving sends nothing
 * by itself; the backend sends approved drafts in a separate step.
 */

export const ACTION_STATES = [
  'awaiting_approval',
  'approved',
  'rejected',
  'dispatching',
  'succeeded',
  'failed',
  'needs_reconciliation',
  'cancelled',
] as const

/** A state this screen doesn't know yet reads as `unknown` and is never decidable. */
export type ActionState = (typeof ACTION_STATES)[number] | 'unknown'

export const PAYLOAD_HASH_LENGTH = 64

const KNOWN_STATES: readonly string[] = ACTION_STATES

const stateSchema = z
  .string()
  .transform((s): ActionState => (KNOWN_STATES.includes(s) ? (s as ActionState) : 'unknown'))

const articleSchema = z
  .object({
    title: z.string(),
    meta_description: z.string(),
    slug: z.string(),
    markdown: z.string(),
    platform: z.string(),
  })
  .transform(c => ({
    type: 'article' as const,
    title: c.title,
    metaDescription: c.meta_description,
    slug: c.slug,
    markdown: c.markdown,
    platform: c.platform,
  }))

const emailSchema = z
  .object({
    subject: z.string(),
    body: z.string(),
    recipient_domain: z.string(),
    sender: z.string(),
  })
  .transform(c => ({
    type: 'email' as const,
    subject: c.subject,
    body: c.body,
    recipientDomain: c.recipient_domain,
    sender: c.sender,
  }))

export type ArticleContent = z.infer<typeof articleSchema>
export type EmailContent = z.infer<typeof emailSchema>
export type ActionContent = ArticleContent | EmailContent

/** The draft as the owner sees it, or null when it can't be shown (then it can't be approved). */
function parseContent(kind: string, raw: unknown): ActionContent | null {
  if (kind === 'publish_article') {
    const parsed = articleSchema.safeParse(raw)
    return parsed.success ? parsed.data : null
  }
  if (kind === 'send_outreach_email') {
    const parsed = emailSchema.safeParse(raw)
    return parsed.success ? parsed.data : null
  }
  return null
}

const taskSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    channel: z.string(),
    target: z.string(),
    scheduled_for: z.string(),
    status: z.string(),
  })
  .transform(t => ({
    id: t.id,
    title: t.title,
    channel: t.channel,
    target: t.target,
    scheduledFor: t.scheduled_for,
    status: t.status,
  }))

const actionFields = {
  id: z.string(),
  kind: z.string(),
  connector: z.string(),
  state: stateSchema,
  task: taskSchema,
  version: z.number().nullable(),
  payload_hash: z.string(),
  content: z.unknown(),
  created_at: z.string(),
  updated_at: z.string(),
}

const rawActionSchema = z.object(actionFields)

function toAction(a: z.output<typeof rawActionSchema>): AgentAction {
  return {
    id: a.id,
    kind: a.kind,
    connector: a.connector,
    state: a.state,
    task: a.task,
    version: a.version,
    payloadHash: a.payload_hash,
    content: parseContent(a.kind, a.content),
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }
}

export interface AgentAction {
  id: string
  kind: string
  connector: string
  state: ActionState
  task: z.infer<typeof taskSchema>
  version: number | null
  payloadHash: string
  content: ActionContent | null
  createdAt: string
  updatedAt: string
}

const decisionSchema = z
  .object({
    decision: z.string(),
    version: z.number(),
    payload_hash: z.string(),
    actor_role: z.string(),
    reason: z.string(),
    created_at: z.string(),
  })
  .transform(d => ({
    decision: d.decision,
    version: d.version,
    payloadHash: d.payload_hash,
    actorRole: d.actor_role,
    reason: d.reason,
    createdAt: d.created_at,
  }))

export type ActionDecision = z.infer<typeof decisionSchema>

export interface AgentActionDetail extends AgentAction {
  decisions: ActionDecision[]
}

const detailSchema = z
  .object({ ...actionFields, decisions: z.array(decisionSchema) })
  .transform((a): AgentActionDetail => ({ ...toAction(a), decisions: a.decisions }))

const listEnvelope = z.object({ actions: z.array(rawActionSchema.transform(toAction)) })
const detailEnvelope = z.object({ action: detailSchema })

/** The action summary each plan task carries. Older backends send none. */
const taskActionSchema = z.object({
  id: z.string(),
  kind: z.string(),
  state: stateSchema,
  version: z.number().nullable(),
})

const planTaskSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    status: z.string(),
    result_payload: z.record(z.unknown()).nullable().catch(null),
    action: taskActionSchema.nullable().catch(null),
  })
  .transform(t => ({
    taskId: t.id,
    taskTitle: t.title,
    /** The task's own status, passed through unchanged. */
    taskStatus: t.status,
    action: t.action,
    failure: typeof t.result_payload?.error === 'string' ? t.result_payload.error : '',
  }))

export type PlanTaskAction = z.infer<typeof planTaskSchema>

const planEnvelope = z.object({
  plan: z.object({ tasks: z.array(planTaskSchema) }).nullable(),
})

/** Drafts waiting for the owner, and approved drafts not sent yet (newest first). */
export async function listApprovals(orgSlug: string): Promise<AgentAction[]> {
  return (await agentModeRequest(programPath(orgSlug, 'approvals'), listEnvelope)).actions
}

/** One action with its exact draft and its decision history. */
export async function getAction(orgSlug: string, actionId: string): Promise<AgentActionDetail> {
  const path = programPath(orgSlug, 'actions', encodeURIComponent(actionId))
  return (await agentModeRequest(path, detailEnvelope)).action
}

/** Every task in the current plan, with its action when it has one. */
export async function listPlanTaskActions(orgSlug: string): Promise<PlanTaskAction[]> {
  const { plan } = await agentModeRequest(programPath(orgSlug, 'plan'), planEnvelope)
  return plan?.tasks ?? []
}

export type DecisionVerb = 'approve' | 'reject'

/** Refuses locally, before any request, unless the reviewed draft is fully identified. */
function assertIdentified(version: number, payloadHash: string): void {
  if (!Number.isInteger(version) || version < 1) {
    throw new Error('The reviewed version is missing.')
  }
  if (payloadHash.length !== PAYLOAD_HASH_LENGTH) {
    throw new Error('The reviewed draft is not identified.')
  }
}

export interface DecisionInput {
  orgSlug: string
  actionId: string
  verb: DecisionVerb
  /** The version and hash of the draft the owner was shown. */
  version: number
  payloadHash: string
  reason?: string
}

/** Records the owner's decision on the exact draft they reviewed. */
export async function decideAction(input: DecisionInput): Promise<AgentActionDetail> {
  assertIdentified(input.version, input.payloadHash)
  const path = programPath(input.orgSlug, 'actions', encodeURIComponent(input.actionId), input.verb)
  const body = {
    version: input.version,
    payload_hash: input.payloadHash,
    ...(input.reason ? { reason: input.reason } : {}),
  }
  return (await agentModeRequest(path, detailEnvelope, { method: 'POST', body })).action
}

/** How the owner closes an action whose send outcome is unknown. There is no "send again". */
export type Resolution = 'confirmed_sent' | 'cancel'

export interface ResolutionInput {
  orgSlug: string
  actionId: string
  resolution: Resolution
  /** The version and hash of the action the owner was shown. */
  version: number
  payloadHash: string
  reason?: string
}

/** Records how the owner closed an outcome-unknown action. Never sends anything. */
export async function resolveAction(input: ResolutionInput): Promise<AgentActionDetail> {
  assertIdentified(input.version, input.payloadHash)
  const path = programPath(input.orgSlug, 'actions', encodeURIComponent(input.actionId), 'resolve')
  const body = {
    resolution: input.resolution,
    version: input.version,
    payload_hash: input.payloadHash,
    ...(input.reason ? { reason: input.reason } : {}),
  }
  return (await agentModeRequest(path, detailEnvelope, { method: 'POST', body })).action
}

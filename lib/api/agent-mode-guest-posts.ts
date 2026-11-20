import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * Sites that accept guest articles on the brand's topic, found by the agent and
 * added to this month's plan (ranking-be `services/guest_posts`).
 */
const STAGES = [
  'to_pitch',
  'needs_contact',
  'pitch_waiting',
  'pitching',
  'pitched',
  'replied',
  'declined',
  'no_reply',
  'failed',
  'skipped',
] as const

/** The sent pitch's email thread, once there is one. */
const pitchSchema = z
  .object({
    sent_on: z.string(),
    followups_sent: z.number().catch(0),
    next_follow_up_on: z.string().nullable().catch(null),
    replied_at: z.string().nullable().catch(null),
  })
  .transform(p => ({
    sentOn: p.sent_on,
    followupsSent: p.followups_sent,
    nextFollowUpOn: p.next_follow_up_on,
    repliedAt: p.replied_at,
  }))

const siteSchema = z
  .object({
    task_id: z.number(),
    domain: z.string(),
    guidelines_url: z.string(),
    source: z.enum(['cited', 'search', 'competitor']).catch('search'),
    topic: z.string().catch(''),
    reason: z.string().catch(''),
    scheduled_for: z.string(),
    stage: z.enum(STAGES).catch('to_pitch'),
    pitch: pitchSchema.nullable().catch(null),
  })
  .transform(s => ({
    taskId: s.task_id,
    domain: s.domain,
    guidelinesUrl: s.guidelines_url,
    source: s.source,
    topic: s.topic,
    reason: s.reason,
    scheduledFor: s.scheduled_for,
    stage: s.stage,
    pitch: s.pitch,
  }))

export type GuestSite = z.infer<typeof siteSchema>
export type GuestStage = GuestSite['stage']

const reportSchema = z
  .object({
    sites: z.array(siteSchema).catch([]),
    monthly_cap: z.number().catch(8),
    notes: z.array(z.string()).catch([]),
    searching: z.boolean().catch(false),
    last_search_at: z.string().nullable().catch(null),
    last_found: z.number().nullable().catch(null),
  })
  .transform(r => ({
    sites: r.sites,
    monthlyCap: r.monthly_cap,
    notes: r.notes,
    searching: r.searching,
    lastSearchAt: r.last_search_at,
    lastFound: r.last_found,
  }))

export type GuestPostsReport = z.infer<typeof reportSchema>

export async function getGuestPosts(orgSlug: string): Promise<GuestPostsReport> {
  return agentModeRequest(programPath(orgSlug, 'guest-posts'), reportSchema)
}

/** Search for more sites now (ranking-be allows one search every 6 hours). */
export async function findGuestSitesNow(orgSlug: string): Promise<GuestPostsReport> {
  return agentModeRequest(programPath(orgSlug, 'guest-posts', 'find'), reportSchema, {
    method: 'POST',
    body: {},
  })
}

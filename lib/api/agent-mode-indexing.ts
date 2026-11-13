import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * The brand's indexing report: Google's own verdict per sitemap page, from the
 * latest Search Console check compared with the one before. Read from
 * ranking-be, which runs the check weekly.
 */
const reasonSchema = z.object({
  key: z.string(),
  label: z.string(),
  explanation: z.string(),
  fixable: z.boolean(),
  count: z.number(),
  urls: z.array(z.string()),
})

export type IndexingReason = z.infer<typeof reasonSchema>

const requestItemSchema = z
  .object({
    url: z.string(),
    reason: z.string(),
    inspect_url: z.string().url(),
    requested_at: z.string().optional(),
  })
  .transform(i => ({
    url: i.url,
    reason: i.reason,
    inspectUrl: i.inspect_url,
    requestedAt: i.requested_at ?? null,
  }))

/** A page to ask Google about, with its Search Console URL-inspection link. */
export type RequestIndexingItem = z.infer<typeof requestItemSchema>

const STATUSES = [
  'not_connected',
  'no_property',
  'never_checked',
  'checking',
  'failed',
  'ready',
] as const

export type IndexingStatus = (typeof STATUSES)[number]

const reportSchema = z
  .object({
    status: z.enum(STATUSES),
    property: z.string(),
    checked_at: z.string().nullable(),
    checked: z.number(),
    indexed: z.number(),
    not_indexed: z.number(),
    reasons: z.array(reasonSchema),
    indexed_change: z.number().nullable(),
    newly_indexed: z.array(z.string()),
    dropped: z.array(z.string()),
    to_request: z.array(requestItemSchema),
    requested: z.array(requestItemSchema),
  })
  .transform(r => ({
    status: r.status,
    property: r.property,
    checkedAt: r.checked_at,
    checked: r.checked,
    indexed: r.indexed,
    notIndexed: r.not_indexed,
    reasons: r.reasons,
    indexedChange: r.indexed_change,
    newlyIndexed: r.newly_indexed,
    dropped: r.dropped,
    toRequest: r.to_request,
    requested: r.requested,
  }))

export type IndexingReport = z.infer<typeof reportSchema>

export async function getIndexing(orgSlug: string): Promise<IndexingReport> {
  return agentModeRequest(programPath(orgSlug, 'indexing'), reportSchema)
}

/** Ask for a Search Console check now (ranking-be allows one every 6 hours). */
export async function checkIndexingNow(orgSlug: string): Promise<IndexingReport> {
  const path = programPath(orgSlug, 'indexing', 'check')
  return agentModeRequest(path, reportSchema, { method: 'POST', body: {} })
}

/** The owner opened a page's "Request indexing" link; it isn't offered again for a week. */
export async function markIndexingRequested(orgSlug: string, url: string): Promise<IndexingReport> {
  const path = programPath(orgSlug, 'indexing', 'requested')
  return agentModeRequest(path, reportSchema, { method: 'POST', body: { url } })
}

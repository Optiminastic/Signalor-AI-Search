import { z } from 'zod'

import { apiGet, apiPost } from './client'

/**
 * Slack — org-scoped report delivery. Connecting posts a GEO summary to a
 * chosen channel whenever an analysis completes. See ranking-be
 * `apps.integrations.services.slack`.
 */

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

function orgParams(email: string, orgId?: number): Record<string, string | undefined> {
  return { email: normalizeEmail(email), org_id: orgId ? String(orgId) : undefined }
}

export const slackChannelSchema = z.object({ id: z.string(), name: z.string() })
export type SlackChannel = z.infer<typeof slackChannelSchema>

/** GET slack/auth-url/ → where to send the user to authorize the workspace. */
export async function getSlackAuthUrl(
  email: string,
  orgId?: number,
  returnTo = '/settings/integrations',
): Promise<string> {
  const data = await apiGet<unknown>('/api/integrations/slack/auth-url/', {
    params: { ...orgParams(email, orgId), return_to: returnTo },
  })
  return z.object({ auth_url: z.string() }).parse(data).auth_url
}

/** GET slack/channels/ → the channels the bot can post to. */
export async function getSlackChannels(email: string, orgId?: number): Promise<SlackChannel[]> {
  const data = await apiGet<unknown>('/api/integrations/slack/channels/', {
    params: orgParams(email, orgId),
  })
  return z.object({ channels: z.array(slackChannelSchema).default([]) }).parse(data).channels
}

/** POST slack/select-channel/ → where reports land. Until one is chosen the
 *  integration is connected but deliberately silent. */
export interface SelectChannelInput {
  email: string
  channel: SlackChannel
  orgId?: number
}

export async function selectSlackChannel({
  email,
  channel,
  orgId,
}: SelectChannelInput): Promise<void> {
  await apiPost<unknown>('/api/integrations/slack/select-channel/', {
    email: normalizeEmail(email),
    org_id: orgId,
    channel_id: channel.id,
    channel_name: channel.name,
  })
}

/** POST slack/disconnect/ → stop sending reports to this workspace. */
export async function disconnectSlack(email: string, orgId?: number): Promise<void> {
  await apiPost<unknown>('/api/integrations/slack/disconnect/', {
    email: normalizeEmail(email),
    org_id: orgId,
  })
}

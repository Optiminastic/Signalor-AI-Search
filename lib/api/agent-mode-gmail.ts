import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * The brand's Gmail, which sends outreach emails and guest-post pitches from the
 * brand's own mailbox. Approved emails wait until it is connected.
 */
const statusSchema = z
  .object({ connected: z.boolean(), mailbox: z.string().catch('') })
  .catch({ connected: false, mailbox: '' })

export type GmailStatus = z.infer<typeof statusSchema>

const signInSchema = z.object({ auth_url: z.string().url() })

export async function getGmail(orgSlug: string): Promise<GmailStatus> {
  return agentModeRequest(programPath(orgSlug, 'connections', 'gmail'), statusSchema)
}

/** Google's consent page; Google sends the browser back to ``returnUrl`` afterwards. */
export async function startGmailSignIn(orgSlug: string, returnUrl: string): Promise<string> {
  const path = programPath(orgSlug, 'connections', 'gmail')
  const body = { return_url: returnUrl }
  return (await agentModeRequest(path, signInSchema, { method: 'POST', body })).auth_url
}

export async function disconnectGmail(orgSlug: string): Promise<GmailStatus> {
  const path = programPath(orgSlug, 'connections', 'gmail', 'disconnect')
  return agentModeRequest(path, statusSchema, { method: 'POST', body: {} })
}

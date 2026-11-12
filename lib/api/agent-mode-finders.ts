import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * The brand's own contact-finder accounts (Hunter, Apollo). The owner pastes an
 * API key once; ranking-be checks it with the provider, stores it encrypted and
 * only ever returns its last four characters.
 */
const finderSchema = z
  .object({
    provider: z.string(),
    label: z.string(),
    connected: z.boolean(),
    key_hint: z.string(),
    source: z.enum(['account', 'signalor', 'none']).catch('none'),
  })
  .transform(f => ({
    provider: f.provider,
    label: f.label,
    connected: f.connected,
    keyHint: f.key_hint,
    source: f.source,
  }))

export type ContactFinder = z.infer<typeof finderSchema>

const envelope = z.object({ finders: z.array(finderSchema) })

export async function listFinders(orgSlug: string): Promise<ContactFinder[]> {
  return (await agentModeRequest(programPath(orgSlug, 'finders'), envelope)).finders
}

interface ConnectInput {
  orgSlug: string
  provider: string
  apiKey: string
}

export async function connectFinder({
  orgSlug,
  provider,
  apiKey,
}: ConnectInput): Promise<ContactFinder[]> {
  const path = programPath(orgSlug, 'finders', provider, 'connect')
  const body = { api_key: apiKey }
  return (await agentModeRequest(path, envelope, { method: 'POST', body })).finders
}

export async function disconnectFinder(
  orgSlug: string,
  provider: string,
): Promise<ContactFinder[]> {
  const path = programPath(orgSlug, 'finders', provider, 'disconnect')
  return (await agentModeRequest(path, envelope, { method: 'POST', body: {} })).finders
}

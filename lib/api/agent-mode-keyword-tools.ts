import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * Keyword tools in the + panel (ranking-be `services/keywords/accounts.py`):
 * Signalor's built-in data, Google Search Console, and the brand's own Semrush
 * or Ahrefs key, which keyword reads use instead of the built-in data.
 */
const toolSchema = z
  .object({
    provider: z.string(),
    label: z.string(),
    kind: z.enum(['built_in', 'elsewhere', 'api_key']).catch('api_key'),
    connected: z.boolean().catch(false),
    in_use: z.boolean().catch(false),
    key_hint: z.string().catch(''),
  })
  .transform(t => ({
    provider: t.provider,
    label: t.label,
    kind: t.kind,
    connected: t.connected,
    inUse: t.in_use,
    keyHint: t.key_hint,
  }))

const listSchema = z.object({ tools: z.array(toolSchema).catch([]) }).transform(r => r.tools)

export type KeywordTool = z.infer<typeof toolSchema>

export async function getKeywordTools(orgSlug: string): Promise<KeywordTool[]> {
  return agentModeRequest(programPath(orgSlug, 'keyword-tools'), listSchema)
}

/** Connect Semrush or Ahrefs with an API key (ranking-be checks it with the provider first). */
export async function connectKeywordTool(
  orgSlug: string,
  provider: string,
  apiKey: string,
): Promise<KeywordTool[]> {
  return agentModeRequest(programPath(orgSlug, 'keyword-tools', provider, 'connect'), listSchema, {
    method: 'POST',
    body: { api_key: apiKey },
  })
}

export async function disconnectKeywordTool(
  orgSlug: string,
  provider: string,
): Promise<KeywordTool[]> {
  return agentModeRequest(
    programPath(orgSlug, 'keyword-tools', provider, 'disconnect'),
    listSchema,
    { method: 'POST', body: {} },
  )
}

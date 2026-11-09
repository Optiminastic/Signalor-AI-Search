import { z } from 'zod'

/**
 * Same-origin request helper for Agent mode. Calls the signed proxy at
 * `/api/agent-mode/*` (app/api/agent-mode), which forwards to ranking-be's
 * `/api/growth/*`. Every response is validated with the caller's Zod schema.
 */
const AGENT_MODE_BASE = '/api/agent-mode'
const errorSchema = z.object({ detail: z.string() })

export class AgentModeError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
}

export async function agentModeRequest<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET'
  const response = await fetch(`${AGENT_MODE_BASE}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(options.body ?? {}),
  })
  const data: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    const parsed = errorSchema.safeParse(data)
    throw new AgentModeError(
      parsed.success ? parsed.data.detail : 'Request failed.',
      response.status,
    )
  }
  return schema.parse(data)
}

export function programPath(orgSlug: string, ...rest: string[]): string {
  return ['programs', encodeURIComponent(orgSlug), ...rest].join('/')
}

/**
 * After signing in to Buffer or Gmail, ranking-be sends the browser back to Agent
 * mode with `?<tool>_connected=<tool>` or `?<tool>_error=<code>`. Read once, then dropped.
 */

const TOOLS = { buffer: 'Buffer', gmail: 'Gmail' } as const

type Tool = keyof typeof TOOLS

const ERRORS: Record<string, (name: string) => string> = {
  denied: name => `${name} sign-in was cancelled.`,
  expired: name => `The ${name} sign-in took too long. Please try again.`,
  invalid_state: name => `The ${name} sign-in took too long. Please try again.`,
  not_owner: name => `Only the brand’s owner can connect ${name}.`,
  token_exchange: name => `${name} didn’t confirm the sign-in. Please try again.`,
  missing_code: name => `${name} didn’t confirm the sign-in. Please try again.`,
  no_refresh_token: name =>
    `${name} didn’t grant lasting access. Remove Signalor in your Google account’s connected apps and try again.`,
}

export const BUFFER_PARAMS = [
  'buffer_connected',
  'buffer_error',
  'buffer',
  'gmail_connected',
  'gmail_error',
] as const

export interface BufferReturn {
  ok: boolean
  message: string
}

function outcomeFor(tool: Tool, params: URLSearchParams): BufferReturn | null {
  const name = TOOLS[tool]
  if (params.get(`${tool}_connected`)) return { ok: true, message: `${name} is connected.` }
  const error = params.get(`${tool}_error`)
  if (!error) return null
  const describe = ERRORS[error]
  return {
    ok: false,
    message: describe ? describe(name) : `${name} sign-in didn’t complete. Please try again.`,
  }
}

export function readBufferReturn(search: string): BufferReturn | null {
  const params = new URLSearchParams(search)
  return outcomeFor('buffer', params) ?? outcomeFor('gmail', params)
}

/** Remove the return params from the address bar so a refresh doesn't repeat the notice. */
export function clearBufferReturn(): void {
  const url = new URL(window.location.href)
  BUFFER_PARAMS.forEach(name => url.searchParams.delete(name))
  window.history.replaceState(window.history.state, '', url.toString())
}

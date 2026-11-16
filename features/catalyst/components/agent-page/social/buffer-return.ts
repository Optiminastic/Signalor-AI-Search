/**
 * After "Connect Buffer", ranking-be sends the browser back to Agent mode with
 * `?buffer_connected=buffer` or `?buffer_error=<code>`. Read once, then dropped.
 */

const ERRORS: Record<string, string> = {
  denied: 'Buffer sign-in was cancelled.',
  expired: 'The Buffer sign-in took too long. Please try again.',
  not_owner: 'Only the brand’s owner can connect Buffer.',
  token_exchange: 'Buffer didn’t confirm the sign-in. Please try again.',
  missing_code: 'Buffer didn’t confirm the sign-in. Please try again.',
}

export const BUFFER_PARAMS = ['buffer_connected', 'buffer_error', 'buffer'] as const

export interface BufferReturn {
  ok: boolean
  message: string
}

export function readBufferReturn(search: string): BufferReturn | null {
  const params = new URLSearchParams(search)
  if (params.get('buffer_connected')) return { ok: true, message: 'Buffer is connected.' }
  const error = params.get('buffer_error')
  if (error)
    return {
      ok: false,
      message: ERRORS[error] ?? 'Buffer sign-in didn’t complete. Please try again.',
    }
  return null
}

/** Remove the return params from the address bar so a refresh doesn't repeat the notice. */
export function clearBufferReturn(): void {
  const url = new URL(window.location.href)
  BUFFER_PARAMS.forEach(name => url.searchParams.delete(name))
  window.history.replaceState(window.history.state, '', url.toString())
}

/**
 * After "Sign in with Hunter/Apollo", ranking-be sends the browser back to this
 * page with `?finder_connected=hunter` or `?finder_error=<code>`. These helpers
 * read that once and turn it into a sentence for the owner.
 */

const LABELS: Record<string, string> = { hunter: 'Hunter', apollo: 'Apollo' }

const ERRORS: Record<string, string> = {
  denied: 'Sign-in was cancelled on the provider’s page.',
  expired: 'The sign-in took too long. Please try again.',
  not_owner: 'Only the brand’s owner can connect tools.',
  token_exchange: 'The provider didn’t confirm the sign-in. Please try again.',
  missing_code: 'The provider didn’t confirm the sign-in. Please try again.',
  invalid_state: 'That sign-in link wasn’t valid. Please try again.',
}

export interface FinderReturn {
  ok: boolean
  message: string
}

export const RETURN_PARAMS = ['finder_connected', 'finder_error', 'finder'] as const

/** The outcome named in a query string, or null when it isn't a sign-in return. */
export function readFinderReturn(search: string): FinderReturn | null {
  const params = new URLSearchParams(search)
  const connected = params.get('finder_connected')
  if (connected) {
    return { ok: true, message: `${LABELS[connected] ?? 'The tool'} is connected.` }
  }
  const error = params.get('finder_error')
  if (error) {
    return { ok: false, message: ERRORS[error] ?? 'Sign-in didn’t complete. Please try again.' }
  }
  return null
}

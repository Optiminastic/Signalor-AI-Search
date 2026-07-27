'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { deleteAccount, DELETE_ACCOUNT_CONFIRM } from '@/lib/api/account'
import { ApiError } from '@/lib/api/client'
import { authClient, signOut } from '@/lib/auth-client'
import { clearClientSession } from '@/lib/clearClientSession'
import { Loader2, LogOut, Trash2 } from '@/lib/icons'
import { routes } from '@/lib/routes'

interface DangerZoneProps {
  email: string
}

/** Account actions: sign out, and irreversibly delete the account + all data. */
export function DangerZone({ email }: DangerZoneProps): JSX.Element {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async (): Promise<void> => {
    await signOut().catch(() => {})
    clearClientSession(queryClient)
    router.push(routes.signIn)
  }

  const handleDelete = async (): Promise<void> => {
    setBusy(true)
    setError('')
    try {
      await deleteAccount(email)
      await authClient.deleteUser().catch(() => {})
      await signOut().catch(() => {})
      clearClientSession(queryClient)
      // Hard navigation (not router.push): forces the browser to apply the
      // cleared session cookie and start from a blank in-memory state, so a
      // later sign-up is not shortcut past /sign-in by a lingering cookie.
      window.location.href = routes.home
    } catch (err) {
      // Surface the backend's exact reason (the `detail` carries the failing
      // record/constraint) so a blocking row is diagnosable, not a dead end.
      let message = 'Could not delete your account. Please try again.'
      if (err instanceof ApiError) {
        const body = err.data as { error?: unknown; detail?: unknown } | null
        const detail = body && typeof body.detail === 'string' ? body.detail : ''
        message = detail || err.message || message
      }
      setError(message)
      setBusy(false)
    }
  }

  const canDelete = text.trim().toLowerCase() === DELETE_ACCOUNT_CONFIRM && !busy

  return (
    <div className="rounded-xl border border-[rgba(229,72,77,0.35)] bg-[var(--cat-card)]">
      <div className="border-b border-[var(--cat-border-soft)] px-5 py-3.5">
        <h2 className="text-[14px] font-semibold text-[#E5484D]">Danger zone</h2>
        <p className="mt-0.5 text-xs text-[var(--cat-ink-3)]">
          Sign out of this device, or permanently delete your account.
        </p>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[13px] font-medium text-[var(--cat-ink)]">Sign out</p>
          <p className="text-xs text-[var(--cat-ink-3)]">End your session on this device.</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--cat-border)] px-3 text-[13px] font-medium text-[var(--cat-ink)] transition hover:bg-[var(--cat-hover)]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>

      <div className="border-t border-[var(--cat-border-soft)] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium text-[var(--cat-ink)]">Delete account</p>
            <p className="text-xs text-[var(--cat-ink-3)]">
              Permanently deletes your account, brands and analyses. This cannot be undone.
            </p>
          </div>
          {!confirming && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#E5484D] px-3 text-[13px] font-medium text-white transition hover:bg-[#d13b40]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>

        {confirming && (
          <div className="mt-3 space-y-2.5">
            <label className="block text-xs text-[var(--cat-ink-2)]">
              Type <span className="font-semibold text-[#E5484D]">{DELETE_ACCOUNT_CONFIRM}</span> to
              confirm
            </label>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={DELETE_ACCOUNT_CONFIRM}
              className="h-9 w-full rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-3 text-[13px] text-[var(--cat-ink)] outline-none focus:border-[#E5484D]"
            />
            {error && <p className="text-xs font-medium text-[#E5484D]">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canDelete}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#E5484D] px-4 text-[13px] font-semibold text-white transition hover:bg-[#d13b40] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete my account
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false)
                  setText('')
                  setError('')
                }}
                disabled={busy}
                className="inline-flex h-9 items-center rounded-md border border-[var(--cat-border)] px-4 text-[13px] font-medium text-[var(--cat-ink)] transition hover:bg-[var(--cat-hover)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

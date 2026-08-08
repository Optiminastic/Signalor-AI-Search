'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { ApiError } from '@/lib/api/client'
import { connectShopifyCustomApp, getShopifyAuthUrl } from '@/lib/api/integrations'
import { useSession } from '@/lib/auth-client'
import { ExternalLink, Loader2, X } from '@/lib/icons'

interface ShopifyConnectModalProps {
  onClose: () => void
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.data && typeof err.data === 'object') {
    const body = err.data as { error?: unknown }
    if (typeof body.error === 'string' && body.error) return body.error
  }
  return fallback
}

function Field({
  label,
  hint,
  value,
  placeholder,
  onChange,
}: {
  label: string
  hint: string
  value: string
  placeholder: string
  onChange: (v: string) => void
}): JSX.Element {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-[var(--cat-ink)]">{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-3 text-[13px] text-[var(--cat-ink)] placeholder:text-[var(--cat-ink-3)] focus:border-[#e04a3d] focus:outline-none"
      />
      <span className="text-[11px] text-[var(--cat-ink-3)]">{hint}</span>
    </label>
  )
}

function ModalHeader({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-[16px] font-semibold text-[var(--cat-ink)]">Connect Shopify</h2>
        <p className="mt-0.5 text-[12px] text-[var(--cat-ink-3)]">
          Install the app on your store to auto-fix SEO/GEO issues and sync your catalog.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="grid h-7 w-7 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        <X size={16} />
      </button>
    </div>
  )
}

interface ConnectState {
  shop: string
  setShop: (v: string) => void
  token: string
  setToken: (v: string) => void
  busy: boolean
  error: string
  showToken: boolean
  setShowToken: (v: boolean) => void
  install: () => void
  connectWithToken: () => void
}

interface Setters {
  setBusy: (v: boolean) => void
  setError: (v: string) => void
}

/** Redirect to Shopify's OAuth consent screen; the backend callback returns. */
async function runInstall(email: string, shop: string, set: Setters): Promise<void> {
  if (!email || !shop.trim()) return
  set.setBusy(true)
  set.setError('')
  try {
    window.location.href = await getShopifyAuthUrl(email, shop)
  } catch (err) {
    set.setError(errorMessage(err, 'Could not start the Shopify install. Try again.'))
    set.setBusy(false)
  }
}

/** OAuth install (primary) + custom-app token (fallback), kept out of the JSX. */
function useShopifyConnect(onClose: () => void): ConnectState {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const queryClient = useQueryClient()
  const [shop, setShop] = useState('')
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showToken, setShowToken] = useState(false)

  const connectWithToken = async (): Promise<void> => {
    if (!email || !shop.trim() || !token.trim()) return
    setBusy(true)
    setError('')
    try {
      await connectShopifyCustomApp({ email, shopDomain: shop, accessToken: token })
      await queryClient.invalidateQueries({ queryKey: ['catalyst', 'integrations'] })
      onClose()
    } catch (err) {
      setError(errorMessage(err, 'Could not connect. Check the domain and token.'))
    } finally {
      setBusy(false)
    }
  }

  return {
    shop,
    setShop,
    token,
    setToken,
    busy,
    error,
    showToken,
    setShowToken,
    install: () => void runInstall(email, shop, { setBusy, setError }),
    connectWithToken: () => void connectWithToken(),
  }
}

function InstallButton({
  busy,
  disabled,
  onClick,
}: {
  busy: boolean
  disabled: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <PrimaryButton className="w-full justify-center" disabled={disabled} onClick={onClick}>
      {busy ? (
        <>
          <Loader2 size={14} className="animate-spin" /> Redirecting to Shopify…
        </>
      ) : (
        <>
          <ExternalLink size={14} /> Install via Shopify
        </>
      )}
    </PrimaryButton>
  )
}

function TokenSection({ s }: { s: ConnectState }): JSX.Element {
  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-[var(--cat-border-soft)] pt-3">
      <Field
        label="Admin API access token"
        hint="Shopify Admin → Settings → Apps → Develop apps → your app → API credentials."
        value={s.token}
        placeholder="shpat_…"
        onChange={s.setToken}
      />
      <button
        type="button"
        disabled={s.busy || !s.shop.trim() || !s.token.trim()}
        onClick={s.connectWithToken}
        className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--cat-border)] text-[13px] font-medium text-[var(--cat-ink)] transition-colors hover:bg-[var(--cat-hover)] disabled:opacity-50"
      >
        {s.busy ? 'Connecting…' : 'Connect with token'}
      </button>
    </div>
  )
}

/**
 * Connect Shopify. Primary path is OAuth install (redirect to Shopify's consent
 * screen); a custom-app Admin API token is offered as a fallback for stores that
 * prefer not to install, or where OAuth env isn't configured.
 */
export function ShopifyConnectModal({ onClose }: ShopifyConnectModalProps): JSX.Element {
  const s = useShopifyConnect(onClose)
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-5 shadow-xl">
        <ModalHeader onClose={onClose} />
        <div className="mt-4 flex flex-col gap-3">
          <Field
            label="Store domain"
            hint="Your permanent *.myshopify.com domain."
            value={s.shop}
            placeholder="my-store.myshopify.com"
            onChange={s.setShop}
          />
          <InstallButton busy={s.busy} disabled={s.busy || !s.shop.trim()} onClick={s.install} />
          {s.error && <p className="text-[12px] text-[#E5484D]">{s.error}</p>}
          {s.showToken ? (
            <TokenSection s={s} />
          ) : (
            <button
              type="button"
              onClick={() => s.setShowToken(true)}
              className="self-start text-[12px] font-medium text-[var(--cat-ink-3)] underline underline-offset-2 hover:text-[var(--cat-ink)]"
            >
              Use a custom-app token instead
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

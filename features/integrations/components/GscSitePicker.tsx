'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { ApiError } from '@/lib/api/client'
import { getGscSites, selectGscSite, syncGsc, type GscSite } from '@/lib/api/integrations'
import { Check, Loader2 } from '@/lib/icons'

/** Pull the backend's real `{error: "..."}` reason out of a failed request. */
function messageOf(err: unknown): string {
  if (err instanceof ApiError && err.data && typeof err.data === 'object') {
    const body = err.data as { error?: unknown; detail?: unknown }
    const msg = body.error ?? body.detail
    if (typeof msg === 'string' && msg) return msg
  }
  return ''
}

function RadioDot({ checked }: { checked: boolean }): JSX.Element {
  return (
    <span
      aria-hidden
      className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors ${
        checked ? 'border-[#e04a3d]' : 'border-neutral-300'
      }`}
    >
      {checked && <span className="h-2 w-2 rounded-full bg-[#e04a3d]" />}
    </span>
  )
}

interface SiteOptionProps {
  site: GscSite
  checked: boolean
  onSelect: (siteUrl: string) => void
}

function SiteOption({ site, checked, onSelect }: SiteOptionProps): JSX.Element {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-all ${
        checked
          ? 'border-[#e04a3d] bg-[#e04a3d]/5 shadow-sm'
          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
      }`}
    >
      <input
        type="radio"
        name="gsc-site"
        value={site.site_url}
        checked={checked}
        onChange={() => onSelect(site.site_url)}
        className="sr-only"
      />
      <RadioDot checked={checked} />
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[13px] font-medium ${checked ? 'text-[#b9382d]' : 'text-neutral-900'}`}
        >
          {site.site_url}
        </span>
        {site.permission_level && (
          <span className="block truncate text-[12px] text-neutral-500">
            {site.permission_level}
          </span>
        )}
      </span>
      {checked && <Check className="h-4 w-4 shrink-0 text-[#e04a3d]" />}
    </label>
  )
}

function Notice({
  children,
  tone = 'muted',
}: {
  children: string
  tone?: 'muted' | 'error'
}): JSX.Element {
  return (
    <p className={`text-[13px] ${tone === 'error' ? 'text-[#E5484D]' : 'text-neutral-500'}`}>
      {children}
    </p>
  )
}

interface UseSelectSiteResult {
  save: (siteUrl: string) => Promise<void>
  saving: boolean
  error: string
}

/** Bind the chosen property, then kick off the first sync (best-effort). */
function useSelectSite(email: string, onDone: () => void): UseSelectSiteResult {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (siteUrl: string): Promise<void> => {
    if (!siteUrl) return
    setSaving(true)
    setError('')
    try {
      await selectGscSite({ email, siteUrl })
      // The binding is what matters; the dashboard auto-syncs stale data on read,
      // so a failed kick-off must not read as a failed connection.
      await syncGsc(email).catch(() => undefined)
      onDone()
    } catch {
      setError('Could not save that property. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return { save, saving, error }
}

/** The ready state: the site list + confirm button (owns the selection). */
function SiteChooser({
  sites,
  email,
  onDone,
}: {
  sites: GscSite[]
  email: string
  onDone: () => void
}): JSX.Element {
  const [selected, setSelected] = useState('')
  const { save, saving, error } = useSelectSite(email, onDone)
  return (
    <div className="flex w-full flex-col gap-3">
      <Notice>Choose the property to track for this brand.</Notice>
      <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-0.5">
        {sites.map(site => (
          <SiteOption
            key={site.site_url}
            site={site}
            checked={selected === site.site_url}
            onSelect={setSelected}
          />
        ))}
      </div>
      {error && <p className="text-[12px] text-[#E5484D]">{error}</p>}
      <PrimaryButton onClick={() => save(selected)} disabled={!selected || saving}>
        {saving ? 'Saving…' : 'Use this property'}
      </PrimaryButton>
    </div>
  )
}

interface GscSitePickerProps {
  email: string
  onDone: () => void
}

/**
 * Choose which Search Console property this brand reads from.
 *
 * Required, not optional: OAuth stores tokens but binds no property, and sync /
 * data both fail without one ("No Search Console property selected").
 */
export function GscSitePicker({ email, onDone }: GscSitePickerProps): JSX.Element {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['integrations', 'gsc-sites', email],
    enabled: Boolean(email),
    retry: false,
    queryFn: (): Promise<GscSite[]> => getGscSites(email),
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your Search Console properties…
      </div>
    )
  }
  if (isError) {
    return (
      <Notice tone="error">
        {messageOf(error) || 'Couldn’t load your Search Console properties. Try reconnecting.'}
      </Notice>
    )
  }
  if (!data || data.length === 0) {
    return (
      <Notice>
        This Google account has no verified Search Console properties. Verify your site in Search
        Console, then reconnect.
      </Notice>
    )
  }
  return <SiteChooser sites={data} email={email} onDone={onDone} />
}

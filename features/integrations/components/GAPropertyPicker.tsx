'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { getGAProperties, selectGAProperty, syncGA, type GAProperty } from '@/lib/api/integrations'
import { Check, Loader2 } from '@/lib/icons'

interface PropertyOptionProps {
  property: GAProperty
  checked: boolean
  onSelect: (propertyId: string) => void
}

function PropertyOption({ property, checked, onSelect }: PropertyOptionProps): JSX.Element {
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
        name="ga-property"
        value={property.property_id}
        checked={checked}
        onChange={() => onSelect(property.property_id)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors ${
          checked ? 'border-[#e04a3d]' : 'border-neutral-300'
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-[#e04a3d]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[13px] font-medium ${checked ? 'text-[#b9382d]' : 'text-neutral-900'}`}
        >
          {property.display_name}
        </span>
        <span className="block truncate text-[12px] text-neutral-500">
          {property.account_name} · {property.property_id}
        </span>
      </span>
      {checked && <Check className="text-primary-ink h-4 w-4 shrink-0" />}
    </label>
  )
}

interface NoticeProps {
  children: string
  tone?: 'muted' | 'error'
}

function Notice({ children, tone = 'muted' }: NoticeProps): JSX.Element {
  const color = tone === 'error' ? 'text-[#E5484D]' : 'text-neutral-500'
  return <p className={`text-[13px] ${color}`}>{children}</p>
}

interface PropertyListProps {
  properties: GAProperty[]
  selected: string
  onSelect: (propertyId: string) => void
}

function PropertyList({ properties, selected, onSelect }: PropertyListProps): JSX.Element {
  const [filter, setFilter] = useState('')
  const needle = filter.trim().toLowerCase()
  const shown = needle
    ? properties.filter(p =>
        `${p.display_name} ${p.account_name} ${p.property_id}`.toLowerCase().includes(needle),
      )
    : properties
  return (
    <>
      {properties.length > 5 && (
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder={`Search ${properties.length} properties…`}
          className="h-9 rounded-md border border-neutral-200 px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#e04a3d] focus:outline-none"
        />
      )}
      <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-0.5">
        {shown.length === 0 && (
          <p className="py-3 text-center text-[12px] text-neutral-400">No properties match.</p>
        )}
        {shown.map(p => (
          <PropertyOption
            key={p.property_id}
            property={p}
            checked={selected === p.property_id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  )
}

interface UseSelectPropertyResult {
  save: (property: GAProperty | undefined) => Promise<void>
  saving: boolean
  error: string
}

/** Bind the chosen property, then kick off the first sync. */
function useSelectProperty(email: string, onDone: () => void): UseSelectPropertyResult {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (property: GAProperty | undefined): Promise<void> => {
    if (!property) return
    setSaving(true)
    setError('')
    try {
      await selectGAProperty({
        email,
        propertyId: property.property_id,
        propertyName: property.display_name,
      })
      // Best-effort: the binding is what matters, and the dashboard auto-syncs
      // stale data on read, so a failed kick-off must not read as a failed
      // connection.
      await syncGA(email).catch(() => undefined)
      onDone()
    } catch {
      setError('Could not save that property. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return { save, saving, error }
}

interface GAPropertyPickerProps {
  email: string
  onDone: () => void
}

/**
 * Choose which GA4 property this brand reads from.
 *
 * Required, not optional: OAuth stores tokens but binds no property, and every
 * downstream GA call fails without one ("No GA4 property selected").
 */
export function GAPropertyPicker({ email, onDone }: GAPropertyPickerProps): JSX.Element {
  const [selected, setSelected] = useState('')
  const { save, saving, error } = useSelectProperty(email, onDone)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['integrations', 'ga-properties', email],
    enabled: Boolean(email),
    queryFn: (): Promise<GAProperty[]> => getGAProperties(email),
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your GA4 properties…
      </div>
    )
  }
  if (isError) {
    return <Notice tone="error">Couldn’t load your GA4 properties. Try reconnecting.</Notice>
  }
  if (!data || data.length === 0) {
    return (
      <Notice>
        This Google account has no GA4 properties. Create one in Google Analytics, then reconnect.
      </Notice>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Notice>Choose the property to track for this brand.</Notice>
      <PropertyList properties={data} selected={selected} onSelect={setSelected} />
      {error && <p className="text-[12px] text-[#E5484D]">{error}</p>}
      <PrimaryButton
        onClick={() => save(data.find(p => p.property_id === selected))}
        disabled={!selected || saving}
      >
        {saving ? 'Saving…' : 'Use this property'}
      </PrimaryButton>
    </div>
  )
}

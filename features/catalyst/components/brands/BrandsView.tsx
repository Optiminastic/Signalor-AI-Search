'use client'

import { useState } from 'react'

import { CONTROL_RING, SEARCH_FIELD } from '@/features/catalyst/components/control-styles'
import { DataState } from '@/features/catalyst/components/DataState'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { useBrandCapacity, type BrandCapacity } from '@/hooks/useBrandCapacity'
import { useBrands } from '@/hooks/useBrands'
import { LayoutGrid, List, Plus, Search } from '@/lib/icons'

import { BrandCard } from './BrandCard'
import { BrandsTable } from './BrandsTable'
import { NewBrandModal } from './NewBrandModal'

type View = 'table' | 'card'

/** Caps above this read as "no practical limit" and are not worth showing. */
const UNMETERED_FROM = 100

function ViewToggle({ view, setView }: { view: View; setView: (v: View) => void }): JSX.Element {
  const seg = (v: View): string =>
    `grid h-[26px] w-[26px] place-items-center rounded transition-colors ${
      view === v
        ? 'bg-[var(--cat-card)] text-[var(--cat-ink)] shadow-sm'
        : 'text-[var(--cat-ink-3)] hover:text-[var(--cat-ink)]'
    }`
  return (
    <div
      className={`flex h-[34px] shrink-0 items-center gap-1 rounded-md bg-[var(--cat-bg)] p-1 ${CONTROL_RING}`}
    >
      <button
        type="button"
        onClick={() => setView('table')}
        className={seg('table')}
        aria-label="Table view"
        aria-pressed={view === 'table'}
      >
        <List size={15} />
      </button>
      <button
        type="button"
        onClick={() => setView('card')}
        className={seg('card')}
        aria-label="Card view"
        aria-pressed={view === 'card'}
      >
        <LayoutGrid size={15} />
      </button>
    </div>
  )
}

function Toolbar({
  view,
  setView,
  query,
  setQuery,
}: {
  view: View
  setView: (v: View) => void
  query: string
  setQuery: (q: string) => void
}): JSX.Element {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="relative w-full max-w-[260px]">
        <Search
          size={15}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--cat-ink-3)]"
        />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search brands…"
          aria-label="Search brands"
          className={SEARCH_FIELD}
        />
      </div>
      <ViewToggle view={view} setView={setView} />
    </div>
  )
}

/** "3 of 6 brands · Managed Growth" — the cap is omitted when effectively unmetered. */
function capacityLabel(count: number, capacity: BrandCapacity | undefined): string {
  const noun = count === 1 ? 'brand' : 'brands'
  // A cap of 0 means unlimited. UNMETERED_FROM still guards against a large but
  // finite cap that isn't worth printing.
  const metered = !!capacity && capacity.max > 0 && capacity.max < UNMETERED_FROM
  const head = metered
    ? `${count} of ${capacity.max} ${noun}`
    : `${count} ${noun} in your workspace`
  return capacity?.planLabel ? `${head} · ${capacity.planLabel}` : head
}

function BrandsHeader({
  count,
  capacity,
  onNew,
}: {
  count: number
  capacity: BrandCapacity | undefined
  onNew: () => void
}): JSX.Element {
  const atLimit = capacity ? !capacity.canCreate : false
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--cat-ink)]">Brands</h1>
        <p className="mt-1 text-[13px] text-[var(--cat-ink-3)]">{capacityLabel(count, capacity)}</p>
      </div>
      <PrimaryButton
        icon={Plus}
        onClick={onNew}
        disabled={atLimit}
        className={atLimit ? 'cursor-not-allowed opacity-50' : ''}
        title={atLimit ? 'You have used every brand slot on your plan.' : undefined}
      >
        New brand
      </PrimaryButton>
    </header>
  )
}

export function BrandsView(): JSX.Element {
  const [view, setView] = useState<View>('table')
  const [query, setQuery] = useState('')
  const [isCreating, setCreating] = useState(false)
  const { data, isLoading, isError } = useBrands()
  const { data: capacity } = useBrandCapacity()

  const q = query.trim().toLowerCase()
  const all = data ?? []
  const brands = all.filter(b => b.name.toLowerCase().includes(q) || b.url.includes(q))

  return (
    <div className="w-full">
      <BrandsHeader count={all.length} capacity={capacity} onNew={() => setCreating(true)} />
      <Toolbar view={view} setView={setView} query={query} setQuery={setQuery} />

      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={all.length === 0}
        emptyTitle="No brands yet"
        emptyHint="Add a brand and run its first analysis to see it here."
      >
        {view === 'table' ? (
          <BrandsTable brands={brands} />
        ) : (
          <div className="cat-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map(b => (
              <BrandCard key={b.slug} brand={b} />
            ))}
          </div>
        )}
      </DataState>

      {isCreating && <NewBrandModal onClose={() => setCreating(false)} />}
    </div>
  )
}

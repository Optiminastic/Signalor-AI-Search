'use client'

import { TransitionLink } from '@/components/TransitionLink'
import { DataState } from '@/features/catalyst/components/DataState'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { ShoppingProductTable } from '@/features/catalyst/components/shopping/ShoppingProductTable'
import {
  ShoppingIssuesCard,
  ShoppingScoreCard,
} from '@/features/catalyst/components/shopping/ShoppingSummaryCards'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useShopping } from '@/hooks/useShopping'
import type { ShoppingReadiness } from '@/lib/api/shopping'
import { RefreshCw, Store } from '@/lib/icons'

function ConnectPrompt(): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--cat-border)] bg-[var(--cat-card)] px-6 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[rgba(224,74,61,0.1)] text-[#e04a3d]">
        <Store size={20} />
      </span>
      <p className="text-[14px] font-semibold text-[var(--cat-ink)]">Connect your Shopify store</p>
      <p className="max-w-md text-[12px] leading-relaxed text-[var(--cat-ink-3)]">
        SignalorAI scores every product for AI-shopping readiness — descriptions, images, prices and
        structure that assistants like ChatGPT and Perplexity can actually read.
      </p>
      <TransitionLink
        href={brandPath('integrations')}
        className="auth-cta-btn mt-1 inline-flex h-[34px] items-center rounded-md px-3.5 text-[13px] font-semibold text-white"
      >
        Connect Shopify
      </TransitionLink>
    </div>
  )
}

function FirstSyncPrompt({
  onSync,
  syncing,
}: {
  onSync: () => void
  syncing: boolean
}): JSX.Element {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--cat-border)] bg-[var(--cat-card)] px-6 text-center">
      <p className="text-[14px] font-semibold text-[var(--cat-ink)]">Store connected</p>
      <p className="max-w-md text-[12px] leading-relaxed text-[var(--cat-ink-3)]">
        Pull your catalog to score every product for AI-shopping readiness.
      </p>
      <div className="mt-1">
        <PrimaryButton icon={RefreshCw} disabled={syncing} onClick={onSync}>
          {syncing ? 'Scoring your catalog…' : 'Sync catalog'}
        </PrimaryButton>
      </div>
    </div>
  )
}

function ShoppingBody({ data }: { data: ShoppingReadiness }): JSX.Element {
  return (
    <div className="cat-stagger flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
        <ShoppingScoreCard data={data} />
        <ShoppingIssuesCard data={data} />
      </div>
      <ShoppingProductTable data={data} />
    </div>
  )
}

interface StateBodyProps {
  data: ShoppingReadiness
  sync: () => void
  isSyncing: boolean
}

function StateBody({ data, sync, isSyncing }: StateBodyProps): JSX.Element {
  if (!data.connected) return <ConnectPrompt />
  if (data.product_count === 0) return <FirstSyncPrompt onSync={sync} syncing={isSyncing} />
  return <ShoppingBody data={data} />
}

/** Shopping — per-product AI-shopping readiness for the connected store. */
export function ShoppingView(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError, sync, isSyncing } = useShopping(slug)
  const showSync = Boolean(data?.connected && data.product_count > 0)

  return (
    <>
      <div className="cat-rise flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--cat-border)] pb-4">
        <div className="min-w-0">
          <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">Shopping</h1>
          <p className="text-[13px] text-[var(--cat-ink-2)]">
            How ready your product catalog is for AI shopping assistants
          </p>
        </div>
        {showSync && (
          <div className="ml-auto">
            <PrimaryButton icon={RefreshCw} disabled={isSyncing} onClick={sync}>
              {isSyncing ? 'Syncing…' : 'Re-sync catalog'}
            </PrimaryButton>
          </div>
        )}
      </div>
      <div className="-mx-3 mt-3 min-h-0 flex-1 overflow-y-auto px-3">
        <DataState
          isLoading={projectLoading || isLoading}
          isError={isError}
          isEmpty={!slug || !data}
          emptyTitle="No shopping data yet"
          emptyHint="Run an analysis on this brand first."
        >
          {data && <StateBody data={data} sync={sync} isSyncing={isSyncing} />}
        </DataState>
      </div>
    </>
  )
}

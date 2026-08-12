'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'

import { GithubPrLink } from '@/features/catalyst/components/autofix/GithubPrLink'
import { DataState } from '@/features/catalyst/components/DataState'
import { QuickFixesRail } from '@/features/catalyst/components/optimisation/QuickFixesRail'
import { AlertCircle, ExternalLink, FileText, X } from '@/features/site/components/icons'
import { BrowserChrome } from '@/features/site/components/optimisation/browser-chrome'
import { ElementEditor } from '@/features/site/components/optimisation/element-editor'
import { PageIframe } from '@/features/site/components/optimisation/page-iframe'
import { RawFilesPanel } from '@/features/site/components/optimisation/raw-files-panel'
import type { PreviewElement } from '@/features/site/lib/api/content-optimisation'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useContentOptimisation, type ContentOptimisation } from '@/hooks/useContentOptimisation'
import { Zap } from '@/lib/icons'

interface PreviewFields {
  previewImage: string
  previewElements: PreviewElement[]
  viewportWidth: number
  emptyMessage: string | undefined
  selectedElementId: number | null
}

/** Null-safe defaults for the preview iframe, kept out of JSX to stay simple. */
function previewFor(co: ContentOptimisation): PreviewFields {
  const f = co.pageFields
  const emptyMessage = co.pageError ?? undefined
  const selectedElementId = co.selectedElement?.id ?? null
  if (!f) {
    return {
      previewImage: '',
      previewElements: [],
      viewportWidth: 1440,
      emptyMessage,
      selectedElementId,
    }
  }
  return {
    previewImage: f.preview_image,
    previewElements: f.preview_elements,
    viewportWidth: f.preview_viewport_width,
    emptyMessage,
    selectedElementId,
  }
}

interface RailToggleProps {
  on: boolean
  onClick: () => void
  title: string
  children: ReactNode
}

function RailToggle({ on, onClick, title, children }: RailToggleProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition ${
        on
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border bg-background text-foreground hover:bg-muted/40'
      }`}
    >
      {children}
    </button>
  )
}

interface ChromeHeaderProps {
  co: ContentOptimisation
  fixesOpen: boolean
  onToggleFixes: () => void
  onToggleRaw: () => void
}

function HeaderToggles({
  co,
  fixesOpen,
  onToggleFixes,
  onToggleRaw,
}: ChromeHeaderProps): JSX.Element {
  return (
    <>
      <RailToggle
        on={fixesOpen}
        onClick={onToggleFixes}
        title="Auto-fixable recommendations for this site"
      >
        <Zap className="size-3.5" />
        Quick fixes
      </RailToggle>
      <RailToggle
        on={co.showRawFiles}
        onClick={onToggleRaw}
        title="Crawler & AI files (robots.txt, llms-txt, humans-txt, ads-txt)"
      >
        <FileText className="size-3.5" />
        Crawler files
      </RailToggle>
    </>
  )
}

function ChromeHeader(props: ChromeHeaderProps): JSX.Element {
  const { co } = props
  return (
    <div className="border-border bg-muted/25 flex items-center gap-2 border-b pr-2">
      <div className="min-w-0 flex-1">
        <BrowserChrome
          url={co.url}
          baseUrl={co.baseUrl}
          pages={co.pages}
          canGoBack={co.canGoBack}
          canGoForward={co.canGoForward}
          isLoading={co.pageLoading}
          onUrlChange={co.setUrl}
          onBack={co.onBack}
          onForward={co.onForward}
          onRefresh={co.onRefresh}
        />
      </div>
      <HeaderToggles {...props} />
    </div>
  )
}

/** The "how edits apply" banner line — GitHub PR, connect-prompt, or nothing. */
function ModeHint({ co }: { co: ContentOptimisation }): JSX.Element | null {
  const brandPath = useBrandPath()
  if (!co.pageFields || co.applyMode === 'cms') return null
  if (co.applyMode === 'github') {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-[11px]">
        <AlertCircle className="size-3.5" />
        <span>
          Next.js repo connected ({co.githubRepo}). Edits open a pull request — review &amp; merge
          to apply.
        </span>
      </p>
    )
  }
  return (
    <p className="text-muted-foreground flex items-center gap-2 text-[11px]">
      <AlertCircle className="size-3.5" />
      <span>Click any element to edit. To apply, connect WordPress/Shopify or a GitHub repo.</span>
      <Link
        href={brandPath('integrations')}
        className="text-primary inline-flex items-center gap-0.5 font-semibold hover:underline"
      >
        Connect <ExternalLink className="size-3" />
      </Link>
    </p>
  )
}

function NoticeBar({ co }: { co: ContentOptimisation }): JSX.Element | null {
  const showModeHint = co.applyMode !== 'cms' && co.pageFields
  if (!co.error && !co.notice && !co.prUrl && !showModeHint) return null
  return (
    <div className="border-border bg-muted/15 flex flex-col gap-1 border-b px-3 py-2">
      <ModeHint co={co} />
      {co.error ? <p className="text-destructive text-[11px]">{co.error}</p> : null}
      {co.notice ? <p className="text-success text-[11px]">{co.notice}</p> : null}
      {co.prUrl ? (
        <GithubPrLink href={co.prUrl} iconSize={12}>
          View pull request
        </GithubPrLink>
      ) : null}
    </div>
  )
}

interface RightRailProps {
  co: ContentOptimisation
  slug: string
  showFixes: boolean
  onCloseFixes: () => void
}

function RightRail({ co, slug, showFixes, onCloseFixes }: RightRailProps): JSX.Element | null {
  if (co.showRawFiles) {
    return (
      <div className="bg-background w-[380px] min-w-[320px] shrink-0 overflow-y-auto">
        <div className="border-border flex items-center justify-between border-b px-3 py-2">
          <p className="text-foreground text-xs font-semibold">Crawler &amp; AI files</p>
          <button
            type="button"
            onClick={co.toggleRawFiles}
            className="text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-md p-1"
            aria-label="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <RawFilesPanel slug={slug} pluginConnected={co.pluginConnected} />
      </div>
    )
  }
  if (showFixes) return <QuickFixesRail slug={slug} onClose={onCloseFixes} />
  if (!co.selectedElement) return null
  return (
    <div className="w-[360px] min-w-[300px] shrink-0">
      <ElementEditor
        element={co.selectedElement}
        applyDisabled={co.applyMode === 'none'}
        applyDisabledHint={co.applyDisabledHint}
        applyLabel={co.applyLabel}
        isRewriting={co.rewriting}
        isApplying={co.applying}
        onClose={() => co.setSelectedElement(null)}
        onRewrite={co.onRewrite}
        onApply={co.onApply}
      />
    </div>
  )
}

function PreviewPane({ co, slug, showFixes, onCloseFixes }: RightRailProps): JSX.Element {
  const railOpen = Boolean(co.selectedElement) || co.showRawFiles || showFixes
  return (
    <div className="flex min-h-0 flex-1">
      <div className={`min-w-0 flex-1 ${railOpen ? 'border-border border-r' : ''}`}>
        <PageIframe
          {...previewFor(co)}
          isLoading={co.pageLoading}
          onRetry={co.url ? co.onRefresh : undefined}
          onSelectElement={co.setSelectedElement}
        />
      </div>
      <RightRail co={co} slug={slug} showFixes={showFixes} onCloseFixes={onCloseFixes} />
    </div>
  )
}

interface RailState {
  showFixes: boolean
  toggleFixes: () => void
  toggleRaw: () => void
  closeFixes: () => void
}

/** Quick-fixes rail visibility, kept mutually exclusive with the raw-files rail. */
function useRailState(co: ContentOptimisation): RailState {
  const [showFixes, setShowFixes] = useState(false)
  return {
    showFixes,
    toggleFixes: () => {
      if (!showFixes && co.showRawFiles) co.toggleRawFiles()
      setShowFixes(o => !o)
    },
    toggleRaw: () => {
      if (!co.showRawFiles) setShowFixes(false)
      co.toggleRawFiles()
    },
    closeFixes: () => setShowFixes(false),
  }
}

export function ContentOptimisationView(): JSX.Element {
  const { slug, run, isLoading } = useActiveProject()
  const co = useContentOptimisation({ slug, runUrl: run?.url })
  const rails = useRailState(co)

  if (!slug) {
    return (
      <DataState
        isLoading={isLoading}
        isError={false}
        isEmpty
        emptyTitle="No analysis yet"
        emptyHint="Run an analysis on this brand to edit its pages here."
      >
        <div />
      </DataState>
    )
  }

  return (
    <div className="border-border/60 bg-card flex h-[calc(100dvh-150px)] min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm">
      <ChromeHeader
        co={co}
        fixesOpen={rails.showFixes}
        onToggleFixes={rails.toggleFixes}
        onToggleRaw={rails.toggleRaw}
      />
      <NoticeBar co={co} />
      <PreviewPane
        co={co}
        slug={slug}
        showFixes={rails.showFixes}
        onCloseFixes={rails.closeFixes}
      />
    </div>
  )
}

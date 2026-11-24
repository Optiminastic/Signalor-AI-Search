'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Loader2,
  Globe2,
  Check,
  ChevronDown,
  Lock,
} from '@/features/site/components/icons'
import { cn } from '@/features/site/lib/utils'
import type { ContentPage } from '@/features/site/lib/api/content-optimisation'

type Props = {
  url: string
  baseUrl: string
  pages: ContentPage[]
  canGoBack: boolean
  canGoForward: boolean
  isLoading: boolean
  onUrlChange: (url: string) => void
  onBack: () => void
  onForward: () => void
  onRefresh: () => void
}

function getPath(fullUrl: string, base: string): string {
  if (base && fullUrl.startsWith(base)) {
    return fullUrl.slice(base.length) || '/'
  }
  return fullUrl
}

/** The classic three window dots — purely decorative, sells the browser frame. */
function TrafficLights() {
  return (
    <span className="mr-0.5 flex shrink-0 items-center gap-1.5 pl-1" aria-hidden>
      <span className="size-2.5 rounded-full bg-[#FF5F57]/80" />
      <span className="size-2.5 rounded-full bg-[#FEBC2E]/80" />
      <span className="size-2.5 rounded-full bg-[#28C840]/80" />
    </span>
  )
}

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex size-8 items-center justify-center rounded-full transition',
        disabled
          ? 'text-muted-foreground/35 cursor-not-allowed'
          : 'text-foreground/80 hover:bg-muted hover:text-foreground active:scale-95',
      )}
      aria-label={label}
    >
      {children}
    </button>
  )
}

function PagesMenu({
  pages,
  url,
  onPick,
}: {
  pages: ContentPage[]
  url: string
  onPick: (url: string) => void
}) {
  return (
    <div className="border-border bg-popover absolute top-full right-0 left-0 z-30 mt-1.5 max-h-72 overflow-y-auto rounded-lg border py-1 shadow-xl">
      <p className="text-muted-foreground px-3 pt-1.5 pb-1 text-[10px] font-semibold tracking-wider uppercase select-none">
        Crawled pages
      </p>
      {pages.slice(0, 50).map(p => {
        const active = p.url === url
        return (
          <button
            key={p.url}
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => onPick(p.url)}
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition',
              active ? 'bg-muted/60' : 'hover:bg-muted/40',
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="text-foreground block truncate font-medium">{p.path || '/'}</span>
              <span className="text-muted-foreground block truncate text-[11px]">
                {p.title || p.url}
              </span>
            </span>
            {active ? <Check className="text-primary-ink size-3.5 shrink-0" /> : null}
          </button>
        )
      })}
    </div>
  )
}

export function BrowserChrome({
  url,
  baseUrl,
  pages,
  canGoBack,
  canGoForward,
  isLoading,
  onUrlChange,
  onBack,
  onForward,
  onRefresh,
}: Props) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const currentPath = getPath(url, baseUrl)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div className="relative flex items-center gap-1.5 px-3 py-2">
      <TrafficLights />
      <NavButton onClick={onBack} disabled={!canGoBack} label="Back">
        <ArrowLeft className="size-4" />
      </NavButton>
      <NavButton onClick={onForward} disabled={!canGoForward} label="Forward">
        <ArrowRight className="size-4" />
      </NavButton>
      <NavButton onClick={onRefresh} disabled={isLoading} label="Refresh">
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
      </NavButton>

      {/* URL bar — domain locked, path shown, pages menu on the right */}
      <div className="relative ml-1 flex-1" ref={wrapperRef}>
        <div className="border-border/80 bg-muted/30 hover:border-border hover:bg-muted/45 flex h-9 items-center gap-1.5 rounded-full border px-1.5 pr-2 shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-colors">
          {baseUrl ? (
            <>
              <span
                className="bg-background text-foreground/80 ring-border/60 flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-sm ring-1 select-none"
                title="Domain locked to your project URL"
              >
                <Lock className="text-success size-3 shrink-0" />
                {baseUrl.replace(/^https?:\/\//, '')}
              </span>
              <span className="text-foreground min-w-0 truncate text-[13px] font-medium select-none">
                {currentPath || '/'}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 truncate pl-1 text-[13px] select-none">
              <Globe2 className="size-3.5 shrink-0" />
              {url || 'No URL configured'}
            </span>
          )}

          {pages.length > 0 ? (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => setOpen(v => !v)}
              className={cn(
                'ml-auto flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition',
                open
                  ? 'border-primary/40 bg-primary/10 text-primary-ink'
                  : 'text-muted-foreground hover:border-border hover:bg-background hover:text-foreground border-transparent hover:shadow-sm',
              )}
              aria-label="Browse site pages"
              aria-expanded={open}
              title="Browse site pages"
            >
              <span className="font-medium tabular-nums">{pages.length} pages</span>
              <ChevronDown className={cn('size-3 transition', open && 'rotate-180')} />
            </button>
          ) : null}
        </div>

        {open && pages.length > 0 ? (
          <PagesMenu
            pages={pages}
            url={url}
            onPick={next => {
              setOpen(false)
              onUrlChange(next)
            }}
          />
        ) : null}
      </div>

      {/* Browser-style loading shimmer along the chrome's bottom edge. */}
      {isLoading ? (
        <span
          className="from-primary/0 via-primary/70 to-primary/0 absolute inset-x-0 -bottom-px h-[2px] animate-pulse bg-gradient-to-r"
          aria-hidden
        />
      ) : null}
    </div>
  )
}

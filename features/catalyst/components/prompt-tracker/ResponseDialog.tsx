'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import {
  MentionIndicator,
  sentimentColor,
} from '@/features/catalyst/components/prompt-tracker/PromptChips'
import { ResponseText } from '@/features/catalyst/components/prompt-tracker/ResponseText'
import { SiteFavicon } from '@/features/catalyst/components/SiteFavicon'
import { LOGO_SIZE } from '@/features/catalyst/constants'
import { brandsInAnswer } from '@/features/catalyst/prompt-detail-analytics'
import type { Citation, PromptEngineResult } from '@/features/catalyst/prompt-tracker-data'
import { formatTaskDate } from '@/features/catalyst/tasks-data'
import { useBrandTerms } from '@/hooks/useBrandTerms'
import { getPromptResult } from '@/lib/api/prompts'
import { Check, Copy, ExternalLink, Link2, Loader2, X } from '@/lib/icons'
import { queryKeys } from '@/lib/query-keys'

interface ResponseDialogProps {
  result: PromptEngineResult
  /** Slug + track id needed to fetch the FULL (uncapped) response on open. */
  slug: string
  trackId: number
  /** The prompt this answer came from, shown above the answer. */
  promptText: string
  onClose: () => void
}

type DetailTab = 'response' | 'citations'

const MAX_BRAND_LOGOS = 5

/** One labelled figure in the header strip. */
function Stat({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="min-w-0">
      <p className="text-[11.5px] whitespace-nowrap text-[var(--cat-ink-3)]">{label}</p>
      <div className="mt-1.5 flex items-center gap-1.5">{children}</div>
    </div>
  )
}

function BrandsStat({ result }: { result: PromptEngineResult }): JSX.Element {
  const sites = brandsInAnswer(result)
  const shown = sites.slice(0, MAX_BRAND_LOGOS)
  const extra = sites.length - shown.length
  return (
    <Stat label="Brands mentioned">
      {sites.length === 0 ? (
        <span className="text-[13px] text-[var(--cat-ink-3)]">None cited</span>
      ) : (
        <>
          {shown.map(site => (
            <SiteFavicon
              key={site.domain}
              domain={site.domain}
              size={LOGO_SIZE.chip}
              title={`${site.domain}${site.isBrand ? ' (you)' : ''}`}
            />
          ))}
          {extra > 0 && <span className="text-[11px] text-[var(--cat-ink-3)]">+{extra}</span>}
        </>
      )}
    </Stat>
  )
}

/** The prompt that produced this answer, copyable. */
function UserPrompt({ text }: { text: string }): JSX.Element {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <div>
      <p className="text-[11.5px] text-[var(--cat-ink-3)]">Prompt</p>
      <div className="mt-1.5 flex items-start gap-2 rounded-md border border-[var(--cat-border)] bg-[var(--cat-hover)] px-3 py-2">
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-[var(--cat-ink)]">{text}</p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(text).then(() => setCopied(true))
          }}
          aria-label="Copy prompt"
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-card)] hover:text-[var(--cat-ink)]"
        >
          {copied ? <Check size={13} className="text-[#1e8a5c]" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  )
}

function TabButton({
  label,
  count,
  selected,
  onSelect,
}: {
  label: string
  count?: number
  selected: boolean
  onSelect: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={`border-b-2 pt-2.5 pb-2 text-[13px] transition-colors ${
        selected
          ? 'border-[#e04a3d] font-semibold text-[var(--cat-ink)]'
          : 'border-transparent font-medium text-[var(--cat-ink-3)] hover:text-[var(--cat-ink)]'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1.5 rounded-full bg-[var(--cat-hover)] px-1.5 text-[10px] font-semibold tabular-nums">
          {count}
        </span>
      )}
    </button>
  )
}

function DetailTabs({
  active,
  citationCount,
  onChange,
}: {
  active: DetailTab
  citationCount: number
  onChange: (tab: DetailTab) => void
}): JSX.Element {
  const tabs: { value: DetailTab; label: string; count?: number }[] = [
    { value: 'response', label: 'Response' },
    { value: 'citations', label: 'Citations', count: citationCount },
  ]
  return (
    <div role="tablist" className="flex items-center gap-5 border-b border-[var(--cat-border)]">
      {tabs.map(tab => (
        <TabButton
          key={tab.value}
          label={tab.label}
          count={tab.count}
          selected={tab.value === active}
          onSelect={() => onChange(tab.value)}
        />
      ))}
    </div>
  )
}

function CitationRow({ citation }: { citation: Citation }): JSX.Element {
  return (
    <li className="flex items-start gap-2.5 rounded-md border border-[var(--cat-border)] px-3 py-2">
      <SiteFavicon domain={citation.domain} size={LOGO_SIZE.chip} />
      <div className="min-w-0 flex-1">
        <a
          href={citation.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[12.5px] font-medium text-[var(--cat-ink)] hover:underline"
        >
          <span className="truncate">{citation.title || citation.domain}</span>
          <ExternalLink size={11} className="shrink-0 text-[var(--cat-ink-3)]" />
        </a>
        <p className="mt-0.5 truncate text-[11.5px] text-[var(--cat-ink-3)]">{citation.url}</p>
      </div>
      {citation.isBrand && (
        <span className="shrink-0 rounded-sm bg-[rgba(47,190,126,0.12)] px-1.5 py-0.5 text-[10px] font-medium text-[#1e8a5c]">
          You
        </span>
      )}
      {citation.isCompetitor && (
        <span className="shrink-0 rounded-sm bg-[var(--cat-hover)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--cat-ink-2)]">
          Rival
        </span>
      )}
    </li>
  )
}

/** Every source this one answer cited, brand-owned first. */
function CitationsList({ result }: { result: PromptEngineResult }): JSX.Element {
  if (result.citations.length === 0) {
    return <p className="text-[12.5px] text-[var(--cat-ink-3)]">This answer cited no sources.</p>
  }
  const sorted = [...result.citations].sort(
    (a, b) => Number(b.isBrand) - Number(a.isBrand) || a.position - b.position,
  )
  return (
    <ul className="flex flex-col gap-2">
      {sorted.map(citation => (
        <CitationRow key={citation.url} citation={citation} />
      ))}
    </ul>
  )
}

/** Everything measurable about this one answer, in a row. */
function HeaderStats({ result }: { result: PromptEngineResult }): JSX.Element {
  const sentiment = result.sentiment.toLowerCase()
  return (
    <div className="mt-3 flex flex-wrap items-start gap-x-8 gap-y-3">
      <Stat label="Visibility">
        <MentionIndicator mentioned={result.mentioned} position={result.position} size="md" />
      </Stat>
      <Stat label="Sentiment">
        <span
          className="text-[13px] font-semibold capitalize"
          style={{ color: sentimentColor(sentiment) ?? 'var(--cat-ink-3)' }}
        >
          {sentiment || 'Unknown'}
        </span>
      </Stat>
      <Stat label="Model">
        <EngineLogo name={result.engineLabel} size={LOGO_SIZE.chip} />
        <span className="text-[13px] font-medium text-[var(--cat-ink)]">{result.engineLabel}</span>
      </Stat>
      <BrandsStat result={result} />
      <Stat label="Citations">
        <Link2 size={13} className="text-[var(--cat-ink-3)]" />
        <span className="text-[13px] font-medium text-[var(--cat-ink)] tabular-nums">
          {result.citations.length}
        </span>
      </Stat>
      {result.checkedAt && (
        <Stat label="Received">
          <span className="text-[13px] font-medium text-[var(--cat-ink)]">
            {formatTaskDate(result.checkedAt)}
          </span>
        </Stat>
      )}
    </div>
  )
}

/** The stat strip across the top of the detail panel. */
function DetailHeader({
  result,
  onClose,
}: Pick<ResponseDialogProps, 'result' | 'onClose'>): JSX.Element {
  return (
    <div className="border-b border-[var(--cat-border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-[var(--cat-ink)]">Response details</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
        >
          <X size={15} />
        </button>
      </div>
      <HeaderStats result={result} />
    </div>
  )
}

/** The answer body, fetched uncapped and highlighted. */
function ResponseBody({
  result,
  slug,
  trackId,
}: Omit<ResponseDialogProps, 'onClose'>): JSX.Element {
  // The list payload caps response_text at 500 chars; fetch the full answer here.
  // Fall back to the capped snippet while it loads (and if the fetch fails).
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.catalyst.promptResult(slug, trackId, result.id),
    enabled: Boolean(slug),
    queryFn: () => getPromptResult(slug, trackId, result.id),
    staleTime: 5 * 60_000,
  })
  const terms = useBrandTerms(result.citations)
  const fullText = data?.response_text ?? result.snippet

  if (!fullText) {
    return (
      <p className="text-[12.5px] text-[var(--cat-ink-3)]">No answer text captured for this run.</p>
    )
  }
  return (
    <>
      <ResponseText text={fullText} terms={terms} />
      {isLoading && !data && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--cat-ink-3)]">
          <Loader2 size={12} className="animate-spin" />
          Loading full response…
        </p>
      )}
    </>
  )
}

function DialogPanel({
  result,
  slug,
  trackId,
  promptText,
  onClose,
}: ResponseDialogProps): JSX.Element {
  const [tab, setTab] = useState<DetailTab>('response')
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${result.engineLabel} response details`}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <DetailHeader result={result} onClose={onClose} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 pt-3.5">
            <UserPrompt text={promptText} />
          </div>
          <div className="mt-3.5 px-4">
            <DetailTabs active={tab} citationCount={result.citations.length} onChange={setTab} />
          </div>
          <div className="p-4">
            {tab === 'response' ? (
              <ResponseBody result={result} slug={slug} trackId={trackId} promptText={promptText} />
            ) : (
              <CitationsList result={result} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * One engine answer in full, with the numbers that describe it.
 *
 * Rendered through a portal on purpose: the prompt row's `cat-rise` animation
 * applies a `transform`, which makes that ancestor the containing block for
 * `position: fixed` children. Without the portal the overlay anchors to the row
 * and gets clipped by its `overflow-hidden` instead of covering the viewport.
 */
export function ResponseDialog(props: ResponseDialogProps): JSX.Element | null {
  const { onClose } = props

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  // Only ever rendered from a click handler, so this is a pure SSR guard.
  if (typeof document === 'undefined') return null

  return createPortal(<DialogPanel {...props} />, document.body)
}

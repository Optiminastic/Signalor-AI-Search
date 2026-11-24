'use client'

import { useCallback, useState } from 'react'
import { ArrowRight, Globe, Loader2 } from '@/features/site/components/icons'

import { Button } from '@/features/site/components/ui/button'
import { ToolGateCard } from '@/features/site/components/tools/tool-gate-card'
import { checkDomainRating, type DomainRatingResult } from '@/features/site/lib/api/domain-rating'

type State =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'done'; data: DomainRatingResult }
  | { kind: 'error'; message: string }

/** Strip scheme, www., and any path/query so we're left with a bare hostname. */
function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/?#].*$/, '')
}

// 1+ labels + a 2-letter-min TLD, no scheme/path/spaces.
const DOMAIN_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/

function isValidDomain(domain: string): boolean {
  return DOMAIN_RE.test(domain)
}

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  return "Couldn't fetch domain rating. Try again."
}

/** Show the decimal when present (0.4), but no trailing ".0" for whole values (99). */
function formatRating(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function ratingTone(value: number) {
  if (value >= 70) return 'text-success'
  if (value >= 40) return 'text-warning'
  if (value >= 20) return 'text-orange-600'
  return 'text-destructive'
}

export function DomainRatingInline() {
  const [domain, setDomain] = useState('')
  const [touched, setTouched] = useState(false)
  const [state, setState] = useState<State>({ kind: 'idle' })

  const normalized = normalizeDomain(domain)
  const valid = isValidDomain(normalized)
  const showFormatError = touched && domain.trim().length > 0 && !valid

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setTouched(true)
      if (!valid) return
      setState({ kind: 'running' })
      try {
        const data = await checkDomainRating(normalized)
        setState({ kind: 'done', data })
      } catch (err) {
        setState({ kind: 'error', message: errorMessage(err) })
      }
    },
    [normalized, valid],
  )

  return (
    <div className="w-full">
      <form onSubmit={submit} className="w-full">
        <label className="text-foreground block text-sm font-semibold">Domain</label>
        <div className="bg-card ring-border focus-within:ring-primary/50 mt-2 flex w-full items-center gap-2 rounded-md p-1.5 shadow-sm ring-1 shadow-black/5 focus-within:ring-2">
          <Globe className="text-muted-foreground ml-2 h-4 w-4" aria-hidden />
          <input
            type="text"
            inputMode="url"
            placeholder="Enter your domain (e.g. signalor.ai)"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={state.kind === 'running'}
            className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none disabled:opacity-60"
            aria-invalid={showFormatError}
          />
        </div>

        {showFormatError && (
          <p className="text-destructive mt-2 text-xs">
            Enter a valid domain, e.g. <span className="font-medium">signalor.ai</span> (no https://
            or paths).
          </p>
        )}

        <Button
          type="submit"
          disabled={!valid || state.kind === 'running'}
          className="bg-primary-strong mt-3 w-full rounded-md text-sm font-semibold text-white hover:brightness-110"
        >
          {state.kind === 'running' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking domain rating
            </>
          ) : (
            <>
              Check domain rating
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {state.kind === 'running' && (
        <div className="bg-card ring-border mt-5 rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
          <div className="text-foreground flex items-center gap-2 text-sm">
            <Loader2 className="text-primary-ink h-4 w-4 animate-spin" />
            Looking up domain authority…
          </div>
        </div>
      )}

      {state.kind === 'error' && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mt-5 rounded-xl border p-4 text-sm">
          {state.message}
        </div>
      )}

      {state.kind === 'done' && (
        <ResultView data={state.data} onReset={() => setState({ kind: 'idle' })} />
      )}
    </div>
  )
}

function ResultView({ data, onReset }: { data: DomainRatingResult; onReset: () => void }) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          Results for <span className="text-foreground font-semibold">{data.domain}</span>
        </p>
        <button
          type="button"
          onClick={onReset}
          className="text-muted-foreground shrink-0 text-[11px] font-semibold underline-offset-4 hover:underline"
        >
          Check another domain
        </button>
      </div>

      {/* Domain Rating (only) */}
      <div className="bg-card ring-border rounded-xl border border-transparent p-6 shadow-sm ring-1 shadow-black/6.5">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
          Domain Rating (DR)
        </p>
        <p className="mt-1.5 text-4xl font-bold tracking-tight tabular-nums">
          <span className={ratingTone(data.domain_rating)}>{formatRating(data.domain_rating)}</span>
          <span className="text-muted-foreground text-xl font-semibold">/100</span>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Authority score (0&ndash;100) from Ahrefs.
        </p>
      </div>

      <ToolGateCard
        theme="blue"
        signedOutMessage="Sign up to track your Domain Rating over time and benchmark it against competitors."
        upgradeMessage="Upgrade to Pro for Domain Rating tracking, referring-domain growth, and competitor authority benchmarks."
        signedInActiveMessage="Track domain authority on your connected projects."
        signedInActiveLabel="Open dashboard"
      />
    </div>
  )
}

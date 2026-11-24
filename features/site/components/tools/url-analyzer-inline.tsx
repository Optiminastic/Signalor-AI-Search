'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Globe, Lock, Loader2, Sparkles } from '@/features/site/components/icons'

import { useSession } from '@/features/site/lib/auth-client'
import {
  getRunDetail,
  startAnalysis,
  type AnalysisRunDetail,
  type PageScore,
} from '@/features/site/lib/api/analyzer'
import { getSubscriptionStatus, type SubscriptionStatus } from '@/features/site/lib/api/payments'
import { getOrFetchOnboardingToken } from '@/features/site/lib/api/onboarding-security'
import { routes } from '@/features/site/lib/config'
import { Button } from '@/features/site/components/ui/button'
import { cn } from '@/features/site/lib/utils'

type RunState =
  | { kind: 'idle' }
  | { kind: 'running'; runId: number; progress: number }
  | { kind: 'done'; detail: AnalysisRunDetail }
  | { kind: 'error'; message: string }

const PILLAR_FIELDS: Array<{ key: keyof PageScore; label: string }> = [
  { key: 'content_score', label: 'Content' },
  { key: 'schema_score', label: 'Schema' },
  { key: 'eeat_score', label: 'E-E-A-T' },
  { key: 'technical_score', label: 'Technical' },
  { key: 'entity_score', label: 'Entity' },
  { key: 'ai_visibility_score', label: 'AI visibility' },
]

function scoreTone(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-warning'
  if (score >= 40) return 'text-orange-600'
  return 'text-destructive'
}

function scoreBar(score: number) {
  if (score >= 80) return 'bg-success'
  if (score >= 60) return 'bg-warning'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-destructive'
}

function normalizeUrl(raw: string) {
  const t = raw.trim()
  if (!t) return ''
  return t.startsWith('http://') || t.startsWith('https://') ? t : `https://${t}`
}

export function UrlAnalyzerToolInline() {
  const { data: session, isPending } = useSession()
  const [url, setUrl] = useState('')
  const [state, setState] = useState<RunState>({ kind: 'idle' })
  const [sub, setSub] = useState<SubscriptionStatus | null>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    return () => {
      cancelledRef.current = true
      if (pollRef.current) clearTimeout(pollRef.current)
    }
  }, [])

  // Prefill from `?url=` so entry points (e.g. the homepage hero form) can
  // hand a URL straight into the analyzer. Prefill only — running an audit
  // still takes an explicit submit.
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('url')
    if (fromQuery) setUrl(fromQuery)
  }, [])

  useEffect(() => {
    if (!session?.user?.email) {
      setSub(null)
      return
    }
    let alive = true
    getSubscriptionStatus(session.user.email)
      .then(s => {
        if (alive) setSub(s)
      })
      .catch(() => {
        if (alive) setSub(null)
      })
    return () => {
      alive = false
    }
  }, [session?.user?.email])

  const pollDetail = useCallback(async (runId: number) => {
    try {
      const detail = await getRunDetail(runId)
      if (cancelledRef.current) return
      if (detail.status === 'complete') {
        setState({ kind: 'done', detail })
        return
      }
      if (detail.status === 'failed') {
        setState({
          kind: 'error',
          message: detail.error_message || 'Analysis failed. Try another URL.',
        })
        return
      }
      setState({ kind: 'running', runId, progress: detail.progress ?? 0 })
      pollRef.current = setTimeout(() => void pollDetail(runId), 2200)
    } catch {
      if (cancelledRef.current) return
      pollRef.current = setTimeout(() => void pollDetail(runId), 2500)
    }
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const finalUrl = normalizeUrl(url)
      if (!finalUrl) return
      setState({ kind: 'running', runId: 0, progress: 0 })
      try {
        const onboardingToken = await getOrFetchOnboardingToken()
        const run = await startAnalysis(
          {
            url: finalUrl,
            run_type: 'single_page',
            country: 'United States',
          },
          onboardingToken,
        )
        setState({ kind: 'running', runId: run.id, progress: 0 })
        void pollDetail(run.id)
      } catch {
        setState({
          kind: 'error',
          message: "Couldn't start the audit. Check the URL and try again.",
        })
      }
    },
    [url, pollDetail],
  )

  const reset = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current)
    setState({ kind: 'idle' })
  }, [])

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-card ring-border focus-within:ring-primary/50 flex w-full items-center gap-2 rounded-md p-1.5 shadow-sm ring-1 shadow-black/5 focus-within:ring-2"
      >
        <Globe className="text-muted-foreground ml-2 h-4 w-4" aria-hidden />
        <input
          type="text"
          placeholder="Enter your domain (e.g. signalor.ai)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={state.kind === 'running'}
          className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none disabled:opacity-60"
        />
        <Button
          type="submit"
          disabled={!url.trim() || state.kind === 'running'}
          className="bg-primary-strong shrink-0 rounded-md px-4 text-xs font-semibold text-white hover:brightness-110"
        >
          {state.kind === 'running' ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Analyzing
            </>
          ) : (
            <>
              Analyze
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </form>

      {state.kind === 'running' && <RunningCard progress={state.progress} />}
      {state.kind === 'error' && <ErrorCard message={state.message} onRetry={reset} />}
      {state.kind === 'done' && (
        <ResultCards
          detail={state.detail}
          session={session}
          sessionPending={isPending}
          sub={sub}
          onReset={reset}
        />
      )}
    </div>
  )
}

function RunningCard({ progress }: { progress: number }) {
  return (
    <div className="bg-card ring-border mt-5 rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
      <div className="flex items-center gap-3">
        <Loader2 className="text-primary-ink h-4 w-4 animate-spin" />
        <p className="text-foreground text-sm font-medium">
          Running your audit, fetching the page, parsing schema, scoring pillars…
        </p>
      </div>
      <div className="bg-muted mt-4 h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${Math.max(6, Math.min(100, progress))}%` }}
        />
      </div>
      <p className="text-muted-foreground mt-2 text-[11px]">This usually takes 20-60 seconds.</p>
    </div>
  )
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-destructive/30 bg-destructive/10 mt-5 rounded-xl border p-4">
      <p className="text-destructive text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-destructive mt-2 text-xs font-semibold underline underline-offset-4 hover:brightness-110"
      >
        Try another URL
      </button>
    </div>
  )
}

function ResultCards({
  detail,
  session,
  sessionPending,
  sub,
  onReset,
}: {
  detail: AnalysisRunDetail
  session: ReturnType<typeof useSession>['data']
  sessionPending: boolean
  sub: SubscriptionStatus | null
  onReset: () => void
}) {
  const mainPage =
    detail.page_scores?.find(p => p.url === detail.url) || detail.page_scores?.[0] || null
  const composite = detail.composite_score ?? mainPage?.composite_score ?? 0
  const topRec = detail.recommendations?.[0]

  return (
    <div className="mt-6 space-y-4">
      {/* Card 1: Composite score + URL summary */}
      <div className="bg-card ring-border rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              GEO score
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">
              <span className={scoreTone(composite)}>{Math.round(composite)}</span>
              <span className="text-muted-foreground text-xl font-semibold">/100</span>
            </p>
            <p className="text-muted-foreground mt-1 truncate text-xs">{detail.url}</p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-muted-foreground shrink-0 text-[11px] font-semibold underline-offset-4 hover:underline"
          >
            Audit another URL
          </button>
        </div>
      </div>

      {/* Card 2: Pillar breakdown */}
      {mainPage && (
        <div className="bg-card ring-border rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
          <p className="text-foreground text-sm font-semibold">Pillar breakdown</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PILLAR_FIELDS.map(p => {
              const v = Math.round(Number(mainPage[p.key]) || 0)
              return (
                <div key={String(p.key)}>
                  <div className="text-foreground flex items-center justify-between text-xs font-medium">
                    <span>{p.label}</span>
                    <span className={cn('tabular-nums', scoreTone(v))}>{v}</span>
                  </div>
                  <div className="bg-muted mt-1 h-1.5 overflow-hidden rounded-full">
                    <div
                      className={cn('h-full rounded-full', scoreBar(v))}
                      style={{ width: `${v}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Card 3: Top recommendation teaser */}
      {topRec && (
        <div className="bg-card ring-border rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary-ink h-3.5 w-3.5" />
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              Top fix
            </p>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                topRec.priority === 'critical' && 'bg-destructive/10 text-destructive',
                topRec.priority === 'high' && 'bg-orange-100 text-orange-700',
                topRec.priority === 'medium' && 'bg-warning/10 text-warning',
                topRec.priority === 'low' && 'bg-muted text-foreground',
              )}
            >
              {topRec.priority}
            </span>
          </div>
          <p className="text-foreground mt-2 text-sm font-semibold">{topRec.title}</p>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-[13px] leading-relaxed">
            {topRec.description}
          </p>
        </div>
      )}

      {/* Gate CTA card */}
      <GateCard
        detail={detail}
        session={session}
        sessionPending={sessionPending}
        sub={sub}
        recCount={detail.recommendations?.length ?? 0}
      />
    </div>
  )
}

function GateCard({
  detail,
  session,
  sessionPending,
  sub,
  recCount,
}: {
  detail: AnalysisRunDetail
  session: ReturnType<typeof useSession>['data']
  sessionPending: boolean
  sub: SubscriptionStatus | null
  recCount: number
}) {
  if (sessionPending) return null

  const hiddenFixes = Math.max(0, recCount - 1)

  if (!session) {
    return (
      <div className="border-primary/25 from-primary/5 to-primary/10 rounded-xl border bg-gradient-to-br via-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="text-primary-ink h-3.5 w-3.5" />
          <p className="text-primary-ink text-[11px] font-semibold tracking-wide uppercase">
            Unlock the full audit
          </p>
        </div>
        <p className="text-foreground mt-2 text-sm font-semibold">
          {hiddenFixes > 0
            ? `${hiddenFixes} more fixes, per-engine AI probes, and monitoring are ready, sign up to view them.`
            : 'Per-engine AI probes, competitor share, and monitoring are ready, sign up to view them.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={routes.signUp}
            className="bg-primary-strong inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
          >
            Create a free account
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={routes.signIn}
            className="text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-4 py-2 text-xs font-semibold"
          >
            Log in
          </Link>
        </div>
      </div>
    )
  }

  if (!sub?.is_active) {
    return (
      <div className="border-primary/25 from-primary/5 to-primary/10 rounded-xl border bg-gradient-to-br via-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="text-primary-ink h-3.5 w-3.5" />
          <p className="text-primary-ink text-[11px] font-semibold tracking-wide uppercase">
            Upgrade to see the full report
          </p>
        </div>
        <p className="text-foreground mt-2 text-sm font-semibold">
          {hiddenFixes > 0
            ? `${hiddenFixes} more fixes, per-engine probes, and monitoring unlock with Pro.`
            : 'Unlock per-engine probes, competitor benchmarks, and monitoring with Pro.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/pricing"
            className="bg-primary-strong inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
          >
            See plans
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted rounded-xl border border-black/6 p-5">
      <p className="text-foreground text-sm font-semibold">Unlock your full report</p>
      <p className="text-muted-foreground mt-1 text-[13px]">
        Full pillar details, per-engine AI probes, recommendations, and monitoring.
      </p>
      <Link
        href={routes.signUp}
        className="bg-primary-strong mt-3 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
      >
        Get started free
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

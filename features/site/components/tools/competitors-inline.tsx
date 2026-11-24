'use client'

import { useCallback, useState } from 'react'
import { ArrowRight, Globe, Loader2, Users } from '@/features/site/components/icons'

import { Button } from '@/features/site/components/ui/button'
import { ToolGateCard } from '@/features/site/components/tools/tool-gate-card'

interface Rival {
  name: string
  mentions: number
  sharePct: number
}

interface CompetitorsResult {
  brand: string
  you: Rival
  rivals: Rival[]
  totalSuggestions: number
  note?: string
}

type State =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'done'; data: CompetitorsResult }
  | { kind: 'error'; message: string }

export function CompetitorsInline() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!url.trim()) return
      setState({ kind: 'running' })
      try {
        const res = await fetch('/api/tools/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        const data = await res.json()
        if (!res.ok) {
          setState({ kind: 'error', message: data.error ?? 'Analysis failed.' })
          return
        }
        setState({ kind: 'done', data: data as CompetitorsResult })
      } catch {
        setState({ kind: 'error', message: "Couldn't reach the server. Try again." })
      }
    },
    [url],
  )

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
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
              Comparing
            </>
          ) : (
            <>
              Compare
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </form>

      {state.kind === 'running' && (
        <div className="bg-card ring-border mt-5 rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
          <div className="text-foreground flex items-center gap-2 text-sm">
            <Loader2 className="text-primary-ink h-4 w-4 animate-spin" />
            Pulling competitive comparison queries from real search autocomplete…
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

function ResultView({ data, onReset }: { data: CompetitorsResult; onReset: () => void }) {
  const allRows = [data.you, ...data.rivals]
  const max = Math.max(1, ...allRows.map(r => r.mentions))

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-card ring-border rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              Share of comparison queries
            </p>
            <p className="text-foreground mt-1 truncate text-sm font-semibold">{data.brand}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {data.totalSuggestions} real search-autocomplete queries scanned
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-muted-foreground shrink-0 text-[11px] font-semibold underline-offset-4 hover:underline"
          >
            Try another domain
          </button>
        </div>
      </div>

      {data.rivals.length > 0 ? (
        <div className="bg-card ring-border rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
          <div className="mb-4 flex items-center gap-2">
            <Users className="text-success h-4 w-4" />
            <p className="text-foreground text-sm font-semibold">Ranked by co-mention</p>
          </div>
          <div className="space-y-3">
            {allRows.slice(0, 6).map((r, i) => {
              const isYou = r.name.toLowerCase() === data.you.name.toLowerCase() && i === 0
              const widthPct = Math.max(6, Math.round((r.mentions / max) * 100))
              return (
                <div key={r.name + i}>
                  <div className="text-foreground flex justify-between text-xs font-semibold">
                    <span>{isYou ? `${r.name} (you)` : r.name}</span>
                    <span
                      className={`tabular-nums ${isYou ? 'text-success' : 'text-muted-foreground'}`}
                    >
                      {r.sharePct}%
                    </span>
                  </div>
                  <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full ${isYou ? 'bg-success' : 'bg-muted'}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-card ring-border rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
          <p className="text-foreground text-sm font-semibold">No comparison queries detected</p>
          <p className="text-muted-foreground mt-1 text-[13px]">
            {data.note ??
              'Usually means the brand is early-stage or in a niche category. Run the full AI-citation benchmark below to find true competitors from live AI responses.'}
          </p>
        </div>
      )}

      <ToolGateCard
        theme="emerald"
        signedOutMessage="Sign up to benchmark AI citation share across ChatGPT, Claude, Gemini, and Perplexity, live, per prompt, per engine."
        upgradeMessage="Upgrade to Pro to unlock live AI citation benchmarks across 4 engines, prompt-level gaps, and a shareable report."
        signedInActiveMessage="Run live AI citation benchmarks on your connected projects."
        signedInActiveLabel="Open dashboard"
      />
    </div>
  )
}

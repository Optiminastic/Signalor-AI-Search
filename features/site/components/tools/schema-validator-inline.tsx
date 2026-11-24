'use client'

import { useCallback, useState } from 'react'
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  Globe,
  Loader2,
} from '@/features/site/components/icons'

import { Button } from '@/features/site/components/ui/button'
import { ToolGateCard } from '@/features/site/components/tools/tool-gate-card'
import { cn } from '@/features/site/lib/utils'

interface SchemaFinding {
  type: string
  status: 'ok' | 'partial' | 'invalid'
  fieldCount: number
  missing: string[]
}

interface Summary {
  url: string
  totalBlocks: number
  invalidBlocks: number
  findings: SchemaFinding[]
}

type State =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'done'; data: Summary }
  | { kind: 'error'; message: string }

export function SchemaValidatorInline() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!url.trim()) return
      setState({ kind: 'running' })
      try {
        const res = await fetch('/api/tools/schema-validator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        const data = await res.json()
        if (!res.ok) {
          setState({ kind: 'error', message: data.error ?? 'Validation failed.' })
          return
        }
        setState({ kind: 'done', data: data as Summary })
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
          placeholder="Paste a page URL"
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
              Scanning
            </>
          ) : (
            <>
              Validate
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </form>

      {state.kind === 'running' && (
        <div className="bg-card ring-border mt-5 rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
          <div className="text-foreground flex items-center gap-2 text-sm">
            <Loader2 className="text-primary-ink h-4 w-4 animate-spin" />
            Fetching the page and parsing JSON-LD…
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

function StatusIcon({ status }: { status: SchemaFinding['status'] }) {
  if (status === 'ok') return <CircleCheck className="text-success h-4 w-4" />
  if (status === 'partial') return <CircleAlert className="text-warning h-4 w-4" />
  return <CircleX className="text-destructive h-4 w-4" />
}

function ResultView({ data, onReset }: { data: Summary; onReset: () => void }) {
  const ok = data.findings.filter(f => f.status === 'ok').length
  const partial = data.findings.filter(f => f.status === 'partial').length
  const invalid = data.findings.filter(f => f.status === 'invalid').length + data.invalidBlocks

  return (
    <div className="mt-6 space-y-4">
      {/* Summary card */}
      <div className="bg-card ring-border rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              Schema health
            </p>
            <p className="text-foreground mt-1 truncate text-sm font-semibold">{data.url}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {data.findings.length} schema{data.findings.length === 1 ? '' : 's'} found
              {data.invalidBlocks > 0
                ? ` · ${data.invalidBlocks} malformed block${data.invalidBlocks === 1 ? '' : 's'}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-muted-foreground shrink-0 text-[11px] font-semibold underline-offset-4 hover:underline"
          >
            Try another URL
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip label="Valid" value={ok} tone="emerald" />
          <Chip label="Partial" value={partial} tone="amber" />
          <Chip label="Invalid" value={invalid} tone="red" />
        </div>
      </div>

      {/* Findings list */}
      {data.findings.length > 0 ? (
        <div className="bg-card ring-border rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
          <p className="text-foreground text-sm font-semibold">Schemas detected</p>
          <ul className="mt-3 divide-y divide-black/6">
            {data.findings.map(f => (
              <li key={f.type} className="flex items-start gap-3 py-2.5">
                <StatusIcon status={f.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-[13px] font-semibold">{f.type}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {f.status === 'ok'
                      ? `Valid · ${f.fieldCount} field${f.fieldCount === 1 ? '' : 's'}`
                      : f.missing.length > 0
                        ? `Missing: ${f.missing.join(', ')}`
                        : `${f.fieldCount} field${f.fieldCount === 1 ? '' : 's'} · unrecognized`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-card ring-border rounded-xl border border-transparent p-5 shadow-sm ring-1 shadow-black/6.5">
          <p className="text-foreground text-sm font-semibold">No JSON-LD found</p>
          <p className="text-muted-foreground mt-1 text-[13px]">
            This page ships no structured data. AI engines rely on schema to cite you confidently ,
            add Organization, Product, or FAQ schema to make content citable.
          </p>
        </div>
      )}

      <ToolGateCard
        theme="violet"
        signedOutMessage="Sign up to scan every URL on your site, get per-template coverage, and auto-generate the JSON-LD you're missing."
        upgradeMessage="Upgrade to Pro for site-wide schema coverage, per-template roll-ups, and ready-to-paste fix snippets."
        signedInActiveMessage="Run schema coverage on your connected projects site-wide."
        signedInActiveLabel="Open dashboard"
      />
    </div>
  )
}

function Chip({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'emerald' | 'amber' | 'red'
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold',
        tone === 'emerald' && 'border-success/30 bg-success/10 text-success',
        tone === 'amber' && 'border-warning/30 bg-warning/10 text-warning',
        tone === 'red' && 'border-destructive/30 bg-destructive/10 text-destructive',
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

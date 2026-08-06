'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

import { emailSubjects, formatEmailHtml, hostOf } from '@/features/outreach/email-html'
import { formatEmail, formatReport } from '@/features/outreach/format'
import { ApiError } from '@/lib/api/client'
import {
  getOutreachBenchmark,
  hasReport,
  startOutreachBenchmark,
  type OutreachReport,
  type OutreachRun,
} from '@/lib/api/outreach'

const POLL_MS = 3000
const TERMINAL = new Set(['complete', 'failed'])
/** Remembered so the founder pastes the access key once, not once per report. */
const KEY_STORAGE = 'signalor:outreach-key'

interface CopyButtonProps {
  label: string
  value: string
  /** Rich HTML twin. When present the clipboard carries both flavours, so
   *  pasting into Gmail keeps the charts and pasting into a plain-text field
   *  still yields readable text. */
  html?: string
  tone?: 'solid' | 'outline'
}

/** Write both text/html and text/plain, falling back when ClipboardItem is absent. */
async function writeClipboard(value: string, html?: string): Promise<void> {
  if (html && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([value], { type: 'text/plain' }),
        }),
      ])
      return
    } catch {
      // Safari/Firefox may reject the rich write; plain text is still useful.
    }
  }
  await navigator.clipboard.writeText(value)
}

function CopyButton({ label, value, html, tone = 'outline' }: CopyButtonProps): JSX.Element {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const style =
    tone === 'solid'
      ? 'bg-[#e04a3d] text-white hover:opacity-90'
      : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'

  return (
    <button
      type="button"
      onClick={() => {
        void writeClipboard(value, html).then(() => setCopied(true))
      }}
      className={`h-[34px] rounded-md px-3 text-[13px] font-semibold transition-colors ${style}`}
    >
      {copied ? 'Copied' : label}
    </button>
  )
}

/** The benchmarked company's favicon, matching the mark used in the email. */
function BrandMark({ url }: { url: string }): JSX.Element | null {
  const domain = hostOf(url)
  if (!domain) return null
  return (
    // Third-party favicon service, deliberately not routed through next/image:
    // the email uses the identical URL, so both surfaces show the same mark.
    // eslint-disable-next-line @next/next/no-img-element -- see above
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`}
      alt=""
      width={32}
      height={32}
      className="h-8 w-8 rounded-md"
    />
  )
}

function ReportHeader({ run, report }: { run: OutreachRun; report: OutreachReport }): JSX.Element {
  const shareUrl =
    typeof window === 'undefined' ? '' : `${window.location.origin}/benchmark/${run.slug}`

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <BrandMark url={report.url} />
        <div>
          <h2 className="text-[18px] font-semibold text-neutral-900">
            {report.brand || report.url}
          </h2>
          <p className="text-[13px] text-neutral-500">
            {report.prompts_measured} of {report.prompts_total} prompts measured &middot;{' '}
            {report.prompts_lost} with no citation
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <CopyButton
          label="Copy email"
          tone="solid"
          value={formatEmail(report)}
          html={formatEmailHtml(report)}
        />
        <CopyButton label="Copy plain text" value={formatReport(report)} />
        {shareUrl && <CopyButton label="Copy link" value={shareUrl} />}
      </div>
    </div>
  )
}

function SubjectLines({ report }: { report: OutreachReport }): JSX.Element {
  return (
    <section className="mt-8">
      <h3 className="text-[15px] font-semibold text-neutral-900">Subject lines</h3>
      <p className="mt-0.5 text-[12px] text-neutral-500">
        The subject and sender reputation decide the open — not the body. Each names one fact the
        recipient can verify in seconds.
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {emailSubjects(report).map(subject => (
          <li
            key={subject}
            className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2"
          >
            <span className="text-[13px] text-neutral-800">{subject}</span>
            <CopyButton label="Copy" value={subject} />
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * The report itself is the rendered email — showing the same prompts, rivals and
 * opportunities again above it would just be the identical data twice, in a
 * poorer form. Anything the founder needs to read is in the preview.
 */
function Report({ run, report }: { run: OutreachRun; report: OutreachReport }): JSX.Element {
  return (
    <div className="mt-8">
      <ReportHeader run={run} report={report} />
      <SubjectLines report={report} />
      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-neutral-900">Email preview</h3>
          <span className="text-[12px] text-neutral-500">Exactly what pastes into Gmail</span>
        </div>
        {/* The same HTML that goes on the clipboard, rendered as the recipient
            sees it. Safe to inject: every value inside is escaped at build time
            in email-html.ts, and the markup is generated here, not user-supplied. */}
        <div
          className="mt-2 overflow-x-auto rounded-md border border-neutral-200 bg-white p-5"
          dangerouslySetInnerHTML={{ __html: formatEmailHtml(report) }}
        />
      </section>
    </div>
  )
}

interface FormState {
  accessKey: string
  url: string
  busy: boolean
}

interface BenchmarkFormProps {
  state: FormState
  onChange: (next: Partial<Pick<FormState, 'accessKey' | 'url'>>) => void
  onSubmit: () => void
}

function BenchmarkForm({ state, onChange, onSubmit }: BenchmarkFormProps): JSX.Element {
  const ready = Boolean(state.url.trim() && state.accessKey.trim())
  return (
    <form
      className="mt-6 flex flex-col gap-3"
      onSubmit={event => {
        event.preventDefault()
        if (ready && !state.busy) onSubmit()
      }}
    >
      <input
        type="password"
        value={state.accessKey}
        onChange={event => onChange({ accessKey: event.target.value })}
        placeholder="Access key"
        aria-label="Access key"
        className="h-[38px] rounded-md border border-neutral-300 px-3 text-[14px]"
      />
      <div className="flex gap-2">
        <input
          type="text"
          value={state.url}
          onChange={event => onChange({ url: event.target.value })}
          placeholder="company.com"
          aria-label="Company domain"
          className="h-[38px] flex-1 rounded-md border border-neutral-300 px-3 text-[14px]"
        />
        <button
          type="submit"
          disabled={state.busy || !ready}
          className="h-[38px] rounded-md bg-[#e04a3d] px-4 text-[14px] font-semibold text-white disabled:opacity-50"
        >
          {state.busy ? 'Running…' : 'Build report'}
        </button>
      </div>
    </form>
  )
}

/**
 * The access key, persisted so the founder types it once ever.
 *
 * Written on every change rather than on a successful run: a mistyped domain or
 * a failed benchmark would otherwise throw the key away and make them dig it
 * out again, which is exactly the friction this is meant to remove.
 *
 * Restored in an effect, deliberately not a lazy `useState` initializer — this
 * component is still server-rendered, so seeding from localStorage up front
 * would make server and client markup disagree and trip a hydration mismatch.
 */
function useRememberedKey(): [string, (value: string) => void] {
  const [key, setKey] = useState('')

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY_STORAGE)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see docblock
    if (stored) setKey(stored)
  }, [])

  const remember = useCallback((value: string): void => {
    setKey(value)
    // Trimmed: a stray space pasted with the key would silently fail the gate.
    window.localStorage.setItem(KEY_STORAGE, value.trim())
  }, [])

  return [key, remember]
}

function PageHeading(): JSX.Element {
  return (
    <>
      <h1 className="text-[24px] font-semibold tracking-tight text-neutral-900">Benchmark</h1>
      <p className="mt-1 text-[14px] text-neutral-600">
        Measures a domain against buyer prompts on ChatGPT, Claude and Perplexity, then writes the
        email around it.
      </p>
    </>
  )
}

function RunStatus({ run }: { run: OutreachRun | undefined }): JSX.Element {
  return (
    <p className="mt-6 text-[13px] text-neutral-600">
      {run?.phase || 'Starting…'} {run?.progress ? `(${run.progress}%)` : ''}
    </p>
  )
}

/** Whichever failure the user needs to see: the start request, then the run. */
function errorMessage(startError: unknown, run: OutreachRun | undefined): string {
  if (startError instanceof ApiError) {
    return startError.status === 403
      ? 'That access key was not accepted.'
      : startError.message || 'Could not start the benchmark.'
  }
  if (run?.status === 'failed') return run.error_message || 'The benchmark failed. Try again.'
  return ''
}

export function BenchmarkBuilder({ initialSlug = '' }: { initialSlug?: string }): JSX.Element {
  const [accessKey, setAccessKey] = useRememberedKey()
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState(initialSlug)

  const runQuery = useQuery({
    queryKey: ['outreach', slug],
    enabled: Boolean(slug),
    queryFn: () => getOutreachBenchmark(slug),
    refetchInterval: q => (TERMINAL.has(q.state.data?.status ?? '') ? false : POLL_MS),
  })

  const mutation = useMutation({
    // The key is persisted as it is typed (see useRememberedKey), so there is
    // nothing to save here — only the run to start watching.
    mutationFn: () => startOutreachBenchmark(url, accessKey),
    onSuccess: run => setSlug(run.slug),
  })

  const run = runQuery.data
  const running = Boolean(slug) && !TERMINAL.has(run?.status ?? '')
  const error = errorMessage(mutation.error, run)

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHeading />

      <BenchmarkForm
        state={{ accessKey, url, busy: mutation.isPending || running }}
        onChange={next => {
          if (next.accessKey !== undefined) setAccessKey(next.accessKey)
          if (next.url !== undefined) setUrl(next.url)
        }}
        onSubmit={() => mutation.mutate()}
      />

      {error && <p className="mt-4 text-[13px] font-medium text-red-600">{error}</p>}
      {running && <RunStatus run={run} />}
      {run && hasReport(run) && <Report run={run} report={run.report} />}
    </main>
  )
}

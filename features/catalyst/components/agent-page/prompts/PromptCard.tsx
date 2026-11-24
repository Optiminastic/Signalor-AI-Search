import { SECTION_TITLE } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { Platform, PresenceResult, PromptPresence } from '@/lib/api/agent-mode-prompt-presence'

const LABELS: Record<Platform, string> = {
  reddit: 'Reddit threads',
  linkedin: 'LinkedIn posts',
  x: 'X posts',
  google: 'Google links',
}
const ORDER: Platform[] = ['reddit', 'linkedin', 'x', 'google']
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'
const PILL = 'rounded-sm px-1.5 py-px text-[11px] font-medium'

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function ResultLink({ result }: { result: PresenceResult }): JSX.Element {
  return (
    <li className="flex min-w-0 flex-col">
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-[12.5px] font-medium text-[var(--cat-ink)] hover:underline"
      >
        {result.title || host(result.url)}
      </a>
      <span className={MUTED}>
        {result.community || host(result.url)}
        {result.mentionsBrand && (
          <span className="text-primary-ink ml-1.5 font-semibold">· mentions you</span>
        )}
      </span>
    </li>
  )
}

function Section({
  platform,
  results,
}: {
  platform: Platform
  results: PresenceResult[]
}): JSX.Element | null {
  if (results.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className={SECTION_TITLE}>{LABELS[platform]}</h4>
      <ul className="flex flex-col gap-2">
        {results.map(r => (
          <ResultLink key={r.url} result={r} />
        ))}
      </ul>
    </div>
  )
}

function Summary({ presence }: { presence: PromptPresence }): JSX.Element {
  const present = presence.brandPresentOn
  return (
    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3">
      <span className="text-[13px] font-semibold text-[var(--cat-ink)]">{presence.prompt}</span>
      <span
        className={`${PILL} shrink-0 ${present.length ? 'bg-[var(--cat-hover)] text-[var(--cat-ink)]' : 'text-[var(--cat-ink-3)]'}`}
      >
        {present.length
          ? `You appear on ${present.map(p => LABELS[p as Platform]?.split(' ')[0] ?? p).join(', ')}`
          : 'Not mentioned yet'}
      </span>
    </summary>
  )
}

/** One prompt: where it's discussed, platform by platform, and where the brand shows up. */
export function PromptCard({
  presence,
  open,
}: {
  presence: PromptPresence
  open: boolean
}): JSX.Element {
  return (
    <details
      open={open}
      className="rounded-lg border border-[var(--cat-border)] bg-[var(--cat-card)]"
    >
      <Summary presence={presence} />
      <div className="flex flex-col gap-4 border-t border-[var(--cat-border)] px-4 py-3">
        {presence.subreddits.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={MUTED}>Subreddits:</span>
            {presence.subreddits.map(s => (
              <span key={s.name} className={`${PILL} bg-[var(--cat-hover)] text-[var(--cat-ink)]`}>
                {s.name}
                {s.threads > 1 ? ` · ${s.threads}` : ''}
              </span>
            ))}
          </div>
        )}
        {ORDER.map(p => (
          <Section key={p} platform={p} results={presence.results[p]} />
        ))}
      </div>
    </details>
  )
}

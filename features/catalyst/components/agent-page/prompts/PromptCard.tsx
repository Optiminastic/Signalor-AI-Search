import { SECTION_TITLE } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { PlatformMark } from '@/features/catalyst/components/agent-page/prompts/PlatformMark'
import {
  isPlatform,
  PLATFORM_META,
} from '@/features/catalyst/components/agent-page/prompts/platforms'
import type { Platform, PresenceResult, PromptPresence } from '@/lib/api/agent-mode-prompt-presence'

const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'
const PILL = 'rounded-sm px-1.5 py-px text-[11px] font-medium'

interface PromptCardProps {
  presence: PromptPresence
  open: boolean
  /** The platforms to show, in order: all four, or the one picked in the filter. */
  platforms: Platform[]
}

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

/** One platform's results, set apart by its mark, name and a coloured edge. */
function Section({
  platform,
  results,
}: {
  platform: Platform
  results: PresenceResult[]
}): JSX.Element {
  const meta = PLATFORM_META[platform]
  return (
    <section
      aria-label={meta.heading}
      className={`flex flex-col gap-2 border-l-[3px] pl-3 ${meta.edge}`}
    >
      <h4 className={`${SECTION_TITLE} flex items-center gap-1.5`}>
        <PlatformMark platform={platform} />
        {meta.heading}
        <span className="text-[var(--cat-ink-3)] tabular-nums">{results.length}</span>
      </h4>
      {results.length ? (
        <ul className="flex flex-col gap-2">
          {results.map(r => (
            <ResultLink key={r.url} result={r} />
          ))}
        </ul>
      ) : (
        <p className={MUTED}>None found for this prompt.</p>
      )}
    </section>
  )
}

function Presence({ present }: { present: string[] }): JSX.Element {
  const platforms = present.filter(isPlatform)
  if (!platforms.length) {
    return <span className={`${PILL} shrink-0 text-[var(--cat-ink-3)]`}>Not mentioned yet</span>
  }
  return (
    <span
      className={`${PILL} flex shrink-0 items-center gap-1 bg-[var(--cat-hover)] text-[var(--cat-ink)]`}
    >
      You appear on
      {platforms.map(p => (
        <span key={p} className="inline-flex items-center gap-0.5">
          <PlatformMark platform={p} size={12} />
          {PLATFORM_META[p].name}
        </span>
      ))}
    </span>
  )
}

function Subreddits({ presence }: { presence: PromptPresence }): JSX.Element | null {
  if (!presence.subreddits.length) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <PlatformMark platform="reddit" size={14} />
      <span className={MUTED}>Subreddits:</span>
      {presence.subreddits.map(s => (
        <span key={s.name} className={`${PILL} bg-[var(--cat-hover)] text-[var(--cat-ink)]`}>
          {s.name}
          {s.threads > 1 ? ` · ${s.threads}` : ''}
        </span>
      ))}
    </div>
  )
}

/** One prompt: where it's discussed, platform by platform, and where the brand shows up. */
export function PromptCard({ presence, open, platforms }: PromptCardProps): JSX.Element {
  const single = platforms.length === 1
  const shown = single ? platforms : platforms.filter(p => presence.results[p].length > 0)
  return (
    <details
      open={open}
      className="rounded-lg border border-[var(--cat-border)] bg-[var(--cat-card)]"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3">
        <span className="text-[13px] font-semibold text-[var(--cat-ink)]">{presence.prompt}</span>
        <Presence present={presence.brandPresentOn} />
      </summary>
      <div className="flex flex-col gap-4 border-t border-[var(--cat-border)] px-4 py-3">
        {platforms.includes('reddit') && <Subreddits presence={presence} />}
        {shown.map(p => (
          <Section key={p} platform={p} results={presence.results[p]} />
        ))}
      </div>
    </details>
  )
}

import type { SocialCompetitor, SocialPlatform } from '@/lib/api/agent-mode-social'

const PLATFORMS = ['linkedin', 'x', 'youtube', 'instagram']
const SECTION_TITLE = 'text-[11px] font-semibold uppercase tracking-wide text-[var(--cat-ink-3)]'
const CELL = 'w-[68px] shrink-0 text-center text-[12px]'

interface CompetitorSocialProps {
  labels: Record<string, string>
  platforms: Record<string, SocialPlatform>
  competitors: SocialCompetitor[]
}

interface PresenceCellProps {
  url: string
}

function PresenceCell({ url }: PresenceCellProps): JSX.Element {
  if (!url) return <span className={`${CELL} text-[var(--cat-ink-3)]`}>-</span>
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`${CELL} text-[#e04a3d] hover:underline`}
    >
      On it
    </a>
  )
}

interface PresenceRowProps {
  name: string
  urls: Record<string, string>
  isBrand?: boolean
}

function PresenceRow({ name, urls, isBrand }: PresenceRowProps): JSX.Element {
  return (
    <li className="flex items-center gap-2 py-1">
      <span
        className={`min-w-0 flex-1 truncate text-[12.5px] ${isBrand ? 'font-semibold text-[var(--cat-ink)]' : 'text-[var(--cat-ink-2)]'}`}
      >
        {name}
      </span>
      {PLATFORMS.map(p => (
        <PresenceCell key={p} url={urls[p] ?? ''} />
      ))}
    </li>
  )
}

/** Which platforms the brand and each top competitor are on, side by side. */
export function CompetitorSocial({
  labels,
  platforms,
  competitors,
}: CompetitorSocialProps): JSX.Element | null {
  if (competitors.length === 0) return null
  const own = Object.fromEntries(PLATFORMS.map(p => [p, platforms[p]?.url ?? '']))
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className={SECTION_TITLE}>You vs competitors on social</h3>
      <div className="flex items-center gap-2 text-[11px] text-[var(--cat-ink-3)]">
        <span className="flex-1" />
        {PLATFORMS.map(p => (
          <span key={p} className={CELL}>
            {labels[p] ?? p}
          </span>
        ))}
      </div>
      <ul className="flex flex-col divide-y divide-[var(--cat-card-border)]">
        <PresenceRow name="You" urls={own} isBrand />
        {competitors.map(c => (
          <PresenceRow key={c.domain} name={c.name || c.domain} urls={c.profiles} />
        ))}
      </ul>
    </section>
  )
}

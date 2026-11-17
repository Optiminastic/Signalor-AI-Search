'use client'

import { useState } from 'react'

import { colorOf } from '@/features/catalyst/components/agent-page/tracking/tracking-data'
import { GREEN, NEG } from '@/features/catalyst/constants'
import type { BrandMention, RankTracking } from '@/lib/api/agent-mode-rank-tracking'

interface BrandMentionsProps {
  report: RankTracking
}

const SENTIMENT_COLOR: Record<BrandMention['sentiment'], string> = {
  positive: GREEN,
  neutral: 'var(--cat-ink-3)',
  negative: NEG,
}
const CHANNEL_LABEL: Record<BrandMention['channel'], string> = {
  web: 'Web',
  news: 'News',
  reddit: 'Reddit',
}
const CHIP = 'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium'
const CHIP_ON = `${CHIP} border-[#e04a3d] bg-[#e04a3d]/10 text-[var(--cat-ink)]`
const CHIP_OFF = `${CHIP} border-[var(--cat-border)] text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]`
const MUTED = 'text-[11px] text-[var(--cat-ink-3)]'

function MentionRow({ mention }: { mention: BrandMention }): JSX.Element {
  return (
    <li className="flex gap-2 border-b border-[var(--cat-border)] py-2 last:border-0">
      <span
        className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
        style={{ background: SENTIMENT_COLOR[mention.sentiment] }}
        role="img"
        aria-label={`${mention.sentiment} mention`}
      />
      <div className="min-w-0">
        <a
          href={mention.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="line-clamp-2 text-[12.5px] font-medium text-[var(--cat-ink)] hover:underline"
        >
          {mention.title || mention.url}
        </a>
        <p className={MUTED}>
          {mention.source} · {CHANNEL_LABEL[mention.channel]}
          {mention.published ? ` · ${mention.published}` : ''}
        </p>
      </div>
    </li>
  )
}

function Counts({ report, domain }: { report: RankTracking; domain: string }): JSX.Element {
  const week = report.brand.weeks[report.brand.weeks.length - 1]
  const counts = week?.domains[domain] ?? { mentions: 0, positive: 0, negative: 0 }
  return (
    <p className={MUTED}>
      This week: {counts.mentions} mentions · {counts.positive} positive · {counts.negative}{' '}
      negative
    </p>
  )
}

/** What the internet said this week about you or a competitor (pick one), newest first. */
export function BrandMentions({ report }: BrandMentionsProps): JSX.Element {
  const [domain, setDomain] = useState(report.players[0]?.domain ?? '')
  const mentions = report.brand.latest[domain] ?? []
  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label="Show mentions of" className="flex flex-wrap gap-1.5">
        {report.players.map((player, index) => (
          <button
            key={player.domain}
            type="button"
            aria-pressed={player.domain === domain}
            onClick={() => setDomain(player.domain)}
            className={player.domain === domain ? CHIP_ON : CHIP_OFF}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: colorOf(player, index) }}
            />
            {player.isBrand ? 'You' : player.name}
          </button>
        ))}
      </div>
      <Counts report={report} domain={domain} />
      {mentions.length ? (
        <ul>
          {mentions.map(mention => (
            <MentionRow key={mention.url} mention={mention} />
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-[var(--cat-ink-2)]">No mentions found yet.</p>
      )}
    </div>
  )
}

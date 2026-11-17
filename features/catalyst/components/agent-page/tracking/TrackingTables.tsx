import {
  colorOf,
  positionMove,
  positionText,
} from '@/features/catalyst/components/agent-page/tracking/tracking-data'
import { POS, NEG } from '@/features/catalyst/constants'
import type { RankTracking, TrackingPlayer } from '@/lib/api/agent-mode-rank-tracking'

const HEAD = 'px-1.5 pb-1 text-left text-[10.5px] font-medium text-[var(--cat-ink-3)]'
const CELL = 'px-1.5 py-1.5 text-[12px] tabular-nums'
const KEYWORD = 'max-w-[140px] truncate py-1.5 pr-1.5 text-[12px] text-[var(--cat-ink)]'

function PlayerHead({ player, index }: { player: TrackingPlayer; index: number }): JSX.Element {
  return (
    <th className={HEAD} title={player.domain}>
      <span className="flex items-center gap-1">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: colorOf(player, index) }}
          aria-hidden="true"
        />
        <span className="max-w-[64px] truncate">{player.name}</span>
      </span>
    </th>
  )
}

function Head({ players }: { players: TrackingPlayer[] }): JSX.Element {
  return (
    <thead>
      <tr className="border-b border-[var(--cat-border)]">
        <th className={`${HEAD} pl-0`}>Keyword</th>
        {players.map((player, index) => (
          <PlayerHead key={player.domain} player={player} index={index} />
        ))}
      </tr>
    </thead>
  )
}

const ARROWS = { up: '▲', down: '▼', same: '' } as const

function Position({ now, before }: { now: number | null; before: number | null }): JSX.Element {
  const move = positionMove(now, before)
  const color = move === 'up' ? POS : NEG
  return (
    <td className={CELL}>
      <span className={now ? 'text-[var(--cat-ink)]' : 'text-[var(--cat-ink-3)]'}>
        {positionText(now)}
      </span>
      {move && move !== 'same' && (
        <span className="ml-0.5 text-[9px]" style={{ color }} aria-label={`moved ${move}`}>
          {ARROWS[move]}
        </span>
      )}
    </td>
  )
}

/** Google position for each tracked keyword, per player, this week (arrow vs last week). */
export function SeoTable({ report }: { report: RankTracking }): JSX.Element {
  return (
    <table className="w-full border-collapse">
      <Head players={report.players} />
      <tbody>
        {report.seo.latest.map(row => (
          <tr key={row.keyword} className="border-b border-[var(--cat-border)] last:border-0">
            <td className={KEYWORD} title={row.keyword}>
              {row.keyword}
            </td>
            {report.players.map(player => {
              const cell = row.domains[player.domain]
              return (
                <Position
                  key={player.domain}
                  now={cell?.now ?? null}
                  before={cell?.before ?? null}
                />
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Whether Google's AI Overview cited each player for each tracked keyword, this week. */
export function AioTable({ report }: { report: RankTracking }): JSX.Element {
  return (
    <table className="w-full border-collapse">
      <Head players={report.players} />
      <tbody>
        {report.aio.latest.map(row => (
          <tr key={row.keyword} className="border-b border-[var(--cat-border)] last:border-0">
            <td className={KEYWORD} title={row.keyword}>
              {row.keyword}
            </td>
            {report.players.map(player => {
              const isCited = row.domains[player.domain]?.now === true
              return (
                <td key={player.domain} className={CELL}>
                  {isCited ? (
                    <span style={{ color: POS }} aria-label="cited">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[var(--cat-ink-3)]" aria-label="not cited">
                      –
                    </span>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

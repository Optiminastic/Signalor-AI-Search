'use client'

import { engineLogo } from '@/features/catalyst/engine-logos'
import { botRows, classifySources } from '@/features/catalyst/live-visitors'
import { useBrandPath } from '@/hooks/useBrandPath'
import type { LiveVisitors } from '@/lib/api/live-visitors'

import { botsEmptyState, humansEmptyState, LiveEmptyState } from './LiveEmptyState'
import { LiveRow } from './LiveRow'

const SECTION =
  'px-2 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase'

function Mark({ engine }: { engine: string | null }): JSX.Element {
  const src = engine ? engineLogo(engine) : null
  if (!src) return <span className="h-1.5 w-1.5 rounded-full bg-[var(--cat-ink-3)]" />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="h-3.5 w-3.5 object-contain" />
}

function Flag({ code }: { code: string }): JSX.Element {
  if (!code) return <span className="h-1.5 w-1.5 rounded-full bg-[var(--cat-ink-3)]" />
  return <span className="text-[13px] leading-none">{flagEmoji(code)}</span>
}

/** ISO-3166 alpha-2 → regional indicator pair. */
function flagEmoji(code: string): string {
  const cc = code.trim().toUpperCase()
  if (cc.length !== 2) return '🌐'
  return String.fromCodePoint(...[...cc].map(c => 0x1f1e6 + c.charCodeAt(0) - 65))
}

function Humans({ data, hrefFor }: PanelSectionProps): JSX.Element {
  const { humans } = data
  const empty = !humans.available || humans.active_users === 0
  return (
    <>
      <div className={SECTION}>
        Humans · now
        {humans.available && (
          <span className="float-right text-[var(--cat-ink-2)]">{humans.active_users}</span>
        )}
      </div>
      {empty ? (
        <LiveEmptyState state={humansEmptyState(humans.reason)} hrefFor={hrefFor} />
      ) : (
        humans.countries.map(c => (
          <LiveRow
            key={c.code || c.name}
            mark={<Flag code={c.code} />}
            label={c.name}
            value={c.users}
          />
        ))
      )}
    </>
  )
}

function Sources({ data }: { data: LiveVisitors }): JSX.Element | null {
  const { sources } = data.humans
  if (!sources.available || sources.rows.length === 0) return null
  const { ai, other } = classifySources(sources.rows)
  const shown = [...ai, ...other].slice(0, 5)
  return (
    <>
      {/* "Today", not "now": GA4's realtime API exposes no source dimension, so
          claiming these are live would be a lie. */}
      <div className={SECTION}>Sources · today</div>
      {shown.map(s => (
        <LiveRow
          key={`${s.source}-${s.channel}`}
          mark={<Mark engine={s.engine} />}
          label={s.source || 'Direct'}
          sublabel={s.engine ? 'AI' : s.channel}
          value={s.sessions}
        />
      ))}
    </>
  )
}

function Bots({ data, hrefFor }: PanelSectionProps): JSX.Element {
  const { bots } = data
  const rows = botRows(bots.rows)
  return (
    <>
      <div className={SECTION}>
        AI bots · last {data.window_minutes}m
        <span className="float-right text-[var(--cat-ink-2)]">{bots.total_hits}</span>
      </div>
      {rows.length === 0 ? (
        <LiveEmptyState state={botsEmptyState(bots.ever_seen)} hrefFor={hrefFor} />
      ) : (
        rows.map(b => (
          <LiveRow
            key={`${b.bot}-${b.path}`}
            mark={<Mark engine={b.engine} />}
            label={b.short}
            sublabel={b.path}
            meta={b.when}
            value={b.hits}
          />
        ))
      )}
    </>
  )
}

interface PanelSectionProps {
  data: LiveVisitors
  hrefFor: (to: string) => string
}

export function LiveVisitorsPanel({ data }: { data: LiveVisitors }): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <Humans data={data} hrefFor={brandPath} />
      <Sources data={data} />
      <div className="my-1 h-px bg-[var(--cat-border-soft)]" />
      <Bots data={data} hrefFor={brandPath} />
    </div>
  )
}

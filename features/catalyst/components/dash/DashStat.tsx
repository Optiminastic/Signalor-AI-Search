export interface DashStatData {
  label: string
  value: string
  delta?: string
  positive?: boolean
}

function DashStat({ label, value, delta, positive }: DashStatData): JSX.Element {
  return (
    <div className="rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-4 shadow-sm">
      <p className="text-[11px] tracking-wide text-[var(--cat-ink-3)] uppercase">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-[var(--cat-ink)] tabular-nums">
          {value}
        </span>
        {delta && (
          <span
            className={`text-[12px] font-medium ${positive ? 'text-[#2FBE7E]' : 'text-[#E5484D]'}`}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}

export function DashStatRow({ stats }: { stats: DashStatData[] }): JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(s => (
        <DashStat key={s.label} {...s} />
      ))}
    </div>
  )
}

export function DashHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: React.ReactNode
}): JSX.Element {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--cat-ink)]">{title}</h1>
        <p className="mt-1 text-[13px] text-[var(--cat-ink-3)]">{subtitle}</p>
      </div>
      {action}
    </header>
  )
}

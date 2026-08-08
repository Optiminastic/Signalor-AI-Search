import { ThresholdBar } from '@/features/catalyst/components/sitemap/ThresholdBar'
import type { Vital } from '@/features/catalyst/sitemap-data'

interface WebVitalCardProps {
  vital: Vital
}

export function WebVitalCard({ vital }: WebVitalCardProps): JSX.Element {
  const { icon: Icon, label, value, unit, marker, status, valueColor } = vital
  return (
    <div className="cat-card-edge flex flex-col rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide text-[var(--cat-ink-3)] uppercase">
          {label}
        </span>
        <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--cat-hover)]">
          <Icon size={13} className="text-[var(--cat-ink-3)]" />
        </span>
      </div>
      <div className="mt-2 flex min-h-[34px] items-end text-[26px] font-bold tracking-tight">
        {value === null ? (
          <span className="text-[22px] text-[var(--cat-ink-3)]">—</span>
        ) : (
          <span style={{ color: valueColor ?? 'var(--cat-ink)' }}>
            {value}
            <span className="text-[15px] font-semibold text-[var(--cat-ink-3)]"> {unit}</span>
          </span>
        )}
      </div>
      <div className="mt-auto pt-3">
        <ThresholdBar marker={marker} />
        <div
          className="mt-1.5 text-[12px] font-medium"
          style={{ color: valueColor ?? 'var(--cat-ink-3)' }}
        >
          {status}
        </div>
      </div>
    </div>
  )
}

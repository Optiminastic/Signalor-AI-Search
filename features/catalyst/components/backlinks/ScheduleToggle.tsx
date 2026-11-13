'use client'

interface ScheduleToggleProps {
  enabled: boolean
  onToggle: () => void
  /** Visible label; defaults to the backlinks schedule. */
  label?: string
  disabled?: boolean
}

/** An on/off schedule switch (daily auto-backlinks by default). */
export function ScheduleToggle({
  enabled,
  onToggle,
  label = 'Daily auto-backlinks',
  disabled = false,
}: ScheduleToggleProps): JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${label.toLowerCase()}`}
        disabled={disabled}
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          enabled ? 'bg-[#e04a3d]' : 'bg-[var(--cat-border)]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'
          }`}
        />
      </button>
      <span className="text-[13px] font-medium text-[var(--cat-ink)]">{label}</span>
    </div>
  )
}

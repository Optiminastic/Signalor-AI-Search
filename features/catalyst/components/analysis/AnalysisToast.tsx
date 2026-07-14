import { BRAND, GREEN } from '@/features/catalyst/constants'

interface AnalysisToastProps {
  status: string
  progress: number
}

const STAGE_LABEL: Record<string, string> = {
  pending: 'Queued',
  crawling: 'Crawling your site',
  analyzing: 'Analyzing content',
  scoring: 'Scoring pillars',
  complete: 'Analysis complete',
  failed: 'Analysis failed',
}

const TICKS = 20

/**
 * Sonner toast body for a running analysis: a title, live percentage, a
 * segmented tick meter (per the UI convention) and the current stage. Styled
 * with explicit colours so it renders correctly inside Sonner's portal, where
 * the dashboard's `--cat-*` theme vars are not in scope.
 */
export function AnalysisToast({ status, progress }: AnalysisToastProps): JSX.Element {
  const done = status === 'complete'
  const pct = done ? 100 : Math.max(2, Math.min(100, Math.round(progress)))
  const filled = Math.round((pct / 100) * TICKS)
  const fill = done ? GREEN : BRAND

  return (
    <div className="flex w-[236px] flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">
          {done ? 'Analysis complete 🎉' : 'New analysis started'}
        </span>
        <span className="text-[12px] font-medium tabular-nums opacity-70">{pct}%</span>
      </div>
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: TICKS }, (_, i) => (
          <span
            key={i}
            className="h-3 w-[3px] rounded-[1px]"
            style={i < filled ? { background: fill } : { background: 'currentColor', opacity: 0.2 }}
          />
        ))}
      </div>
      <span className="text-[11px] opacity-60">{STAGE_LABEL[status] ?? 'Working…'}</span>
    </div>
  )
}

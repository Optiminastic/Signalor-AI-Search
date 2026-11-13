'use client'

import { AUTO_SITES } from '@/features/catalyst/backlinks-data'
import { AutoCategoryList } from '@/features/catalyst/components/backlinks/AutoCategoryList'
import { BacklinksMessage } from '@/features/catalyst/components/backlinks/BacklinksMessage'
import { useActiveRunSlug } from '@/features/catalyst/components/backlinks/hooks/useActiveRunSlug'
import {
  useAutoBacklinks,
  useBacklinkSchedule,
  useToggleSchedule,
} from '@/features/catalyst/components/backlinks/hooks/useAutoBacklinks'
import { ScheduleToggle } from '@/features/catalyst/components/backlinks/ScheduleToggle'
import { DashStatRow, type DashStatData } from '@/features/catalyst/components/dash/DashStat'
import type { AutoBacklink } from '@/lib/api/backlinks'

export function AutoBacklinksPanel(): JSX.Element {
  const { slug, isLoading: slugLoading, isError: slugError } = useActiveRunSlug()
  const auto = useAutoBacklinks(slug)
  const schedule = useBacklinkSchedule(slug)
  const toggleSchedule = useToggleSchedule(slug)

  const rows = auto.data?.rows ?? []
  const scheduleOn = schedule.data?.is_active ?? false
  const replaced = schedule.data?.replaced_by_agent ?? false
  const loading = slugLoading || (Boolean(slug) && auto.isLoading)
  const error = slugError || auto.isError

  const onToggle = (): void => {
    if (slug) toggleSchedule.mutate(!scheduleOn)
  }

  return (
    <div>
      <div className="mb-5">
        <DashStatRow stats={buildStats(rows, scheduleOn, replaced)} />
      </div>
      <ScheduleControls replaced={replaced} scheduleOn={scheduleOn} onToggle={onToggle} />
      <AutoBody loading={loading} error={error} hasSlug={Boolean(slug)} rows={rows} />
    </div>
  )
}

interface AutoBodyProps {
  loading: boolean
  error: boolean
  hasSlug: boolean
  rows: AutoBacklink[]
}

function AutoBody({ loading, error, hasSlug, rows }: AutoBodyProps): JSX.Element {
  if (loading) return <BacklinksMessage title="Loading your auto-backlinks…" />
  if (error) {
    return (
      <BacklinksMessage
        title="Couldn’t load auto-backlinks"
        detail="Please refresh — if it keeps failing, the analysis backend may be unreachable."
      />
    )
  }
  if (!hasSlug) {
    return (
      <BacklinksMessage
        title="No analysis run yet"
        detail="Run an analysis for this brand to start publishing auto-backlinks."
      />
    )
  }
  return <AutoCategoryList rows={rows} />
}

interface ScheduleControlsProps {
  replaced: boolean
  scheduleOn: boolean
  onToggle: () => void
}

/** The daily switch, or the note that the Agent's articles replaced it. */
function ScheduleControls({ replaced, scheduleOn, onToggle }: ScheduleControlsProps): JSX.Element {
  if (replaced) return <ReplacedNote />
  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
      <ScheduleToggle enabled={scheduleOn} onToggle={onToggle} />
    </div>
  )
}

function autoRunLabel(scheduleOn: boolean, replaced: boolean): string {
  if (replaced) return 'Replaced by Agent'
  return scheduleOn ? 'On' : 'Off'
}

/** Shown once the daily batch is switched off in favour of the Agent's articles. */
function ReplacedNote(): JSX.Element {
  return (
    <p className="mb-4 rounded-md border border-[var(--cat-border)] px-3 py-2 text-[12.5px] text-[var(--cat-ink-2)]">
      Daily auto-backlinks are replaced by the Agent&apos;s articles on signalor.ai sites: one every
      3 days per brand, each approved by you in Agent mode → Approvals, with a sponsored link.
      Articles published so far stay listed below.
    </p>
  )
}

function buildStats(rows: AutoBacklink[], scheduleOn: boolean, replaced: boolean): DashStatData[] {
  const liveCount = rows.filter(r => Boolean(r.url)).length
  return [
    { label: 'Blogs published', value: String(rows.length) },
    { label: 'Live backlinks', value: String(liveCount) },
    { label: 'Categories', value: String(AUTO_SITES.length) },
    { label: 'Daily auto-run', value: autoRunLabel(scheduleOn, replaced) },
  ]
}

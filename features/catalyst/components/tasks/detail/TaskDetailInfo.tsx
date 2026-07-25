'use client'

import { TaskTypeIcon } from '@/features/catalyst/components/agent/TaskTypeIcon'
import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import {
  formatEffort,
  formatTaskDate,
  TASK_TYPE_LABEL,
  taskTypesOf,
} from '@/features/catalyst/tasks-data'
import { useActiveProject } from '@/hooks/useActiveProject'
import { GEO_PILLARS, usePillars } from '@/hooks/usePillars'
import type { TaskDetail } from '@/hooks/useTaskDetail'
import { BadgeCheck } from '@/lib/icons'

const KIND_LABEL: Record<string, string> = {
  auto: 'Auto-fixable',
  draft: 'AI draft',
  open: 'Manual',
}

function capitalize(word: string): string {
  return word ? word[0].toUpperCase() + word.slice(1) : word
}

function InfoRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="shrink-0 text-[var(--cat-ink-3)]">{label}</span>
      <span className="truncate font-medium text-[var(--cat-ink)]">{value}</span>
    </div>
  )
}

/** Every type the task matches, as icon chips — tasks can span several. */
function TypeChips({ task }: { task: TaskDetail }): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3 text-[13px]">
      <span className="shrink-0 text-[var(--cat-ink-3)]">Type</span>
      <span className="flex flex-wrap justify-end gap-1.5">
        {taskTypesOf(task).map(type => (
          <span
            key={type}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--cat-border)] bg-[var(--cat-hover)] px-2 py-0.5 text-[11px] font-medium text-[var(--cat-ink-2)]"
          >
            <TaskTypeIcon type={type} size={12} />
            {TASK_TYPE_LABEL[type]}
          </span>
        ))}
      </span>
    </div>
  )
}

/** The affected pillar's current score — the number this task should move. */
function PillarScoreRow({ pillar }: { pillar: string }): JSX.Element | null {
  const { slug } = useActiveProject()
  const { data } = usePillars(slug)
  const label = GEO_PILLARS.find(p => String(p.key) === `${pillar}_score`)?.label
  const score = data?.pillars.find(p => p.label === label)?.score
  if (!label || score === undefined) return null
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="shrink-0 text-[var(--cat-ink-3)]">{label} today</span>
      <span className="flex items-center gap-2">
        <TickBar value={score} ticks={12} showValue={false} />
        <span className="font-medium text-[var(--cat-ink)] tabular-nums">{score}/100</span>
      </span>
    </div>
  )
}

function AutoFixRow({ available }: { available: boolean }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="shrink-0 text-[var(--cat-ink-3)]">Auto-fix</span>
      {available ? (
        <span className="rounded-sm bg-[rgba(47,190,126,0.12)] px-1.5 py-0.5 text-[11px] font-semibold text-[#2FBE7E]">
          Available
        </span>
      ) : (
        <span className="font-medium text-[var(--cat-ink)]">Manual only</span>
      )}
    </div>
  )
}

/** The analyzer finding code that keys the auto-fix, as a copyable mono chip. */
function FindingCodeRow({ code }: { code: string }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="shrink-0 text-[var(--cat-ink-3)]">Finding</span>
      <span className="truncate rounded-sm bg-[var(--cat-hover)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--cat-ink-2)]">
        {code}
      </span>
    </div>
  )
}

function executionLabel(task: TaskDetail): string {
  if (!task.planAction) return 'Manual'
  return KIND_LABEL[task.planAction.kind] ?? 'Manual'
}

/** When the task was identified and its scoring (priority / impact / effort). */
function ScoringRows({ task }: { task: TaskDetail }): JSX.Element {
  return (
    <>
      <InfoRow label="Identified" value={task.createdAt ? formatTaskDate(task.createdAt) : '—'} />
      <InfoRow label="Priority" value={capitalize(task.priority) || '—'} />
      <InfoRow
        label="Measured lift"
        value={task.measuredLift != null ? `+${task.measuredLift} GEO pts` : '—'}
      />
      <InfoRow label="Effort" value={capitalize(formatEffort(task.effort)) || '—'} />
    </>
  )
}

/** Pillar, execution, the finding it maps to, and ownership. */
function ContextRows({
  task,
  pillarLabel,
}: {
  task: TaskDetail
  pillarLabel?: string
}): JSX.Element {
  return (
    <>
      <InfoRow label="Pillar" value={pillarLabel ?? (task.pillar || '—')} />
      <InfoRow label="Group" value={task.group || '—'} />
      {task.category && <InfoRow label="Category" value={capitalize(task.category)} />}
      <InfoRow label="Execution" value={executionLabel(task)} />
      <AutoFixRow available={task.canAutoFix} />
      {task.findingCode && <FindingCodeRow code={task.findingCode} />}
      <InfoRow label="Plan rank" value={task.rank > 0 ? `#${task.rank}` : '—'} />
      <InfoRow label="Top fix" value={task.isTopFix ? 'Yes' : 'No'} />
      <InfoRow label="Assignee" value={task.assigneeEmail || 'Unassigned'} />
    </>
  )
}

/** The live-site verification result: when it last passed + why it did/didn't. */
function VerificationNote({ task }: { task: TaskDetail }): JSX.Element | null {
  if (!task.verifiedAt && !task.verificationMessage) return null
  return (
    <div className="mt-1 border-t border-[var(--cat-border-soft)] pt-2.5">
      {task.verifiedAt && (
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="shrink-0 text-[var(--cat-ink-3)]">Verified</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-[#1e8a5c]">
            <BadgeCheck size={13} />
            {formatTaskDate(task.verifiedAt)}
          </span>
        </div>
      )}
      {task.verificationMessage && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--cat-ink-3)]">
          {task.verificationMessage}
        </p>
      )}
    </div>
  )
}

/** The task's metadata sidebar: when it was identified, its scoring, pillar
 *  context, execution, the finding it maps to, and ownership. */
export function TaskDetailInfo({ task }: { task: TaskDetail }): JSX.Element {
  const pillarLabel = GEO_PILLARS.find(p => String(p.key) === `${task.pillar}_score`)?.label
  return (
    <Card>
      <CardHead title="Details" />
      <div className="flex flex-col gap-2.5">
        <TypeChips task={task} />
        <ScoringRows task={task} />
        <PillarScoreRow pillar={task.pillar} />
        <ContextRows task={task} pillarLabel={pillarLabel} />
        <VerificationNote task={task} />
      </div>
    </Card>
  )
}

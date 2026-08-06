'use client'

import { Favicon } from '@/components/Favicon'
import { TaskTypeIcon } from '@/features/catalyst/components/agent/TaskTypeIcon'
import { LOGO_SIZE } from '@/features/catalyst/constants'
import { TASK_TYPE_LABEL, taskTypeOf, type TaskType } from '@/features/catalyst/tasks-data'
import { SIGNAL_TINT, signalColor } from '@/lib/signal-colors'

interface TaskGlyphProps {
  title: string
  description?: string
  size?: number
  /** Signal this task moves, e.g. "E-E-A-T". Colours the tile so the glyph and
   *  the row's badge read as the same thing. Empty renders the neutral tile. */
  signal?: string
}

/** First domain-like token in the text (e.g. "youtube.com"), or '' if none. */
function domainInText(text: string): string {
  const match = text.match(/\b((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,})\b/i)
  return match ? match[1].toLowerCase() : ''
}

/**
 * The task-type icon on a tile tinted by the task's signal.
 *
 * The tint is the same hex the row's `SignalTag` uses, at the same alpha, so a
 * row reads as one object rather than a grey icon beside a coloured badge. A
 * task with no signal keeps the neutral surface tile.
 */
function TypeTile({
  type,
  size,
  signal,
}: {
  type: TaskType
  size: number
  signal?: string
}): JSX.Element {
  const color = signal ? signalColor(signal) : ''
  return (
    <span
      title={TASK_TYPE_LABEL[type]}
      className={
        color
          ? 'grid h-full w-full place-items-center rounded-md'
          : 'grid h-full w-full place-items-center rounded-md bg-[var(--cat-hover)] text-[var(--cat-ink-2)]'
      }
      style={
        color
          ? {
              color,
              backgroundColor: `${color}${SIGNAL_TINT.fill}`,
              // Inset shadow rather than a Tailwind ring: the colour is dynamic,
              // and a ring would mean writing Tailwind's internal ring variable.
              boxShadow: `inset 0 0 0 1px ${color}${SIGNAL_TINT.ring}`,
            }
          : undefined
      }
    >
      <TaskTypeIcon type={type} size={Math.round(size * 0.62)} />
    </span>
  )
}

/**
 * A task's leading glyph: the referenced site's real favicon for placement tasks
 * (e.g. "Get mentioned on youtube.com"), otherwise the task-type category icon.
 * Keeps a consistent square footprint so task-name columns stay aligned.
 */
export function TaskGlyph({
  title,
  description,
  size = LOGO_SIZE.base,
  signal,
}: TaskGlyphProps): JSX.Element {
  const type = taskTypeOf({ title, description })
  const domain = domainInText(title)
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      {domain ? (
        <Favicon
          url={domain}
          size={size}
          className="h-full w-full rounded object-contain"
          fallback={<TypeTile type={type} size={size} signal={signal} />}
        />
      ) : (
        <TypeTile type={type} size={size} signal={signal} />
      )}
    </span>
  )
}

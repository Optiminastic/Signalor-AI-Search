'use client'

import { useId } from 'react'

import { SECTION_TITLE } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { DAYS, type Day } from '@/lib/api/agent-mode-business-profile'

interface HoursEditorProps {
  hours: Record<string, string>
  onChange: (hours: Record<string, string>) => void
}

const LABELS: Record<Day, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

const INPUT =
  'h-[30px] w-full rounded-md border border-[var(--cat-control-border)] bg-[var(--cat-card)] px-2 text-[12.5px] text-[var(--cat-ink)] outline-none placeholder:text-[var(--cat-ink-3)] focus:ring-2 focus:ring-[#e04a3d]'
const MAX_LENGTH = 40

interface DayRowProps {
  day: Day
  value: string
  onChange: (value: string) => void
}

function DayRow({ day, value, onChange }: DayRowProps): JSX.Element {
  const id = useId()
  return (
    <div className="grid grid-cols-[96px_1fr] items-center gap-2">
      <label htmlFor={id} className="text-[12px] text-[var(--cat-ink-2)]">
        {LABELS[day]}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={MAX_LENGTH}
        placeholder="09:00-18:00 or Closed"
        onChange={event => onChange(event.target.value)}
        className={INPUT}
      />
    </div>
  )
}

/** Opening hours, one line per day. */
export function HoursEditor({ hours, onChange }: HoursEditorProps): JSX.Element {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className={`${SECTION_TITLE} mb-1`}>Opening hours</legend>
      {DAYS.map(day => (
        <DayRow
          key={day}
          day={day}
          value={hours[day] ?? ''}
          onChange={value => onChange({ ...hours, [day]: value })}
        />
      ))}
    </fieldset>
  )
}

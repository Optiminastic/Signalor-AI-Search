'use client'

import { useId } from 'react'

interface EditFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  /** Rows for a multi-line field; omitted for a single line. */
  rows?: number
  maxLength?: number
  hint?: string
}

const INPUT =
  'w-full rounded-md border border-[var(--cat-control-border)] bg-[var(--cat-card)] p-2 text-[12.5px] leading-relaxed text-[var(--cat-ink)] outline-none placeholder:text-[var(--cat-ink-3)] focus:ring-2 focus:ring-[#e04a3d]'

type InputProps = Omit<EditFieldProps, 'label' | 'hint'> & { id: string }

function Input({ id, value, onChange, rows, maxLength }: InputProps): JSX.Element {
  const shared = {
    id,
    maxLength,
    value,
    className: INPUT,
  }
  return rows ? (
    <textarea {...shared} rows={rows} onChange={event => onChange(event.target.value)} />
  ) : (
    <input {...shared} type="text" onChange={event => onChange(event.target.value)} />
  )
}

/** One labelled input in the draft editor, with an optional character count. */
export function EditField({ label, hint, ...input }: EditFieldProps): JSX.Element {
  const id = useId()
  const counter = input.maxLength ? `${input.value.length}/${input.maxLength}` : ''
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[12px] font-medium text-[var(--cat-ink-2)]">
          {label}
        </label>
        {counter && (
          <span className="text-[11px] text-[var(--cat-ink-3)] tabular-nums">{counter}</span>
        )}
      </div>
      <Input id={id} {...input} />
      {hint && <p className="text-[11.5px] text-[var(--cat-ink-3)]">{hint}</p>}
    </div>
  )
}

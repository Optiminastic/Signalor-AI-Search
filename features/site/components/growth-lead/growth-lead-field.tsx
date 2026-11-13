import type { ReactNode } from 'react'

/** Sheet-square field (DESIGN.md 6d) with a quiet hover and a brand-red focus ring. */
export const GROWTH_FIELD_CLASS =
  'block w-full rounded-none border border-black/10 bg-white px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none transition-[border-color,box-shadow] duration-150 hover:border-black/20 focus:border-primary focus:ring-3 focus:ring-primary/10 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/10 disabled:cursor-not-allowed disabled:opacity-60'

interface GrowthLeadFieldProps {
  id: string
  label: string
  optional?: boolean
  error?: string
  children: ReactNode
}

export function GrowthLeadField({
  id,
  label,
  optional = false,
  error,
  children,
}: GrowthLeadFieldProps): JSX.Element {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-foreground flex items-baseline justify-between text-[13px] font-medium"
      >
        {label}
        {optional ? (
          <span className="text-muted-foreground text-[12px] font-normal">Optional</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-[12.5px]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

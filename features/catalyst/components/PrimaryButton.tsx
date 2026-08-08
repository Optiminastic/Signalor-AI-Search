import type { ButtonHTMLAttributes } from 'react'

import type { LucideIcon } from '@/lib/icons'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  /** Square icon-only button (no label). */
  iconOnly?: boolean
}

/**
 * The single brand CTA used across the app — consistent height, weight, icon.
 *
 * Wears the exact treatment of the selected sidebar nav item (Overview): the
 * warm-red top-to-bottom gradient plus `shadow-nav-selected` — a 1px brand ring
 * with the inset white top-line highlight. Centralised here so every
 * PrimaryButton (Re-analyze, Start, New brand…) matches that button verbatim.
 */
const SURFACE = 'bg-linear-to-b from-[#e04a3d] to-[#c53f34] shadow-nav-selected text-white'

export function PrimaryButton({
  icon: Icon,
  iconOnly = false,
  className = '',
  children,
  ...rest
}: PrimaryButtonProps): JSX.Element {
  const base = iconOnly
    ? `${SURFACE} grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg`
    : `${SURFACE} inline-flex h-[34px] shrink-0 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold whitespace-nowrap`
  return (
    <button type="button" {...rest} className={`${base} ${className}`}>
      {Icon && <Icon size={16} strokeWidth={2.2} />}
      {children}
    </button>
  )
}

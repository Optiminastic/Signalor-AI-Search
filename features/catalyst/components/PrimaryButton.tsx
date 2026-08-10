'use client'

import { BorderBeam } from 'border-beam'
import type { ButtonHTMLAttributes } from 'react'

import type { LucideIcon } from '@/lib/icons'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  /** Square icon-only button (no label). */
  iconOnly?: boolean
  /**
   * Classes for the beam wrapper rather than the button.
   *
   * The beam needs a real element around the button, and that wrapper is what
   * the parent layout now sees. Anything positional — `w-full`, `ml-auto` —
   * therefore has to sit here; left on the button it would size against the
   * shrink-to-fit wrapper instead of the parent and collapse.
   */
  wrapperClassName?: string
}

/**
 * The single brand CTA used across the app — consistent height, weight, icon.
 *
 * Wears the exact treatment of the selected sidebar nav item (Overview): the
 * warm-red top-to-bottom gradient plus `shadow-nav-selected` — a 1px brand ring
 * with the inset white top-line highlight. Centralised here so every
 * PrimaryButton (Re-analyze, Start, New brand…) matches that button verbatim.
 *
 * Ringed by the same animated border beam as the Agent trigger, so the app's
 * primary action carries one recognisable treatment everywhere. The beam stops
 * while the button is disabled: a control you cannot press should not be the
 * most animated thing on screen. `border-beam` disables its own animation under
 * `prefers-reduced-motion`.
 */
const SURFACE = 'bg-linear-to-b from-[#e04a3d] to-[#c53f34] shadow-nav-selected text-white'

/** Matches the button's `rounded-lg` (8px) so the beam hugs the edge. */
const BEAM_RADIUS = 8

export function PrimaryButton({
  icon: Icon,
  iconOnly = false,
  className = '',
  wrapperClassName = '',
  children,
  ...rest
}: PrimaryButtonProps): JSX.Element {
  const base = iconOnly
    ? `${SURFACE} grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg`
    : `${SURFACE} inline-flex h-[34px] shrink-0 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold whitespace-nowrap`
  return (
    <BorderBeam
      active={!rest.disabled}
      borderRadius={BEAM_RADIUS}
      size="sm"
      theme="auto"
      className={`inline-flex min-w-0 shrink-0 flex-col items-stretch overflow-visible! leading-none ${wrapperClassName}`}
    >
      <button type="button" {...rest} className={`${base} ${className}`}>
        {Icon && <Icon size={16} strokeWidth={2.2} />}
        {children}
      </button>
    </BorderBeam>
  )
}

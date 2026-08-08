'use client'

import type { ComponentType, MouseEvent } from 'react'

import { useCatalystTheme } from '@/features/catalyst/components/CatalystThemeProvider'
import { runThemeTransition } from '@/features/catalyst/theme-transition'
import { Moon, Sun } from '@/lib/icons'

/**
 * BoardUI's segmented sun|moon theme toggle, wired to our real theme.
 *
 * The visual is BoardUI's exact `appearance="segmented"` control — a pill with a
 * sliding light indicator behind the active icon — but it drives
 * `useCatalystTheme` (the `.dark` class + `catalyst-theme` storage) rather than
 * BoardUI's separate `boardui:theme` store, so it actually flips the app. The
 * flip runs inside BoardUI's circular colour reveal from the click point.
 *
 * Sized to the top bar's 34px controls: 26px targets inside a 4px-padded pill.
 */

const MODES = [
  { mode: 'light' as const, label: 'Light mode', Icon: Sun },
  { mode: 'dark' as const, label: 'Dark mode', Icon: Moon },
]

interface ModeButtonProps {
  label: string
  Icon: ComponentType<{ className?: string }>
  selected: boolean
  onActivate: (event: MouseEvent<HTMLButtonElement>) => void
}

function ModeButton({ label, Icon, selected, onActivate }: ModeButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onActivate}
      className={`ease relative z-10 grid size-[26px] cursor-pointer place-items-center rounded-full transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--cat-ink-3)] ${
        selected ? 'text-[var(--cat-ink)]' : 'text-[var(--cat-ink-3)] hover:text-[var(--cat-ink)]'
      }`}
    >
      <Icon className="size-4" />
    </button>
  )
}

export function ThemeToggleButton(): JSX.Element {
  const { dark, toggle } = useCatalystTheme()

  // Reveal from the click point; keyboard activation (clientX/Y === 0) starts
  // from the button centre instead.
  const activate = (event: MouseEvent<HTMLButtonElement>): void => {
    const origin =
      event.clientX === 0 && event.clientY === 0 ? null : { x: event.clientX, y: event.clientY }
    void runThemeTransition(origin, event.currentTarget, toggle)
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className="bg-background-primary-default relative inline-flex h-[34px] w-fit shrink-0 items-center gap-1 rounded-full border border-[var(--cat-border)] p-1 shadow-xs"
    >
      {/* Sliding indicator marking the active mode; a grey raised thumb on the
          white track, matching the neighbouring white bordered tiles. */}
      <span
        aria-hidden
        className={`bg-background-secondary-default ease pointer-events-none absolute top-1 left-1 size-[26px] rounded-full shadow-xs transition-transform duration-200 ${
          dark ? 'translate-x-[30px]' : ''
        }`}
      />
      {MODES.map(({ mode, label, Icon }) => {
        const selected = (mode === 'dark') === dark
        return (
          <ModeButton
            key={mode}
            label={label}
            Icon={Icon}
            selected={selected}
            onActivate={event => !selected && activate(event)}
          />
        )
      })}
    </div>
  )
}

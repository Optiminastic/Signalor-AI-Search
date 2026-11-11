import { CONTROL_CHIP } from '@/features/catalyst/components/control-styles'

/** Shared class recipes for the Approvals tab, on the dashboard's surface tokens. */

export const SECTION_TITLE =
  'text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase'

/** A flat bordered box on the card surface. */
export const PANEL = 'rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)]'

/** Secondary button: the dashboard's 34px control chip, with a disabled look. */
export const SECONDARY_BUTTON = `${CONTROL_CHIP} disabled:cursor-not-allowed disabled:opacity-50`

export const MUTED_TEXT = 'text-[12.5px] text-[var(--cat-ink-2)]'

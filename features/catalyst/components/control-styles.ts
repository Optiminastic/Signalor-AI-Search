/**
 * Shared chrome for every dashboard control — icon tiles, dropdown chips and the
 * search field. Centralised so the edge and lift stay identical across the app.
 */

/**
 * Control chrome: a single flat 1px border (`--cat-control-border`, a touch
 * stronger than --cat-border) on a white surface — no shadow, for a clean,
 * inset "Linear-like" feel rather than a raised chip. One definition so every
 * select, dropdown trigger and icon tile shares the same edge.
 */
export const CONTROL_RING = 'border border-[var(--cat-control-border)]'

/** Square, icon-only control — theme toggle, feedback, help, notifications. */
export const ICON_TILE =
  `grid h-[34px] w-[34px] shrink-0 place-items-center rounded-md bg-background-primary-default ` +
  `text-[var(--cat-ink-2)] transition-colors hover:bg-background-secondary-default ` +
  `hover:text-[var(--cat-ink)] ${CONTROL_RING}`

/**
 * Labelled control with a caret — date range, engine filter.
 *
 * `whitespace-nowrap` is load-bearing: the label is a bare text node, so without
 * it a crowded top bar wraps "Last month" onto two lines and the chip outgrows
 * its 34px height.
 */
export const CONTROL_CHIP =
  `inline-flex h-[34px] shrink-0 items-center gap-2 rounded-md bg-background-primary-default px-3 ` +
  `text-[13px] font-medium whitespace-nowrap text-[var(--cat-ink)] transition-colors ` +
  `hover:bg-background-secondary-default ${CONTROL_RING}`

/**
 * The ⌘K search field. Sits on the one shared elevated surface
 * (background/primary — the same fill as the chart frame, icon tiles and
 * dropdowns) with a hairline border so it stays visible on the white main in
 * light mode, and the brand ring only on focus.
 */
export const SEARCH_FIELD =
  `h-[34px] w-full rounded-lg border border-[var(--cat-control-border)] bg-background-primary-default pr-12 pl-9 text-[13px] ` +
  `text-[var(--cat-ink)] outline-none placeholder:text-[var(--cat-ink-3)] ` +
  `focus:ring-2 focus:ring-[#e04a3d]`

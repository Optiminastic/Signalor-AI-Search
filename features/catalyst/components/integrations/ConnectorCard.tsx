'use client'

import type { CSSProperties, ReactNode } from 'react'

import { Check, ChevronDown, Loader2, Unlink2 } from '@/lib/icons'

/**
 * Shell and controls shared by the first-class connectors (GitHub, Slack).
 *
 * These cards sit in the same grid as the catalog's `IntegrationCard`, so they
 * borrow its shell metrics and type scale verbatim. Keeping that in one place is
 * the point: the two cards previously each carried their own copy and had
 * already drifted apart (13px vs 13.5px titles, `--cat-ink-3` vs `--cat-ink-2`
 * body), which read as two different card designs on one screen.
 */

/* The shared dashboard card recipe (see components/Card.tsx): rounded-2xl,
   --cat-card-border, p-3, and the cat-card-edge top line in dark mode. This
   shell used to hand-roll its own — rounded-md, p-3.5, --cat-border — so the
   integrations grid sat at a visibly different radius and padding from every
   other card in the product. */
const CARD_BASE =
  'cat-card-edge group relative flex h-full flex-col rounded-2xl border bg-[var(--cat-card)] p-3 transition-colors duration-200'

/**
 * `attention` is for connected-but-inert: a workspace with no channel, a GitHub
 * App with no repo chosen. Green would promise delivery that isn't happening.
 */
export type ConnectorTone = 'idle' | 'connected' | 'attention'

/**
 * Border only, no background wash.
 *
 * Connected cards used to carry a green tint AND a green border, which made the
 * finished integrations the loudest thing on the page while the ones actually
 * needing a click stayed grey. That is the attention hierarchy backwards: a
 * connected row is done, and the "Connected" badge already says so.
 */
const TONE_BORDER: Record<ConnectorTone, string> = {
  idle: 'border-[var(--cat-card-border)] hover:border-[var(--cat-ink-3)]',
  connected: 'border-[rgba(47,190,126,0.35)]',
  attention: 'border-[rgba(224,74,61,0.45)]',
}

export interface ConnectorCardProps {
  name: string
  description: string
  /** Brand glyph, rendered inside the tinted tile. */
  mark: ReactNode
  /** Background for the 36px logo tile, e.g. `bg-[#4A154B]`. */
  markClassName?: string
  /** Tile background when the brand colour is data, not a class (catalog accents). */
  markStyle?: CSSProperties
  tone: ConnectorTone
  /** Top-right slot: the Connect button, a spinner, or the connected badge. */
  action: ReactNode
  /** Below-the-fold slot: the picker row, or a cancel link while connecting. */
  footer?: ReactNode
  /** Shown above the footer in red — a real failure, not a hint. */
  error?: string | null
}

export function ConnectorCard({
  name,
  description,
  mark,
  markClassName = '',
  markStyle,
  tone,
  action,
  footer,
  error,
}: ConnectorCardProps): JSX.Element {
  return (
    <div className={`${CARD_BASE} ${TONE_BORDER[tone]}`}>
      {/* Name sits beside the logo rather than under it. Stacked, every card
          spent a whole row on a 36px tile and pushed the footer control below
          the fold of its neighbours; inline, the identity reads in one line and
          the card is about 40px shorter. */}
      <div className="flex items-start gap-2.5">
        <span
          style={markStyle}
          className={`grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md text-white ${markClassName}`}
        >
          {mark}
        </span>
        <p className="mt-1.5 min-w-0 flex-1 truncate text-[13.5px] font-semibold text-[var(--cat-ink)]">
          {name}
        </p>
        <span className="mt-0.5 shrink-0">{action}</span>
      </div>
      {/* Clamped: catalog copy runs to three lines for some providers and one
          for others, which left a ragged bottom edge across the row. */}
      <p className="mt-2.5 line-clamp-2 text-[12px] leading-snug text-[var(--cat-ink-2)]">
        {description}
      </p>
      {error && <p className="mt-2 text-[11.5px] font-medium text-[#E5484D]">{error}</p>}
      {/* mt-auto pins the control to the bottom, so the picker rows line up
          across a row of cards instead of floating at three different heights. */}
      {footer && <div className="mt-auto">{footer}</div>}
    </div>
  )
}

export function ConnectorSpinner(): JSX.Element {
  return <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
}

export function ConnectedBadge(): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(47,190,126,0.12)] px-2 py-0.5 text-[11px] font-semibold text-[#1e8a5c]">
      <Check size={12} strokeWidth={3} />
      Connected
    </span>
  )
}

/**
 * The one filled control on a connector card, always in the brand red.
 *
 * It used to take the provider's own accent (`style={{background: item.accent}}`),
 * so a single screen showed a Shopify-green button beside a WordPress-blue one
 * beside a Slack-aubergine one. DESIGN.md §B2 reserves hue for the brand in
 * buttons and active states precisely to stop that: with six vendor colours
 * competing, none of them reads as "the thing to click". The vendor's colour
 * still tints its logo tile, which is where a brand mark belongs.
 */
export function ConnectButton({
  onClick,
  mark,
  label = 'Connect',
}: {
  onClick: () => void
  mark?: ReactNode
  label?: string
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#e04a3d] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[#c53f34]"
    >
      {mark}
      {label}
    </button>
  )
}

/**
 * The hairline-separated row every connected card ends with. Shared so the
 * catalog cards and the OAuth connectors line up pixel for pixel in one grid.
 */
export function ConnectorFooterRow({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="mt-3 flex items-center gap-2 border-t border-[var(--cat-border-soft)] pt-2.5">
      {children}
    </div>
  )
}

export function DisconnectButton({
  onClick,
  busy,
  name,
  title,
}: {
  onClick: () => void
  busy?: boolean
  name: string
  title?: string
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={`Disconnect ${name}`}
      title={title ?? `Disconnect ${name}`}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[#E5484D] disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Unlink2 className="h-3.5 w-3.5" />
      )}
    </button>
  )
}

export function CancelButton({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2.5 self-start text-[11.5px] font-medium text-neutral-500 transition-colors hover:text-[var(--cat-ink)]"
    >
      Cancel
    </button>
  )
}

/**
 * The picker row. A hairline rule separates the live setting from the card's
 * marketing copy, and the label column is fixed-width so "Channel" and
 * "Repository" line up when the two cards sit side by side in the grid.
 */
export function ConnectorFooter({
  label,
  control,
  onDisconnect,
  disconnecting,
  disconnectTitle,
  name,
}: {
  label: string
  control: ReactNode
  onDisconnect: () => void
  disconnecting: boolean
  disconnectTitle?: string
  name: string
}): JSX.Element {
  return (
    <ConnectorFooterRow>
      <span className="w-[52px] shrink-0 text-[11px] text-[var(--cat-ink-3)]">{label}</span>
      {control}
      <DisconnectButton
        onClick={onDisconnect}
        busy={disconnecting}
        name={name}
        title={disconnectTitle}
      />
    </ConnectorFooterRow>
  )
}

const CONTROL_BASE =
  'h-7 w-full min-w-0 truncate rounded-md border px-2 text-[11.5px] text-[var(--cat-ink-2)]'

export interface ConnectorOption {
  value: string
  label: string
}

interface ConnectorSelectProps {
  value: string
  options: ConnectorOption[]
  onChange: (value: string) => void
  disabled?: boolean
  /** Nothing chosen yet — red edge, and a forced placeholder option. */
  needsChoice?: boolean
  placeholder: string
  ariaLabel: string
  title?: string
  mono?: boolean
}

function selectClassName({ needsChoice, mono }: ConnectorSelectProps): string {
  const edge = needsChoice ? 'border-[#e04a3d]' : 'border-[var(--cat-border)]'
  return `${CONTROL_BASE} ${edge} ${mono ? 'font-mono' : ''} appearance-none bg-[var(--cat-card)] pr-6 outline-none focus:border-[var(--cat-ink-3)] disabled:opacity-60`
}

/**
 * A native select with the browser's chrome stripped and our own chevron, so it
 * matches the read-only value box beside it on the other card.
 */
export function ConnectorSelect(props: ConnectorSelectProps): JSX.Element {
  const { value, options, onChange, disabled, needsChoice, placeholder, ariaLabel, title } = props
  return (
    <span className="relative min-w-0 flex-1">
      <select
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        aria-label={ariaLabel}
        title={title}
        className={selectClassName(props)}
      >
        {/* Force a deliberate pick rather than defaulting to whichever option
            happens to be first in the list. */}
        {(needsChoice || !value) && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3.5 w-3.5 -translate-y-1/2 text-[var(--cat-ink-3)]" />
    </span>
  )
}

/** The settled, single-option case: same box as the select, minus the affordance. */
export function ConnectorValue({
  value,
  title,
  mono,
}: {
  value: string
  title?: string
  mono?: boolean
}): JSX.Element {
  return (
    <span
      title={title}
      className={`${CONTROL_BASE} ${mono ? 'font-mono' : ''} flex items-center border-transparent bg-[var(--cat-hover)]`}
    >
      {value}
    </span>
  )
}

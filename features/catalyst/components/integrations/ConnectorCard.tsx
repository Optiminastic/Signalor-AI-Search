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

const CARD_BASE =
  'group relative flex flex-col rounded-md border p-3.5 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(16,24,40,.07)]'

/**
 * `attention` is for connected-but-inert: a workspace with no channel, a GitHub
 * App with no repo chosen. Green would promise delivery that isn't happening.
 */
export type ConnectorTone = 'idle' | 'connected' | 'attention'

const TONE_BORDER: Record<ConnectorTone, string> = {
  idle: 'border-[var(--cat-border)] bg-[var(--cat-card)]',
  connected: 'border-[rgba(47,190,126,0.4)] bg-[rgba(47,190,126,0.035)]',
  attention: 'border-[rgba(224,74,61,0.4)] bg-[rgba(224,74,61,0.03)]',
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
      <div className="flex items-start justify-between gap-2">
        <span
          style={markStyle}
          className={`grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md text-white ${markClassName}`}
        >
          {mark}
        </span>
        {action}
      </div>
      <p className="mt-3 text-[13.5px] font-semibold text-[var(--cat-ink)]">{name}</p>
      <p className="mt-1 text-[12px] leading-snug text-[var(--cat-ink-2)]">{description}</p>
      {error && <p className="mt-2 text-[11.5px] font-medium text-[#E5484D]">{error}</p>}
      {footer}
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

export function ConnectButton({
  onClick,
  mark,
  className = '',
  style,
  label = 'Connect',
}: {
  onClick: () => void
  mark?: ReactNode
  /** Brand background + hover, e.g. `bg-[#4A154B] hover:bg-[#611f69]`. */
  className?: string
  /** Brand background when the colour is data rather than a class. */
  style?: CSSProperties
  label?: string
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium text-white transition-opacity hover:opacity-90 ${className}`}
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

import Link from 'next/link'

import type { LiveReason } from '@/lib/api/live-visitors'

/**
 * What a section says when it has nothing to show.
 *
 * Deliberately distinguishes "not wired up" from "wired up and quiet" — the
 * first is an action the user can take, the second is just Tuesday afternoon,
 * and showing the same grey zero for both is what makes analytics widgets feel
 * broken.
 */

interface CopyAndLink {
  copy: string
  /** Relative to the brand dashboard root, e.g. 'integrations'. */
  to?: string
  cta?: string
}

const REASON_COPY: Record<Exclude<LiveReason, ''>, CopyAndLink> = {
  not_connected: {
    copy: 'Connect Google Analytics to see live visitors.',
    to: 'integrations',
    cta: 'Connect',
  },
  no_property: {
    copy: 'Pick which GA4 property to read.',
    to: 'integrations',
    cta: 'Choose property',
  },
  auth_expired: {
    copy: 'Google Analytics needs reconnecting.',
    to: 'integrations',
    cta: 'Reconnect',
  },
  api_error: { copy: 'Live data is unavailable right now — retrying.' },
}

export function humansEmptyState(reason: LiveReason): CopyAndLink {
  if (!reason) return { copy: 'No one on the site right now.' }
  return REASON_COPY[reason]
}

export function botsEmptyState(everSeen: boolean): CopyAndLink {
  return everSeen
    ? { copy: 'No AI crawlers in the last 30 minutes.' }
    : {
        copy: 'Install the crawler snippet to see AI bots.',
        to: 'crawlers',
        cta: 'Set up',
      }
}

interface LiveEmptyStateProps {
  state: CopyAndLink
  /** Builds the brand-scoped href; the popover owns the brand context. */
  hrefFor: (to: string) => string
}

export function LiveEmptyState({ state, hrefFor }: LiveEmptyStateProps): JSX.Element {
  return (
    <p className="px-2 py-1.5 text-[11.5px] leading-relaxed text-[var(--cat-ink-3)]">
      {state.copy}
      {state.to && state.cta && (
        <>
          {' '}
          <Link
            href={hrefFor(state.to)}
            className="font-medium text-[var(--cat-ink-2)] underline underline-offset-2 transition-colors hover:text-[var(--cat-ink)]"
          >
            {state.cta}
          </Link>
        </>
      )}
    </p>
  )
}

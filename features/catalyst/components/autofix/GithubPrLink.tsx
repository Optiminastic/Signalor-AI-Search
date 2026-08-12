import type { ReactNode } from 'react'

import { GithubMark } from '@/components/GithubMark'

interface GithubPrLinkProps {
  /** The pull request's URL on GitHub. */
  href: string
  /** Tooltip — usually the fix's status message. */
  title?: string
  /** Icon size in px; 13 suits a row control, 12 a body-copy action. */
  iconSize?: number
  children: ReactNode
}

/**
 * The "a PR exists" link — the one affordance that leaves our app for GitHub.
 *
 * Solid GitHub black with the inverted (white) Invertocat, rather than the
 * neutral outline every other row control uses: once a pull request is open,
 * the next step happens on GitHub, and the button should look like it. The mark
 * inherits `currentColor`, so `text-white` is what inverts it.
 *
 * Shared by the tasks table, the task header and the auto-fix flow so a PR
 * link never drifts between surfaces.
 */
export function GithubPrLink({
  href,
  title,
  iconSize = 13,
  children,
}: GithubPrLinkProps): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#24292f] px-3 text-[12px] font-semibold text-white transition-colors hover:bg-[#1f2328]"
    >
      <GithubMark size={iconSize} />
      {children}
    </a>
  )
}

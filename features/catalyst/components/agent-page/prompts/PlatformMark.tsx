import { PLATFORM_META } from '@/features/catalyst/components/agent-page/prompts/platforms'
import type { Platform } from '@/lib/api/agent-mode-prompt-presence'

const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452z'
const X_PATH =
  'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z'

interface PlatformMarkProps {
  platform: Platform
  /** Pixel size of the square mark. */
  size?: number
}

function Glyph({ platform }: { platform: Platform }): JSX.Element {
  if (platform === 'linkedin')
    return <path d={LINKEDIN_PATH} transform="translate(5 5) scale(0.58)" />
  if (platform === 'x') return <path d={X_PATH} transform="translate(5.5 5.5) scale(0.54)" />
  const letter = platform === 'reddit' ? 'r/' : 'G'
  return (
    <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="inherit">
      {letter}
    </text>
  )
}

/**
 * A small square in the platform's colour with its logo or initial, so Reddit,
 * LinkedIn, X and Google read apart at a glance. Decorative: the platform name
 * is always written next to it.
 */
export function PlatformMark({ platform, size = 16 }: PlatformMarkProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0 rounded-[4px] dark:ring-1 dark:ring-white/20"
    >
      <rect width="24" height="24" rx="5" fill={PLATFORM_META[platform].color} />
      <g fill="#ffffff">
        <Glyph platform={platform} />
      </g>
    </svg>
  )
}

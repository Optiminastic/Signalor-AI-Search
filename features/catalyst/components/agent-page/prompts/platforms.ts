import type { Platform } from '@/lib/api/agent-mode-prompt-presence'

export interface PlatformMeta {
  /** Section heading, e.g. "Reddit threads". */
  heading: string
  /** Short name for chips and the "You appear on" line. */
  name: string
  /** Brand colour, used for the mark and the section's edge only (never for text). */
  color: string
  /** The section's coloured left edge (static so Tailwind keeps it). */
  edge: string
}

/** Display order: the conversations to join first, Google last. */
export const PLATFORM_ORDER: Platform[] = ['reddit', 'linkedin', 'x', 'google']

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  reddit: {
    heading: 'Reddit threads',
    name: 'Reddit',
    color: '#ff4500',
    edge: 'border-l-[#ff4500]',
  },
  linkedin: {
    heading: 'LinkedIn posts',
    name: 'LinkedIn',
    color: '#0a66c2',
    edge: 'border-l-[#0a66c2]',
  },
  x: {
    heading: 'X posts',
    name: 'X',
    color: '#0f1419',
    edge: 'border-l-[#0f1419] dark:border-l-[#e7e9ea]',
  },
  google: { heading: 'Google links', name: 'Google', color: '#4285f4', edge: 'border-l-[#4285f4]' },
}

export function isPlatform(value: string): value is Platform {
  return (PLATFORM_ORDER as string[]).includes(value)
}

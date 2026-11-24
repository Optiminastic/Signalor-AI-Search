import Link from 'next/link'

import { ArrowRight } from '@/lib/icons'

interface AnnouncementBarProps {
  /** Tailwind classes for the wrapper's spacing; overrides the default bottom margin. */
  className?: string
}

/**
 * Refined announcement pill that floats above the hero headline. A bordered,
 * frosted badge with a "New" chip and an arrow that nudges on hover — reads as
 * premium against the sand backdrop, matching the landing's editorial system.
 */
export function AnnouncementBar({ className = 'mb-7 sm:mb-8' }: AnnouncementBarProps): JSX.Element {
  return (
    <div className={`flex justify-center ${className}`}>
      <Link
        href="/sign-up"
        className="group hover:border-primary/30 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 py-1 pr-3.5 pl-1 text-[13px] font-medium text-[#3f3f46] shadow-[0_1px_2px_rgba(16,24,40,0.04)] backdrop-blur transition-colors hover:text-[#171717]"
      >
        <span className="bg-primary-strong rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white">
          New
        </span>
        Track your first 50 prompts free
        <ArrowRight
          size={14}
          strokeWidth={2.4}
          className="text-[#a1a1aa] transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  )
}

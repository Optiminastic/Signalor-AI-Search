const BADGE_BASE = 'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase'

interface PlanBadgeProps {
  popular?: boolean
  comingSoon?: boolean
}

/**
 * The small pill next to a plan name.
 *
 * "Coming soon" wins over "Popular": a plan nobody can buy yet should not be
 * advertised as the popular pick.
 */
export function PlanBadge({ popular, comingSoon }: PlanBadgeProps): JSX.Element | null {
  if (comingSoon) {
    return <span className={`bg-muted text-muted-foreground ${BADGE_BASE}`}>Coming soon</span>
  }
  if (popular) {
    return <span className={`bg-primary text-primary-foreground ${BADGE_BASE}`}>Popular</span>
  }
  return null
}

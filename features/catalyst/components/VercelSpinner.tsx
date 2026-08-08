interface VercelSpinnerProps {
  /** Overall diameter in px. */
  size?: number
  className?: string
}

const BARS = 12
const CYCLE_S = 1.2

/**
 * Vercel / Geist-style loading spinner: twelve rounded spokes in a ring, each
 * fading on a staggered delay so the bright point rotates around. Pure CSS -
 * `currentColor` for the colour and the `vercel-spin` keyframe in globals.css -
 * so there is no runtime dependency and it follows the theme.
 */
export function VercelSpinner({ size = 22, className = '' }: VercelSpinnerProps): JSX.Element {
  const barW = size * 0.09
  const barH = size * 0.27
  const radius = size * 0.32
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`relative inline-block text-[var(--cat-ink-3)] ${className}`}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: BARS }).map((_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: barW,
            height: barH,
            marginTop: -barH / 2,
            marginLeft: -barW / 2,
            borderRadius: barW,
            background: 'currentColor',
            transform: `rotate(${i * 30}deg) translateY(-${radius}px)`,
            animation: `vercel-spin ${CYCLE_S}s linear infinite`,
            animationDelay: `${-CYCLE_S + (i * CYCLE_S) / BARS}s`,
          }}
        />
      ))}
    </div>
  )
}

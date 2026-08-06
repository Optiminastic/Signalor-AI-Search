import type { ReactNode } from 'react'

// A very quiet "stage" drawn behind each platform illustration. The card stays
// dominant; everything here is faint light and drafting marks at 5-15% opacity,
// so the scene reads only as atmosphere - never as a decorative background.
//
// Hierarchy: illustration (dominant) > glow/lighting (secondary) > abstract
// background (tertiary). Motion is one slow particle drift, nothing more.

const RINGS = ['h-56 w-56', 'h-72 w-72', 'h-96 w-96'] as const

const PARTICLES = [
  { className: 'left-[8%] top-[16%]', delay: '0s', small: false },
  { className: 'left-[15%] bottom-[22%]', delay: '2.5s', small: true },
  { className: 'right-[17%] top-[10%]', delay: '4.5s', small: true },
  { className: 'right-[7%] bottom-[15%]', delay: '1.5s', small: false },
  { className: 'left-[30%] top-[5%]', delay: '3.5s', small: false },
  { className: 'right-[26%] bottom-[7%]', delay: '5.5s', small: true },
] as const

const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
}

function SceneParticles(): JSX.Element {
  return (
    <>
      {PARTICLES.map(particle => (
        <span
          key={`${particle.className}-${particle.delay}`}
          aria-hidden
          className={`motion-safe:animate-float pointer-events-none absolute rounded-full bg-neutral-900/15 ${particle.className}`}
          style={{
            width: particle.small ? 3 : 4,
            height: particle.small ? 3 : 4,
            animationDuration: '18s',
            animationDelay: particle.delay,
          }}
        />
      ))}
    </>
  )
}

export function FeatureScene({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:mx-0">
      <div aria-hidden className="pointer-events-none absolute -inset-x-8 -top-12 -bottom-12">
        {/* Radial glow - secondary light layer. */}
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(224,74,61,0.10),transparent_72%)]" />

        {/* Soft blurred gradient shapes - tertiary atmosphere. */}
        <span className="bg-primary/10 absolute top-10 -left-6 h-28 w-28 rounded-full blur-2xl" />
        <span className="absolute right-0 bottom-8 h-32 w-32 rounded-full bg-neutral-400/15 blur-3xl" />
        <span className="absolute top-0 left-1/3 h-24 w-24 rounded-full bg-neutral-300/20 blur-2xl" />

        {/* Concentric drafting rings behind the card. */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {RINGS.map(size => (
            <span
              key={size}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-900/[0.06] ${size}`}
            />
          ))}
        </span>

        {/* Faint technical grid. */}
        <span className="absolute inset-0" style={GRID_STYLE} />

        {/* Faint converging perspective lines. */}
        <svg
          viewBox="0 0 400 400"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full opacity-[0.05]"
        >
          <line x1="0" y1="70" x2="200" y2="200" stroke="#171717" strokeWidth="1" />
          <line x1="400" y1="70" x2="200" y2="200" stroke="#171717" strokeWidth="1" />
          <line x1="0" y1="330" x2="200" y2="200" stroke="#171717" strokeWidth="1" />
          <line x1="400" y1="330" x2="200" y2="200" stroke="#171717" strokeWidth="1" />
          <line x1="200" y1="0" x2="200" y2="200" stroke="#171717" strokeWidth="1" />
        </svg>

        {/* Tiny drifting dots - quietest layer. */}
        <SceneParticles />
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}

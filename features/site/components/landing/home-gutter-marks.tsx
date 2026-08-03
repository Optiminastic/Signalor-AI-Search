import { cn } from '@/features/site/lib/utils'

// ASCII wave for the empty gutters either side of the max-w-6xl rail: a bold
// serpentine ribbon of shade glyphs in the brand red, flowing from top to
// bottom. The wave lives in the page flow (not pinned), so it scrolls away
// with the content while the glyphs keep streaming down. Purely decorative:
// aria-hidden, pointer-events-none, motion-safe only, hidden below xl where
// there is no gutter to fill.

const WAVE_WIDTH = 13
// Tall enough to cover the full homepage scroll height (~13k px per copy).
const WAVE_ROWS = 608
/** Full sine cycles per block — integer, so the loop seam lines up. */
const WAVE_CYCLES = 19

/**
 * One row of the wave: solid core, softer shoulders, sparse dust around it.
 * Everything is deterministic — this renders on the server.
 */
function waveLine(row: number, phase: number): string {
  const t = (row / WAVE_ROWS) * WAVE_CYCLES * Math.PI * 2 + phase
  const center = (Math.sin(t) * 0.5 + 0.5) * (WAVE_WIDTH - 1)
  let line = ''
  for (let col = 0; col < WAVE_WIDTH; col += 1) {
    const dist = Math.abs(col - center)
    if (dist < 1.1) line += '▓'
    else if (dist < 2.4) line += '▒'
    else if (dist < 3.8) line += '░'
    else line += (row * 31 + col * 17) % 29 === 0 ? '·' : ' '
  }
  return line
}

function buildWave(phase: number): string {
  return Array.from({ length: WAVE_ROWS }, (_, row) => waveLine(row, phase)).join('\n')
}

const WAVE_LEFT = buildWave(0)
const WAVE_RIGHT = buildWave(Math.PI)

interface WaveColumnProps {
  wave: string
  /** Loop length, e.g. "90s" — different per side for a drifting feel. */
  duration: string
}

function WaveColumn({ wave, duration }: WaveColumnProps): JSX.Element {
  return (
    <div
      className="motion-safe:animate-stream will-change-transform"
      style={{ animationDuration: duration }}
    >
      <pre className="text-primary/45 font-mono text-lg leading-[1.2] font-semibold">{wave}</pre>
      <pre className="text-primary/45 font-mono text-lg leading-[1.2] font-semibold">{wave}</pre>
    </div>
  )
}

interface GutterProps {
  side: 'left' | 'right'
}

function Gutter({ side }: GutterProps): JSX.Element {
  const isLeft = side === 'left'
  return (
    <div className={cn('absolute inset-y-0 w-52 overflow-hidden', isLeft ? 'right-full' : 'left-full')}>
      <div className={cn('flex', isLeft ? 'justify-end pr-6' : 'justify-start pl-6')}>
        <WaveColumn wave={isLeft ? WAVE_LEFT : WAVE_RIGHT} duration={isLeft ? '90s' : '120s'} />
      </div>
    </div>
  )
}

/**
 * Renders the wave either side of the rail. Expects a `relative` ancestor
 * spanning the railed content (the homepage `<main>`).
 */
export function HomeGutterMarks(): JSX.Element {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-6xl -translate-x-1/2 select-none xl:block"
    >
      <Gutter side="left" />
      <Gutter side="right" />
    </div>
  )
}

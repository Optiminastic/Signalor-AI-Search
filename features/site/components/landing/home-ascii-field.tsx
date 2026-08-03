// Drifting ASCII dither field for the brand-red spotlight panels — the same
// glyph family and `animate-stream` loop as the page gutters, so the two read
// as one system. Sits between the panel texture and the screenshot card, which
// leaves it visible in the panel's padding band.
//
// Everything is deterministic (no Math.random), so it renders on the server and
// hydrates without a mismatch. Purely decorative: aria-hidden, motion-safe only.

const FIELD_COLS = 150
/** One block; a second identical copy sits below it so the loop seam lines up. */
const FIELD_ROWS = 40

/**
 * Two offset diagonal waves, thresholded into shade glyphs.
 *
 * Diagonal rather than the gutters' vertical sine: on a wide, short panel a
 * vertical wave reads as a few stray columns, while the diagonal keeps density
 * even across the whole band.
 */
function fieldLine(row: number): string {
  let line = ''
  for (let col = 0; col < FIELD_COLS; col += 1) {
    const a = Math.sin((col + row * 1.7) * 0.11)
    const b = Math.sin((col * 0.5 - row * 2.3) * 0.07)
    const v = (a + b) * 0.5
    if (v > 0.72) line += '▓'
    else if (v > 0.4) line += '▒'
    else if (v > 0.05) line += '░'
    else line += (row * 23 + col * 13) % 31 === 0 ? '·' : ' '
  }
  return line
}

const FIELD = Array.from({ length: FIELD_ROWS }, (_, row) => fieldLine(row)).join('\n')

/**
 * Fills its nearest positioned ancestor. The parent supplies the red;
 * this only adds the glyphs.
 */
export function HomeAsciiField(): JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      <div
        className="motion-safe:animate-stream will-change-transform"
        style={{ animationDuration: '150s' }}
      >
        <pre className="font-mono text-[11px] leading-[1.15] font-semibold whitespace-pre text-white/15">
          {FIELD}
        </pre>
        <pre className="font-mono text-[11px] leading-[1.15] font-semibold whitespace-pre text-white/15">
          {FIELD}
        </pre>
      </div>
    </div>
  )
}

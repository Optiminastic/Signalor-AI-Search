import { flushSync } from 'react-dom'

/**
 * BoardUI's theme-switch animation: a blurred circle expands from the click
 * point, revealing the new theme (via the View Transitions API).
 *
 * Ported to drive our theme (`apply` is `useCatalystTheme().toggle`) rather than
 * BoardUI's separate store. Two Signalor-specific details:
 *  - the `.dark` class lives on a React wrapper, so the flip must run inside
 *    `flushSync` to hit the DOM synchronously while the transition captures it;
 *  - our main panel carries `view-transition-name: cat-panel`, which would make
 *    it a separate snapshot the root mask can't cover — the `theme-transitioning`
 *    class on <html> unsets that name for the duration (see globals.css).
 */

const DURATION = 820
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'
const STYLE_ID = 'cat-theme-transition-style'
const ACTIVE_CLASS = 'theme-transitioning'

interface Origin {
  x: number
  y: number
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> }
}

let running = false

/** A soft-edged white circle as a mask image, so the reveal edge is blurred. */
function blurCircleMask(): string {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
    '<defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%">',
    '<feGaussianBlur stdDeviation="2"/></filter></defs>',
    '<circle cx="50" cy="50" r="42" fill="white" filter="url(#b)"/></svg>',
  ].join('')
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/** Inject the keyframes that grow the mask from 0 at the origin to full-bleed. */
function installStyle(o: Origin, radius: number): void {
  document.getElementById(STYLE_ID)?.remove()
  const mask = blurCircleMask()
  const size = radius * 2.5
  const fx = o.x - size / 2
  const fy = o.y - size / 2
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    ::view-transition-new(root){
      mask-image:${mask};-webkit-mask-image:${mask};
      mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;
      animation:cat-theme-reveal ${DURATION}ms ${EASING} both;
    }
    @keyframes cat-theme-reveal{
      from{mask-position:${o.x}px ${o.y}px;-webkit-mask-position:${o.x}px ${o.y}px;mask-size:0 0;-webkit-mask-size:0 0}
      to{mask-position:${fx}px ${fy}px;-webkit-mask-position:${fx}px ${fy}px;mask-size:${size}px ${size}px;-webkit-mask-size:${size}px ${size}px}
    }`
  document.head.appendChild(style)
}

function resolveOrigin(origin: Origin | null, el: HTMLElement | null): Origin {
  const rect = el?.getBoundingClientRect()
  const x = origin?.x ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2)
  const y = origin?.y ?? (rect ? rect.top + rect.height / 2 : window.innerHeight / 2)
  return {
    x: Math.min(Math.max(x, 0), window.innerWidth),
    y: Math.min(Math.max(y, 0), window.innerHeight),
  }
}

/**
 * Run `apply` (the theme flip) inside the circular reveal. Falls back to an
 * instant flip when the browser lacks View Transitions or the user prefers
 * reduced motion — the theme still changes either way.
 */
export async function runThemeTransition(
  origin: Origin | null,
  element: HTMLElement | null,
  apply: () => void,
): Promise<void> {
  const doc = document as ViewTransitionDocument
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!doc.startViewTransition || reduce) return apply()
  if (running) return

  const { x, y } = resolveOrigin(origin, element)
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  running = true
  document.documentElement.classList.add(ACTIVE_CLASS)
  installStyle({ x, y }, radius)
  try {
    await doc.startViewTransition(() => flushSync(apply)).finished
  } catch {
    apply()
  } finally {
    document.getElementById(STYLE_ID)?.remove()
    document.documentElement.classList.remove(ACTIVE_CLASS)
    running = false
  }
}

/**
 * Subtle warm gradient behind the agent chat: a very light peach wash with soft
 * orange/red light from the top and a faint bloom in the lower-right corner.
 * Full-height with no hard edge, kept gentle so content stays the focus.
 * Static (no motion); toned down further in dark mode.
 */
export function AgentBackdrop(): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-[#fffaf6] via-[var(--cat-canvas)] to-[#fff6f0] dark:from-[#120c0a] dark:via-[var(--cat-canvas)] dark:to-[#130d0a]" />
      <div className="absolute -top-[30%] left-1/2 h-[70vh] w-[85%] -translate-x-1/2 rounded-full bg-[#f97316]/12 blur-[130px] dark:bg-[#f97316]/7" />
      <div className="absolute -top-[15%] left-[12%] h-[45vh] w-[40%] rounded-full bg-[#e04a3d]/8 blur-[120px] dark:bg-[#e04a3d]/6" />
      <div className="absolute -right-[10%] -bottom-[20%] h-[60vh] w-[50%] rounded-full bg-[#fb923c]/10 blur-[130px] dark:bg-[#fb923c]/6" />
    </div>
  )
}

import { SignalorMark } from '@/components/SignalorMark'

const ROW_WORD = 'VISIBLE'
const ROWS = 5
const WORDS_PER_ROW = 4

/** Giant outlined words, alternating scroll direction, behind the lockup. */
function OutlinedRows(): JSX.Element {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-1 overflow-hidden"
      aria-hidden="true"
    >
      {Array.from({ length: ROWS }, (_, row) => (
        <p
          key={row}
          className={`cat-intro-rowtext text-[72px] leading-none font-bold tracking-tight whitespace-nowrap sm:text-[110px] ${row % 2 ? 'is-reverse' : ''}`}
        >
          {Array.from({ length: WORDS_PER_ROW }, () => ROW_WORD).join(' ')}
        </p>
      ))}
    </div>
  )
}

/** Scene 3 (3.7-5s): outlined rows scroll behind the closing lockup. */
export function IntroOutroScene({ brandName }: { brandName: string }): JSX.Element {
  return (
    <div className="cat-intro-scene3 absolute inset-0 grid place-items-center">
      <OutlinedRows />
      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="cat-intro-lockup flex items-center gap-3">
          <SignalorMark className="h-12 w-12 text-[#e04a3d]" />
          <span className="text-[36px] font-semibold tracking-tight text-[var(--cat-ink)] sm:text-[44px]">
            SignalorAI Agent
          </span>
        </div>
        <p className="cat-intro-tagline mt-3 text-[16px] text-[var(--cat-ink-2)]">
          Get {brandName} cited by AI. Every week, on its own.
        </p>
      </div>
    </div>
  )
}

import { Sparkles } from '@/lib/icons'

/** Same curve as `.cat-intro-spark`'s offset-path in app/globals.css, so the trail follows the sparkle. */
const SPARK_PATH = 'M 60 30 C 260 -30, 480 60, 610 150'
const WORDS: { text: string; delay: string; highlight?: boolean }[] = [
  { text: 'Meet', delay: '[animation-delay:0.30s]' },
  { text: 'your', delay: '[animation-delay:0.40s]' },
  { text: 'autonomous', delay: '[animation-delay:0.50s]' },
  { text: 'GEO', delay: '[animation-delay:0.62s]', highlight: true },
  { text: 'agent', delay: '[animation-delay:0.74s]' },
]

function Headline(): JSX.Element {
  return (
    <h1 className="absolute right-0 bottom-4 left-0 flex flex-wrap items-baseline justify-center gap-x-3 text-[30px] font-semibold tracking-tight whitespace-nowrap text-[var(--cat-ink)] sm:text-[52px]">
      {WORDS.map(word =>
        word.highlight ? (
          <span key={word.text} className={`cat-intro-word relative px-2 ${word.delay}`}>
            <span
              className="cat-intro-pill absolute inset-0 -z-10 rounded-lg bg-[#e04a3d]"
              aria-hidden="true"
            />
            <span className="text-white">{word.text}</span>
          </span>
        ) : (
          <span key={word.text} className={`cat-intro-word ${word.delay}`}>
            {word.text}
          </span>
        ),
      )}
    </h1>
  )
}

/** Scene 1 (0-1.7s): a sparkle arcs in on a light trail while the headline slides in word by word. */
export function IntroTypeScene(): JSX.Element {
  return (
    <div className="cat-intro-scene1 absolute inset-0 grid place-items-center">
      <div className="relative h-[220px] w-[min(920px,94vw)]">
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 920 220"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cat-intro-trail" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#e04a3d" stopOpacity="0" />
              <stop offset="1" stopColor="#e04a3d" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <path
            className="cat-intro-trail"
            d={SPARK_PATH}
            fill="none"
            stroke="url(#cat-intro-trail)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span className="cat-intro-spark absolute top-0 left-0 text-[#e04a3d] drop-shadow-[0_0_10px_rgba(224,74,61,.6)]">
          <Sparkles size={26} strokeWidth={1.8} />
        </span>
        <Headline />
      </div>
    </div>
  )
}

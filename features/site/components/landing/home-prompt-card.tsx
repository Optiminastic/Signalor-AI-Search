import Image from 'next/image'

import { ArrowRight, Check } from '@/features/site/components/icons'
import { cn } from '@/features/site/lib/utils'

// The dashboard's Prompt Tracker table, rebuilt for the marketing page. Fixed
// values, so it renders on the server.

/** Kept in sync with TAG_STYLES in the dashboard's PromptChips. */
const TAG_COLOR: Record<string, string> = {
  informational: '#2563EB',
  transactional: '#0891B2',
  brand: '#7C3AED',
  organic: '#C2410C',
  branded: '#A16207',
  competitive: '#BE123C',
}

const ENGINES = [
  { name: 'ChatGPT', src: '/logos/chatgpt.svg' },
  { name: 'Claude', src: '/logos/claude.svg' },
  { name: 'Gemini', src: '/logos/gemini.svg' },
  { name: 'Perplexity', src: '/logos/perplexity.svg' },
] as const

interface TrackedRow {
  prompt: string
  tags: readonly string[]
  visibility: number
  /** One boolean per engine in ENGINES: whether that engine cites the brand. */
  cited: readonly boolean[]
}

const ROWS: readonly TrackedRow[] = [
  {
    prompt: 'Best AI visibility tracking tools for agencies',
    tags: ['organic', 'informational'],
    visibility: 62,
    cited: [true, true, true, true],
  },
  {
    prompt: 'How do I get my brand cited by ChatGPT?',
    tags: ['organic', 'informational'],
    visibility: 48,
    cited: [true, false, false, true],
  },
  {
    prompt: 'Signalor vs Surfer SEO for GEO',
    tags: ['competitive', 'brand'],
    visibility: 0,
    cited: [false, false, false, false],
  },
]

function Tag({ value }: { value: string }): JSX.Element {
  const color = TAG_COLOR[value] ?? '#6B7280'
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[9px] font-semibold whitespace-nowrap capitalize"
      style={{ color, backgroundColor: `${color}14` }}
    >
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
      {value}
    </span>
  )
}

/** Slim segmented meter for a row's visibility number. */
function MiniTicks({ value }: { value: number }): JSX.Element {
  const filled = Math.round((value / 100) * 8)
  return (
    <span className="flex items-center gap-[2px]">
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          className={cn('h-3 w-[2px] rounded-[1px]', i < filled ? 'bg-primary' : 'bg-neutral-200')}
        />
      ))}
    </span>
  )
}

/** Per-engine citation dots: cited logos get a check, absent ones dim out. */
function EngineMarks({ cited }: { cited: readonly boolean[] }): JSX.Element {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {ENGINES.map((engine, i) => (
        <span key={engine.name} className="relative grid h-4 w-4 place-items-center">
          <Image
            src={engine.src}
            alt={engine.name}
            width={14}
            height={14}
            className={cn('h-3.5 w-3.5', !cited[i] && 'opacity-30 grayscale')}
          />
          {cited[i] ? (
            <span
              aria-hidden
              className="bg-success border-card absolute -right-0.5 -bottom-0.5 grid h-2.5 w-2.5 place-items-center rounded-full border"
            >
              <Check className="h-1.5 w-1.5 text-white" aria-hidden />
            </span>
          ) : null}
        </span>
      ))}
    </span>
  )
}

function PromptRow({ row }: { row: TrackedRow }): JSX.Element {
  const present = row.visibility > 0
  return (
    <li className="border-border/70 flex items-center gap-3 border-t px-4 py-3">
      <span className="flex w-10 shrink-0 flex-col items-start gap-1.5">
        <span
          className={cn(
            'text-[13px] font-semibold tabular-nums',
            present ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {row.visibility}%
        </span>
        <MiniTicks value={row.visibility} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[12px]">{row.prompt}</span>
        <span className="mt-1 flex items-center gap-1">
          {row.tags.map(tag => (
            <Tag key={tag} value={tag} />
          ))}
        </span>
      </span>
      <EngineMarks cited={row.cited} />
    </li>
  )
}

/** Light-mode build of the dashboard's Prompt Tracker list. */
export function HomePromptCard(): JSX.Element {
  return (
    <div className="bg-card ring-border w-full max-w-[520px] rounded-sm shadow-sm ring-1 shadow-black/5">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2.5">
        <div>
          <h4 className="text-foreground text-[14px] font-semibold">Prompt Tracker</h4>
          <p className="text-muted-foreground mt-0.5 text-[11.5px]">
            Watch how AI engines answer the prompts that matter to your category
          </p>
        </div>
        <span className="bg-primary shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white">
          50
        </span>
      </div>
      <div className="text-muted-foreground flex items-center gap-3 px-4 pb-2 text-[9.5px] font-semibold tracking-wide uppercase">
        <span className="w-10 shrink-0">Vis.</span>
        <span className="flex-1">Prompt</span>
        <span>Cited in</span>
      </div>
      <ul>
        {ROWS.map(row => (
          <PromptRow key={row.prompt} row={row} />
        ))}
      </ul>
      <p className="border-border text-muted-foreground flex items-center justify-between border-t px-4 py-2.5 text-[10.5px]">
        <span className="flex items-center gap-1.5">
          <span className="bg-success h-1.5 w-1.5 rounded-full" aria-hidden />
          Re-checked daily across 7 engines
        </span>
        <span className="text-primary inline-flex items-center gap-1 font-semibold">
          View all
          <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </p>
    </div>
  )
}

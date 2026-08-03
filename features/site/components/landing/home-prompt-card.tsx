import Image from 'next/image'

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
  '/logos/chatgpt.svg',
  '/logos/claude.svg',
  '/logos/gemini.svg',
  '/logos/perplexity.svg',
]

interface TrackedRow {
  prompt: string
  tags: readonly string[]
  visibility: number
  cited: boolean
}

const ROWS: readonly TrackedRow[] = [
  {
    prompt: 'Best AI visibility tracking tools for agencies',
    tags: ['organic', 'informational'],
    visibility: 62,
    cited: true,
  },
  {
    prompt: 'How do I get my brand cited by ChatGPT?',
    tags: ['organic', 'informational'],
    visibility: 48,
    cited: true,
  },
  {
    prompt: 'Signalor vs Surfer SEO for GEO',
    tags: ['competitive', 'brand'],
    visibility: 0,
    cited: false,
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

function PromptRow({ row }: { row: TrackedRow }): JSX.Element {
  return (
    <div className="border-border/70 flex items-center gap-3 border-t px-4 py-2.5">
      <span
        className={cn(
          'w-9 shrink-0 text-[13px] font-semibold tabular-nums',
          row.cited ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {row.visibility}%
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[12px]">{row.prompt}</span>
        <span className="mt-1 flex items-center gap-1">
          {row.tags.map(tag => (
            <Tag key={tag} value={tag} />
          ))}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {ENGINES.map(logo => (
          <Image
            key={logo}
            src={logo}
            alt=""
            width={13}
            height={13}
            className={cn('h-3.5 w-3.5', !row.cited && 'opacity-35 grayscale')}
          />
        ))}
      </span>
    </div>
  )
}

/** Light-mode build of the dashboard's Prompt Tracker list. */
export function HomePromptCard(): JSX.Element {
  return (
    <div className="bg-card ring-border w-full max-w-[520px] rounded-sm shadow-sm ring-1 shadow-black/5">
      <div className="px-4 pt-4 pb-2.5">
        <h4 className="text-foreground text-[14px] font-semibold">Prompt Tracker</h4>
        <p className="text-muted-foreground mt-0.5 text-[11.5px]">
          Watch how AI engines answer the prompts that matter to your category
        </p>
      </div>
      <div className="text-muted-foreground flex items-center gap-3 px-4 pb-2 text-[9.5px] font-semibold tracking-wide uppercase">
        <span className="w-9 shrink-0">Vis.</span>
        <span className="flex-1">Prompt</span>
        <span>Engines</span>
      </div>
      {ROWS.map(row => (
        <PromptRow key={row.prompt} row={row} />
      ))}
      {/* The tracker re-runs every prompt on a schedule; this is that state. */}
      <p className="border-border text-muted-foreground flex items-center gap-1.5 border-t px-4 py-2.5 text-[10.5px]">
        <span className="bg-success h-1.5 w-1.5 rounded-full" aria-hidden />
        Re-checked daily across 7 engines
      </p>
    </div>
  )
}

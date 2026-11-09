import type { LucideIcon } from '@/lib/icons'
import { CalendarDays, Eye, MessageSquare, Swords } from '@/lib/icons'

interface QuickStart {
  icon: LucideIcon
  title: string
  description: string
  prompt: string
}

/** Starters the agent can answer from its tools (positioning, plan, progress, activity). */
const QUICK_STARTS: QuickStart[] = [
  {
    icon: Eye,
    title: 'Why AI ignores us',
    description: 'Where ChatGPT, Gemini, Claude and Perplexity leave this brand out.',
    prompt: 'Why are AI engines not mentioning us?',
  },
  {
    icon: Swords,
    title: 'Who wins instead',
    description: 'The brands AI answers recommend, and the sites they cite.',
    prompt: 'Which competitors do AI answers recommend instead of us, and why?',
  },
  {
    icon: CalendarDays,
    title: "This month's plan",
    description: 'What the agent will publish and pitch, week by week.',
    prompt: 'What is the agent doing this month?',
  },
  {
    icon: MessageSquare,
    title: 'What it did',
    description: 'The latest pages, pitches and results, with outcomes.',
    prompt: 'What has the agent done recently, and did it work?',
  },
]

interface AgentQuickStartProps {
  onPick: (prompt: string) => void
  disabled: boolean
}

/** Quick-start cards under the composer; picking one sends its question. */
export function AgentQuickStart({ onPick, disabled }: AgentQuickStartProps): JSX.Element {
  return (
    <div className="w-full">
      <p className="mb-2 text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        Quick start
      </p>
      <div className="cat-stagger grid gap-2 sm:grid-cols-2">
        {QUICK_STARTS.map(({ icon: Icon, title, description, prompt }) => (
          <button
            key={title}
            type="button"
            disabled={disabled}
            onClick={() => onPick(prompt)}
            className="cat-card-edge flex items-start gap-3 rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3 text-left transition-colors hover:bg-[var(--cat-hover)] disabled:opacity-50"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#e04a3d]/10 text-[#e04a3d]">
              <Icon size={15} strokeWidth={1.9} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-[var(--cat-ink)]">{title}</span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-[var(--cat-ink-2)]">
                {description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

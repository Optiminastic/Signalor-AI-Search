import { ArrowRight, Check, Zap } from '@/features/site/components/icons'
import { cn } from '@/features/site/lib/utils'

// The dashboard's Actions table, rebuilt for the marketing page. Fixed values,
// so it renders on the server.

/** Kept in sync with SIGNAL_COLOR in the dashboard's SignalTag. */
const SIGNAL_COLOR: Record<string, string> = {
  Prompt: '#e04a3d',
  Schema: '#2563EB',
  'E-E-A-T': '#7C3AED',
  Technical: '#475569',
}

const PRIORITY_COLOR: Record<string, string> = {
  Critical: '#BE123C',
  High: '#C2410C',
  Medium: '#A16207',
}

interface Task {
  title: string
  /** What completing it improves — the dashboard's "Improves" column. */
  signal: string
  effect: string
  priority: string
  autoFix: boolean
}

const TASKS: readonly Task[] = [
  {
    title: 'Win the AI query: "best AI visibility tools"',
    signal: 'Prompt',
    effect: 'Targets a tracked prompt you are absent from',
    priority: 'High',
    autoFix: false,
  },
  {
    title: 'Add Organization JSON-LD',
    signal: 'Schema',
    effect: 'Helps engines parse what the page is about',
    priority: 'Critical',
    autoFix: true,
  },
  {
    title: 'Add author bylines to /blog',
    signal: 'E-E-A-T',
    effect: 'Builds the credibility engines look for',
    priority: 'Medium',
    autoFix: false,
  },
]

function SignalTag({ signal }: { signal: string }): JSX.Element {
  const color = SIGNAL_COLOR[signal] ?? '#6B7280'
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[9.5px] font-semibold whitespace-nowrap"
      style={{ color, backgroundColor: `${color}14` }}
    >
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
      {signal}
    </span>
  )
}

const PRIORITY_LEVEL: Record<string, number> = { Critical: 3, High: 2, Medium: 1 }

/** Slim segmented meter for a task's priority level. */
function PriorityTicks({ priority }: { priority: string }): JSX.Element {
  const level = PRIORITY_LEVEL[priority] ?? 1
  return (
    <span className="flex items-center gap-[2px]">
      {Array.from({ length: 3 }, (_, i) => (
        <span
          key={i}
          className={cn('h-3 w-[2px] rounded-[1px]', i < level ? 'bg-primary' : 'bg-neutral-200')}
        />
      ))}
    </span>
  )
}

/** Action toggle: auto-fix flips to "Shipped" when the row is hovered. */
function TaskAction({ autoFix }: { autoFix: boolean }): JSX.Element {
  return (
    <span className="relative inline-grid shrink-0 text-[10.5px] font-semibold">
      <span
        className={cn(
          'col-start-1 row-start-1 inline-flex items-center gap-1 rounded-sm px-2 py-1 transition-opacity duration-300 motion-safe:group-hover:opacity-0',
          autoFix ? 'bg-primary/10 text-primary' : 'ring-border text-muted-foreground ring-1',
        )}
      >
        {autoFix && <Zap className="h-3 w-3" aria-hidden />}
        {autoFix ? 'Auto fix' : 'Manual'}
      </span>
      {autoFix ? (
        <span className="bg-success/10 text-success col-start-1 row-start-1 inline-flex items-center gap-1 rounded-sm px-2 py-1 text-center opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100">
          <Check className="h-3 w-3" aria-hidden />
          Shipped
        </span>
      ) : null}
    </span>
  )
}

function TaskRow({ task }: { task: Task }): JSX.Element {
  return (
    <li className="border-border/70 flex items-center gap-3 border-t px-4 py-3">
      <span className="flex w-12 shrink-0 flex-col items-start gap-1.5">
        <span
          className="text-[10.5px] font-semibold"
          style={{ color: PRIORITY_COLOR[task.priority] ?? '#6B7280' }}
        >
          {task.priority}
        </span>
        <PriorityTicks priority={task.priority} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[12px] font-medium">{task.title}</span>
        <span className="text-muted-foreground mt-0.5 block truncate text-[10.5px]">
          {task.effect}
        </span>
      </span>
      <span className="hidden shrink-0 sm:block">
        <SignalTag signal={task.signal} />
      </span>
      <TaskAction autoFix={task.autoFix} />
    </li>
  )
}

/** Light-mode build of the dashboard's Actions list. */
export function HomeTaskCard(): JSX.Element {
  return (
    <div className="bg-card ring-border w-full max-w-[520px] rounded-sm shadow-sm ring-1 shadow-black/5">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2.5">
        <div>
          <h4 className="text-foreground text-[14px] font-semibold">Actions</h4>
          <p className="text-muted-foreground mt-0.5 text-[11.5px]">
            Today&apos;s ranked plan, highest impact first
          </p>
        </div>
        <span className="bg-primary shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white">
          11
        </span>
      </div>
      <div className="text-muted-foreground flex items-center gap-3 px-4 pb-2 text-[9.5px] font-semibold tracking-wide uppercase">
        <span className="w-12 shrink-0">Priority</span>
        <span className="flex-1">Task</span>
        <span className="hidden sm:block">Improves</span>
        <span className="w-[76px] shrink-0 text-right">Action</span>
      </div>
      <ul>
        {TASKS.map(task => (
          <TaskRow key={task.title} task={task} />
        ))}
      </ul>
      <p className="border-border text-muted-foreground flex items-center justify-between border-t px-4 py-2.5 text-[10.5px]">
        <span className="flex items-center gap-1.5">
          <span className="bg-primary h-1.5 w-1.5 rounded-full" aria-hidden />
          Highest impact first
        </span>
        <span className="text-primary inline-flex items-center gap-1 font-semibold">
          View all
          <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </p>
    </div>
  )
}

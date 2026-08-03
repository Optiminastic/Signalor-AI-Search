import { Zap } from '@/features/site/components/icons'
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

function TaskRow({ task }: { task: Task }): JSX.Element {
  return (
    <div className="border-border/70 flex items-center gap-3 border-t px-4 py-2.5">
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[12px] font-medium">{task.title}</span>
        <span className="text-muted-foreground mt-0.5 block truncate text-[10.5px]">
          {task.effect}
        </span>
      </span>
      <span className="hidden shrink-0 sm:block">
        <SignalTag signal={task.signal} />
      </span>
      <span
        className="w-12 shrink-0 text-[10.5px] font-semibold"
        style={{ color: PRIORITY_COLOR[task.priority] ?? '#6B7280' }}
      >
        {task.priority}
      </span>
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-[10.5px] font-semibold',
          task.autoFix ? 'bg-primary/10 text-primary' : 'text-muted-foreground ring-border ring-1',
        )}
      >
        {task.autoFix && <Zap className="h-3 w-3" aria-hidden />}
        {task.autoFix ? 'Auto fix' : 'Manual'}
      </span>
    </div>
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
        <span className="flex-1">Task</span>
        <span className="hidden sm:block">Improves</span>
        <span className="w-12">Priority</span>
        <span className="w-[62px]">Action</span>
      </div>
      {TASKS.map(task => (
        <TaskRow key={task.title} task={task} />
      ))}
    </div>
  )
}

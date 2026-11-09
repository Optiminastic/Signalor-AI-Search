import type { LucideIcon } from 'lucide-react'

import {
  Activity,
  CalendarDays,
  Check,
  Compass,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from '@/lib/icons'

export interface ActivityStep {
  label: string
  icon: LucideIcon
}

/** Human labels for the backend chat tools (apps/growth_agent/services/chat/tools.py). */
const TOOL_STEPS: Record<string, ActivityStep> = {
  get_positioning: { label: 'Checked where you stand in AI answers', icon: Compass },
  get_plan: { label: 'Read this month’s plan', icon: CalendarDays },
  get_progress: { label: 'Compared visibility with your baseline', icon: TrendingUp },
  get_activity: { label: 'Reviewed recent agent work', icon: Activity },
  search_brand_knowledge: { label: 'Searched your site content', icon: Search },
  skip_tasks: { label: 'Skipped tasks in the plan', icon: Zap },
  restore_tasks: { label: 'Restored tasks in the plan', icon: Zap },
  skip_channel: { label: 'Paused a channel', icon: Zap },
  restore_channel: { label: 'Restored a channel', icon: Zap },
  move_task: { label: 'Moved a task to another week', icon: CalendarDays },
  pause_program: { label: 'Paused autonomous work', icon: Zap },
  resume_program: { label: 'Resumed autonomous work', icon: Rocket },
  set_uplift_target: { label: 'Updated the monthly goal', icon: TrendingUp },
}

const FALLBACK_STEP: ActivityStep = { label: 'Used a tool', icon: Check }

/** Steps shown while a reply is being written (before the real trace exists). */
export const THINKING_STEPS: ActivityStep[] = [
  { label: 'Reading your brand data', icon: Search },
  { label: 'Checking AI answers and cited sites', icon: Compass },
  { label: 'Writing the answer', icon: Sparkles },
]

/** Maps a reply's tool trace to display steps, dropping repeats of the same tool. */
export function stepsForTools(tools: string[]): ActivityStep[] {
  return [...new Set(tools)].map(tool => TOOL_STEPS[tool] ?? FALLBACK_STEP)
}

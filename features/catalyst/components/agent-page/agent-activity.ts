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
  get_overview: { label: 'Checked everything the agent is running', icon: Activity },
  get_approvals: { label: 'Looked at drafts waiting for you', icon: Check },
  get_outreach: { label: 'Checked replies to outreach emails', icon: Activity },
  get_guest_posts: { label: 'Checked guest-post sites', icon: Compass },
  get_connections: { label: 'Checked your connected tools', icon: Zap },
  get_competitor_tracking: { label: 'Compared you with your competitors', icon: TrendingUp },
  get_keywords: { label: 'Checked your keywords and gaps', icon: Search },
  get_site_health: { label: 'Checked your site’s health', icon: Activity },
  check_ranks_now: { label: 'Started a positions check', icon: Search },
  refresh_keywords_now: { label: 'Started a keyword read', icon: Search },
  find_guest_sites: { label: 'Started a search for guest-post sites', icon: Search },
  check_social_now: { label: 'Started a social presence check', icon: TrendingUp },
  check_indexing_now: { label: 'Started a Google indexing check', icon: Search },
  get_positioning: { label: 'Checked where you stand in AI answers', icon: Compass },
  get_plan: { label: 'Read this month’s plan', icon: CalendarDays },
  get_progress: { label: 'Compared visibility with your baseline', icon: TrendingUp },
  get_activity: { label: 'Reviewed recent agent work', icon: Activity },
  get_indexing: { label: 'Checked which pages Google and Bing have indexed', icon: Search },
  get_social: { label: 'Checked your social presence score', icon: TrendingUp },
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

/**
 * Maps a reply's tool trace to display steps, dropping repeats. Repeats are
 * dropped by label, so several tools without a label yet show one fallback
 * step (labels are also the list keys in the activity feed).
 */
export function stepsForTools(tools: string[]): ActivityStep[] {
  const steps = tools.map(tool => TOOL_STEPS[tool] ?? FALLBACK_STEP)
  return steps.filter((step, i) => steps.findIndex(s => s.label === step.label) === i)
}

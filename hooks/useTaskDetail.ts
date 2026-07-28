'use client'

import { useQuery } from '@tanstack/react-query'

import { useActiveProject } from '@/hooks/useActiveProject'
import { useAgentPlan } from '@/hooks/useAgentPlan'
import type { AgentAction, AgentPlan } from '@/lib/api/agent'
import { getActions, getRunDetail, type Recommendation, type UserAction } from '@/lib/api/analyzer'

/** One numbered step of a task's detailed "how to do it" guide. */
export interface TaskStep {
  n: number
  title: string
  detail: string
}

export interface TaskDetail {
  id: number
  title: string
  description: string
  status: string
  priority: string
  /** Real measured GEO-score lift once the task is verified; null until then. */
  measuredLift: number | null
  effort: { difficulty: string; minutes: number }
  pillar: string
  group: string
  rank: number
  isTopFix: boolean
  assigneeEmail: string
  createdAt: string
  recommendationId: number | null
  /** Present when the task is part of today's plan — drives the start CTA. */
  planAction: AgentAction | null
  /** One-line fix summary from the source recommendation. */
  actionGuide: string
  /** Detailed, numbered "how to do it" steps (manual tasks + any finding with a
   *  step guide). Empty when the source recommendation carries no steps. */
  steps: TaskStep[]
  category: string
  canAutoFix: boolean
  /** Analyzer finding code (e.g. "no_jsonld") — keys the GitHub PR auto-fix. */
  findingCode: string
  /** ISO timestamp of the last successful live-site verification, or ''. */
  verifiedAt: string
  /** Result of the last verification re-crawl (why it did / didn't pass). */
  verificationMessage: string
}

function findPlanAction(plan: AgentPlan | undefined, id: number): AgentAction | null {
  if (!plan) return null
  const inGroups = plan.groups.flatMap(g => g.actions).find(a => a.action_id === id)
  if (inGroups) return inGroups
  return plan.top_fix?.action_id === id ? plan.top_fix : null
}

/** Same thresholds the Tasks board uses to bucket points into a priority. */
function priorityOfPoints(points: number | null | undefined): string {
  const p = points ?? 0
  if (p >= 8) return 'high'
  if (p >= 4) return 'medium'
  return 'low'
}

interface BuildDetailInput {
  id: number
  planAction: AgentAction | null
  raw: UserAction | undefined
  rec: Recommendation | undefined
}

function buildDetail({ id, planAction, raw, rec }: BuildDetailInput): TaskDetail | undefined {
  if (!planAction && !raw) return undefined
  return {
    id,
    title: planAction?.title || raw?.title || rec?.title || raw?.action_type || 'Untitled task',
    description: planAction?.description || raw?.description || rec?.description || '',
    status: planAction?.status || raw?.status || 'pending',
    priority: planAction?.priority || rec?.priority || priorityOfPoints(raw?.points_value),
    // Real measured lift only — null until the task is verified by re-analysis.
    measuredLift: planAction?.measured_lift ?? raw?.score_improvement ?? null,
    effort: planAction?.effort ?? {
      difficulty: rec?.difficulty ?? '',
      minutes: rec?.estimated_minutes ?? 0,
    },
    pillar: planAction?.pillar || rec?.pillar || '',
    group: planAction?.group ?? '',
    rank: planAction?.rank ?? 0,
    isTopFix: planAction?.is_top_fix ?? false,
    assigneeEmail: raw?.assignee_email ?? '',
    createdAt: raw?.created_at ?? '',
    recommendationId: planAction?.recommendation_id ?? raw?.recommendation ?? null,
    planAction,
    actionGuide: rec?.action ?? '',
    steps: (rec?.steps ?? []).map(s => ({ n: s.n, title: s.title, detail: s.detail })),
    category: rec?.category ?? '',
    canAutoFix: Boolean(rec?.can_auto_fix || rec?.code_fixable),
    findingCode: rec?.finding_code ?? '',
    verifiedAt: raw?.verified_at ?? '',
    verificationMessage: raw?.verification_message ?? '',
  }
}

interface UseTaskDetailResult {
  task: TaskDetail | undefined
  isLoading: boolean
  isError: boolean
  /** Loading settled but no task with this id exists for the user. */
  notFound: boolean
}

/**
 * One task by UserAction id, merged from every read model that knows about it:
 * today's agent plan (impact, effort, kind), the raw actions list (assignee,
 * created date) and the source recommendation (fix guide, impact estimate,
 * auto-fix flags). The recommendation loads in parallel and never blocks.
 */
export function useTaskDetail(taskId: number): UseTaskDetailResult {
  const { email, slug } = useActiveProject()
  const { plan, isLoading: planLoading } = useAgentPlan()

  const actionsQuery = useQuery({
    // Shares the ['catalyst', 'tasks'] prefix so task mutations invalidate it.
    queryKey: ['catalyst', 'tasks', 'raw', email ?? ''],
    enabled: Boolean(email),
    queryFn: () => getActions(email as string),
  })

  const recQuery = useQuery({
    queryKey: ['catalyst', 'task-recs', slug ?? ''],
    enabled: Boolean(slug),
    queryFn: () => getRunDetail(slug as string),
  })

  const isLoading = planLoading || actionsQuery.isLoading
  const planAction = findPlanAction(plan, taskId)
  const raw = actionsQuery.data?.find(a => a.id === taskId)
  const recId = planAction?.recommendation_id ?? raw?.recommendation ?? null
  const rec = recId ? recQuery.data?.recommendations.find(r => r.id === recId) : undefined
  const task = isLoading ? undefined : buildDetail({ id: taskId, planAction, raw, rec })

  return {
    task,
    isLoading,
    // The plan can 404 for brands without runs; the actions list is the base.
    isError: actionsQuery.isError,
    notFound: !isLoading && !actionsQuery.isError && !task,
  }
}

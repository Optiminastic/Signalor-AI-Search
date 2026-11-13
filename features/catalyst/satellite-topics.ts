import { AUTO_SITES, type SiteMeta } from '@/features/catalyst/backlinks-data'
import type { PlanTaskAction } from '@/lib/api/agent-mode-approvals'

/**
 * The month's satellite topic plan: articles the agent will write for the
 * client on signalor.ai's own sites, one every 3 days. Read from the plan's
 * tasks with the `satellite_article` tactic.
 */
export const SATELLITE_TACTIC = 'satellite_article'

export interface SatelliteTopic {
  taskId: number
  topic: string
  scheduledFor: string
  site: SiteMeta | null
  siteDomain: string
  skipped: boolean
  /** Only planned or skipped topics can still be changed by the owner. */
  editable: boolean
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function satelliteTopics(tasks: PlanTaskAction[]): SatelliteTopic[] {
  return tasks
    .filter(t => t.tactic === SATELLITE_TACTIC)
    .map(t => {
      const siteDomain = domainOf(t.targetUrl)
      return {
        taskId: t.taskId,
        topic: t.target || t.taskTitle,
        scheduledFor: t.scheduledFor,
        site: AUTO_SITES.find(s => s.domain === siteDomain) ?? null,
        siteDomain,
        skipped: t.taskStatus === 'skipped',
        editable: t.taskStatus === 'planned' || t.taskStatus === 'skipped',
      }
    })
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
}

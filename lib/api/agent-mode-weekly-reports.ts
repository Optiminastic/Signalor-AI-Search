import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * The agent's weekly reports (ranking-be `views_weekly_reports`): the saved
 * weekly reports (also emailed to the owner), plus this week so far, built live
 * from the same recorded facts. Report text uses "## " headings, **bold** and
 * "- " bullets, rendered by AgentRichText.
 */
const reportSchema = z
  .object({
    week_of: z.string(),
    content: z.string(),
    created_at: z.string(),
    emailed: z.boolean().catch(false),
  })
  .transform(r => ({
    weekOf: r.week_of,
    content: r.content,
    createdAt: r.created_at,
    emailed: r.emailed,
  }))

const listSchema = z
  .object({
    reports: z.array(reportSchema).catch([]),
    current: z.object({ week_of: z.string(), content: z.string() }),
    next_report_on: z.string(),
  })
  .transform(r => ({
    reports: r.reports,
    current: { weekOf: r.current.week_of, content: r.current.content },
    nextReportOn: r.next_report_on,
  }))

export type WeeklyReport = z.infer<typeof reportSchema>
export type WeeklyReports = z.infer<typeof listSchema>

export async function getWeeklyReports(orgSlug: string): Promise<WeeklyReports> {
  return agentModeRequest(programPath(orgSlug, 'weekly-reports'), listSchema)
}

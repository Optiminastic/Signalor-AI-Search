import { describe, expect, it } from 'vitest'

import { satelliteTopics } from '@/features/catalyst/satellite-topics'
import type { PlanTaskAction } from '@/lib/api/agent-mode-approvals'

function task(overrides: Partial<PlanTaskAction>): PlanTaskAction {
  return {
    taskId: 1,
    taskTitle: 'Article on betterversus.com: ahrefs vs semrush',
    taskStatus: 'planned',
    tactic: 'satellite_article',
    target: 'ahrefs vs semrush',
    targetUrl: 'https://betterversus.com',
    scheduledFor: '2026-11-19',
    action: null,
    failure: '',
    needsContact: null,
    ...overrides,
  }
}

describe('satelliteTopics', () => {
  it('keeps only satellite articles, in date order, with their site', () => {
    const topics = satelliteTopics([
      task({ taskId: 2, scheduledFor: '2026-11-22', targetUrl: 'https://thepickpost.com' }),
      task({ taskId: 3, tactic: 'answer_content' }),
      task({ taskId: 1 }),
    ])
    expect(topics.map(t => t.taskId)).toEqual([1, 2])
    expect(topics[0].site?.label).toBe('Comparison')
    expect(topics[1].siteDomain).toBe('thepickpost.com')
  })

  it('marks skipped topics and only lets not-yet-started ones change', () => {
    const [skipped, running] = satelliteTopics([
      task({ taskId: 1, taskStatus: 'skipped' }),
      task({ taskId: 2, taskStatus: 'awaiting_approval', scheduledFor: '2026-11-25' }),
    ])
    expect(skipped).toMatchObject({ skipped: true, editable: true })
    expect(running).toMatchObject({ skipped: false, editable: false })
  })
})

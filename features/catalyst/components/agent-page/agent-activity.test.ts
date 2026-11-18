import { describe, expect, it } from 'vitest'

import { stepsForTools } from '@/features/catalyst/components/agent-page/agent-activity'

describe('stepsForTools', () => {
  it('labels the indexing and social tools', () => {
    const labels = stepsForTools(['get_indexing', 'get_social']).map(s => s.label)
    expect(labels).toEqual([
      'Checked which pages Google and Bing have indexed',
      'Checked your social presence score',
    ])
  })

  it('labels every chat tool the backend offers', () => {
    const tools = [
      'get_overview',
      'get_approvals',
      'get_outreach',
      'get_guest_posts',
      'get_connections',
      'find_guest_sites',
      'check_social_now',
      'check_indexing_now',
    ]
    for (const step of stepsForTools(tools)) expect(step.label).not.toBe('Used a tool')
  })

  it('never returns two steps with the same label (they are list keys)', () => {
    const steps = stepsForTools(['get_plan', 'unknown_a', 'get_plan', 'unknown_b'])
    expect(steps.map(s => s.label)).toEqual(['Read this month’s plan', 'Used a tool'])
  })
})

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

  it('never returns two steps with the same label (they are list keys)', () => {
    const steps = stepsForTools(['get_plan', 'unknown_a', 'get_plan', 'unknown_b'])
    expect(steps.map(s => s.label)).toEqual(['Read this month’s plan', 'Used a tool'])
  })
})

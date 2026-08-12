import { describe, expect, it } from 'vitest'

import { isJobAwaitingExternalChange, latestJobForFinding, type GithubJob } from './github'

/**
 * A finding code does not identify an action. Ten "Win the AI query" actions all
 * carry `geo_prompt_lost` and differ only by which prompt they target, so
 * matching on the code alone showed one PR on every one of those rows.
 */
const CODE = 'geo_prompt_lost'

function job(over: Partial<GithubJob> & { id: number }): GithubJob {
  return {
    status: 'open',
    finding_codes: [CODE],
    recommendation_id: null,
    pr_number: 83,
    pr_url: '',
    files_changed: [],
    reasoning: '',
    error_message: '',
    score_before: null,
    score_after: null,
    created_at: '',
    updated_at: '',
    ...over,
  } as GithubJob
}

describe('latestJobForFinding', () => {
  it('returns the job raised for this action', () => {
    const jobs = [job({ id: 1, recommendation_id: 501 }), job({ id: 2, recommendation_id: 502 })]
    expect(latestJobForFinding(jobs, CODE, 502)?.id).toBe(2)
  })

  it("never returns another action's job", () => {
    // The incident, in one assertion: action 502 asking, only 501 has a PR.
    const jobs = [job({ id: 1, recommendation_id: 501 })]
    expect(latestJobForFinding(jobs, CODE, 502)).toBeNull()
  })

  it('falls back to an untargeted job so older PRs still show', () => {
    const jobs = [job({ id: 1, recommendation_id: null })]
    expect(latestJobForFinding(jobs, CODE, 502)?.id).toBe(1)
  })

  it('prefers its own job over an untargeted one', () => {
    const jobs = [job({ id: 1, recommendation_id: null }), job({ id: 2, recommendation_id: 502 })]
    expect(latestJobForFinding(jobs, CODE, 502)?.id).toBe(2)
  })

  it('takes the newest when an action has several', () => {
    const jobs = [job({ id: 5, recommendation_id: 501 }), job({ id: 9, recommendation_id: 501 })]
    expect(latestJobForFinding(jobs, CODE, 501)?.id).toBe(9)
  })

  it('ignores a different finding code entirely', () => {
    const jobs = [job({ id: 1, recommendation_id: 501, finding_codes: ['no_llms_txt'] })]
    expect(latestJobForFinding(jobs, CODE, 501)).toBeNull()
  })

  it('keeps the old code-only behaviour when no action is named', () => {
    const jobs = [job({ id: 1, recommendation_id: 501 })]
    expect(latestJobForFinding(jobs, CODE)?.id).toBe(1)
  })
})

describe('isJobAwaitingExternalChange', () => {
  it('keeps polling an open PR — a human may merge it at any time', () => {
    expect(isJobAwaitingExternalChange(job({ id: 1, status: 'open' }))).toBe(true)
  })

  it('keeps polling a closed PR, which can be reopened', () => {
    expect(isJobAwaitingExternalChange(job({ id: 1, status: 'closed' }))).toBe(true)
  })

  it('stops on merged — a merge cannot be undone', () => {
    expect(isJobAwaitingExternalChange(job({ id: 1, status: 'merged' }))).toBe(false)
  })

  it('stops on failed and declined, which never had a PR to move', () => {
    expect(isJobAwaitingExternalChange(job({ id: 1, status: 'failed' }))).toBe(false)
    expect(isJobAwaitingExternalChange(job({ id: 1, status: 'declined' }))).toBe(false)
  })
})

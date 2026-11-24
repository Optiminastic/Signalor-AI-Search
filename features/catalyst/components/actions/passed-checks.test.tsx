import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PassedChecks } from '@/features/catalyst/components/actions/PassedChecks'
import { getTechnicalChecks, type TechnicalChecksReport } from '@/lib/api/technical-checks'

const report: TechnicalChecksReport = {
  checkedAt: '2026-11-24T10:00:00Z',
  passed: 3,
  failed: 1,
  unknown: 1,
  checks: [
    {
      code: 'robots_ai_bots',
      label: 'AI crawlers allowed in robots.txt',
      status: 'failed',
      detail: 'robots.txt blocks GPTBot.',
      checkedAt: '2026-11-24T10:00:00Z',
    },
    {
      code: 'sitemap_found',
      label: 'Sitemap found',
      status: 'passed',
      detail: '12 URLs listed.',
      checkedAt: '2026-11-24T10:00:00Z',
    },
    {
      code: 'sitemap_broken_urls',
      label: 'No broken URLs in the sitemap',
      status: 'passed',
      detail: 'All 12 respond directly.',
      checkedAt: '2026-11-24T10:00:00Z',
    },
    {
      code: 'sitemap_redirects',
      label: 'No redirects in the sitemap',
      status: 'passed',
      detail: 'All 12 respond directly.',
      checkedAt: '2026-11-24T10:00:00Z',
    },
    {
      code: 'sitemap_fresh',
      label: 'Sitemap kept up to date',
      status: 'unknown',
      detail: 'No <lastmod> dates.',
      checkedAt: '2026-11-24T10:00:00Z',
    },
  ],
}

const hook = vi.hoisted(() => ({
  value: { report: undefined as unknown, isLoading: false, isError: false },
}))
vi.mock('@/hooks/useTechnicalChecks', () => ({ useTechnicalChecks: () => hook.value }))
const api = vi.hoisted(() => ({ apiGet: vi.fn() }))
vi.mock('@/lib/api/client', () => ({ apiGet: api.apiGet }))

afterEach(() => vi.clearAllMocks())

describe('PassedChecks', () => {
  it('lists passed checks, never the failed one', () => {
    hook.value = { report, isLoading: false, isError: false }
    const html = renderToStaticMarkup(<PassedChecks />)
    expect(html).toContain('3 of 5 checks passed')
    expect(html).toContain('1 failed and is in On-site actions')
    expect(html).toContain('Sitemap found')
    expect(html).not.toContain('robots.txt blocks GPTBot.')
  })

  it('shows checks that could not run separately', () => {
    hook.value = { report, isLoading: false, isError: false }
    const html = renderToStaticMarkup(<PassedChecks />)
    expect(html).toContain('Couldn’t check')
    expect(html).toContain('Sitemap kept up to date')
  })

  it('says when no checks have run yet', () => {
    hook.value = {
      report: { ...report, checks: [], passed: 0, failed: 0, unknown: 0 },
      isLoading: false,
      isError: false,
    }
    expect(renderToStaticMarkup(<PassedChecks />)).toContain('No technical checks yet')
  })
})

describe('getTechnicalChecks', () => {
  it('maps the API response to camelCase', async () => {
    api.apiGet.mockResolvedValue({
      checked_at: '2026-11-24T10:00:00Z',
      checks: [
        {
          code: 'sitemap_found',
          label: 'Sitemap found',
          status: 'passed',
          detail: 'ok',
          checked_at: '2026-11-24T10:00:00Z',
        },
      ],
      passed: 1,
      failed: 0,
      unknown: 0,
    })
    const result = await getTechnicalChecks('run-slug', 'Owner@Shop.example')
    expect(result.checks[0]?.checkedAt).toBe('2026-11-24T10:00:00Z')
    expect(result.passed).toBe(1)
    expect(api.apiGet).toHaveBeenCalledWith('/api/analyzer/runs/s/run-slug/technical-checks/', {
      params: { email: 'owner@shop.example' },
    })
  })
})

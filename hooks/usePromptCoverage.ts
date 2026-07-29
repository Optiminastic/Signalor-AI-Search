'use client'

import { useMutation, useQuery } from '@tanstack/react-query'

import {
  draftAnswerBlock,
  getPromptCoverage,
  type AnswerBlock,
  type CoverageStatus,
  type PromptCoverage,
} from '@/lib/api/prompts'

/** Worst-first, so the work queue reads top-down. */
const SEVERITY: Record<CoverageStatus, number> = {
  uncovered: 0,
  weak: 1,
  covered: 2,
  unknown: 3,
}

export interface PromptCoverageData {
  raw: PromptCoverage
  /** Rows sorted worst-first. */
  rows: PromptCoverage['rows']
  /** True when nothing could be measured — the site is not indexed yet. */
  unmeasured: boolean
  /**
   * Pages carrying more than one prompt. A page answering many distinct
   * questions is the "one page per intent" problem, and it is a stronger signal
   * than any individual coverage score.
   */
  concentration: { url: string; prompts: number }[]
}

function adapt(raw: PromptCoverage): PromptCoverageData {
  const rows = [...raw.rows].sort(
    (a, b) => SEVERITY[a.status] - SEVERITY[b.status] || b.best_score - a.best_score,
  )

  const byUrl = new Map<string, number>()
  for (const row of raw.rows) {
    if (row.best_url) byUrl.set(row.best_url, (byUrl.get(row.best_url) ?? 0) + 1)
  }
  const concentration = [...byUrl.entries()]
    .filter(([, n]) => n > 1)
    .map(([url, prompts]) => ({ url, prompts }))
    .sort((a, b) => b.prompts - a.prompts)

  return {
    raw,
    rows,
    unmeasured: raw.summary.coverage_pct === null,
    concentration,
  }
}

interface UsePromptCoverageResult {
  data: PromptCoverageData | undefined
  isLoading: boolean
  isError: boolean
}

/** Which tracked prompts the site actually answers. */
export function usePromptCoverage(slug: string | undefined): UsePromptCoverageResult {
  const query = useQuery({
    queryKey: ['catalyst', 'prompt-coverage', slug ?? ''],
    enabled: Boolean(slug),
    queryFn: async (): Promise<PromptCoverageData> =>
      adapt(await getPromptCoverage(slug as string)),
  })
  return { data: query.data, isLoading: query.isLoading, isError: query.isError }
}

interface UseAnswerBlockResult {
  draft: AnswerBlock | undefined
  generate: (trackId: number) => void
  isGenerating: boolean
  isError: boolean
  reset: () => void
}

/**
 * Draft the answer block for one prompt, on demand.
 *
 * A mutation rather than a query: it is generative and billed per call, so it
 * must never fire on render.
 */
export function useAnswerBlock(slug: string | undefined): UseAnswerBlockResult {
  const mutation = useMutation({
    mutationFn: async (trackId: number): Promise<AnswerBlock> =>
      draftAnswerBlock(slug as string, trackId),
  })
  return {
    draft: mutation.data,
    generate: (trackId: number) => {
      if (slug) mutation.mutate(trackId)
    },
    isGenerating: mutation.isPending,
    isError: mutation.isError,
    reset: mutation.reset,
  }
}

'use client'

import { useMemo } from 'react'

import { buildBrandTerms, type HighlightTerm } from '@/features/catalyst/brand-terms'
import type { Citation } from '@/features/catalyst/prompt-tracker-data'
import { useActiveProject } from '@/hooks/useActiveProject'

/**
 * Terms to highlight in an engine answer: the active brand's name and domain,
 * plus any citation the backend already flagged as the brand's own.
 */
export function useBrandTerms(citations: Citation[] = []): HighlightTerm[] {
  const { activeOrg } = useActiveProject()
  const name = activeOrg?.name
  const url = activeOrg?.url
  // The citations array is rebuilt on every render, so memoise on its content
  // rather than its identity — only brand-flagged domains affect the result.
  const brandDomains = citations
    .filter(c => c.isBrand)
    .map(c => c.domain)
    .join('|')

  return useMemo(
    () => buildBrandTerms({ name, url }, brandDomains ? brandDomains.split('|') : []),
    [name, url, brandDomains],
  )
}

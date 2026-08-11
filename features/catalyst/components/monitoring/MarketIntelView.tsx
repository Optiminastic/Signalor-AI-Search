'use client'

import { CompetitorIntel } from '@/features/catalyst/components/agent/CompetitorIntel'
import { AnswerEngineInsights } from '@/features/catalyst/components/agent/insights/AnswerEngineInsights'

/**
 * Answer-engine and competitor evidence.
 *
 * Lived beside the plan as a third tab on Actions, where it was the odd one
 * out: the other two tabs were work you could start, this is evidence you can
 * only read. It sits under Signals now, next to the other measurements it is
 * made of.
 */
export function MarketIntelView(): JSX.Element {
  return (
    <div className="cat-stagger flex flex-col gap-4">
      <AnswerEngineInsights />
      <CompetitorIntel />
    </div>
  )
}

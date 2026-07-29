'use client'

import { DataState } from '@/features/catalyst/components/DataState'
import { EntityResolutionCard } from '@/features/catalyst/components/prompts/EntityResolutionCard'
import { PromptCoverageCard } from '@/features/catalyst/components/prompts/PromptCoverageCard'
import { MentionsCard } from '@/features/catalyst/components/visibility/MentionsCard'
import { OverallVisibilityCard } from '@/features/catalyst/components/visibility/OverallVisibilityCard'
import { PlatformScoreCard } from '@/features/catalyst/components/visibility/PlatformScoreCard'
import { ShareOfVoiceCard } from '@/features/catalyst/components/visibility/ShareOfVoiceCard'
import { VisibilityHeader } from '@/features/catalyst/components/visibility/VisibilityHeader'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useVisibility } from '@/hooks/useVisibility'

export function VisibilityView(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = useVisibility(slug)

  return (
    <>
      <VisibilityHeader />
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-0.5">
        <DataState
          isLoading={projectLoading || isLoading}
          isError={isError}
          isEmpty={!slug || !data}
          emptyTitle="No visibility data yet"
          emptyHint="Select a project with a completed analysis to see AI visibility across engines."
        >
          {data && (
            <div className="cat-stagger grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <OverallVisibilityCard data={data.overall} />
              <ShareOfVoiceCard sov={data.sov} meta={data.sovMeta} />
              <MentionsCard data={data.mentions} />
              {data.platforms.map(platform => (
                <PlatformScoreCard key={platform.key} platform={platform} />
              ))}
              {/* Whether the site answers each tracked prompt at all — the
                  question that precedes every other visibility metric here. */}
              <PromptCoverageCard slug={slug} />
              {/* Whether engines resolve the name at all — a zero here explains
                  a zero everywhere else. */}
              <EntityResolutionCard slug={slug} />
            </div>
          )}
        </DataState>
      </div>
    </>
  )
}

import { RedditHeader } from '@/features/catalyst/components/socials/RedditHeader'
import { TodayTaskCard } from '@/features/catalyst/components/socials/TodayTaskCard'
import { WarmupStats } from '@/features/catalyst/components/socials/WarmupStats'
import { WarmupTimeline } from '@/features/catalyst/components/socials/WarmupTimeline'

export function RedditRoadmapView(): JSX.Element {
  return (
    <>
      <RedditHeader />
      <div className="-mx-3 mt-3 min-h-0 flex-1 overflow-y-auto px-3">
        <div className="cat-stagger flex flex-col gap-2">
          <TodayTaskCard />
          <WarmupStats />
          <WarmupTimeline />
        </div>
      </div>
    </>
  )
}

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import type { SocialPlatform } from '@/lib/api/agent-mode-social'

interface PlatformRowProps {
  label: string
  platform: SocialPlatform
}

const PART_LABELS: Record<string, string> = {
  presence: 'Presence',
  audience: 'Audience',
  activity: 'Activity',
  engagement: 'Engagement',
  mentions: 'Mentions',
  communities: 'Communities',
}
const PART_MAX: Record<string, number> = {
  presence: 20,
  audience: 30,
  activity: 30,
  engagement: 20,
  mentions: 60,
  communities: 40,
}
const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'

function partsText(platform: SocialPlatform): string {
  const measured = Object.entries(platform.parts).map(
    ([part, points]) => `${PART_LABELS[part] ?? part} ${points}/${PART_MAX[part] ?? '?'}`,
  )
  const missing = platform.notMeasured.map(part => `${PART_LABELS[part] ?? part} not measured`)
  return [...measured, ...missing].join(' · ')
}

function ProfileLink({ platform }: { platform: SocialPlatform }): JSX.Element {
  if (!platform.url) return <span className={MUTED}>No profile found</span>
  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      className="truncate text-[11.5px] text-[var(--cat-ink-2)] underline-offset-2 hover:underline"
    >
      {platform.url.replace(/^https?:\/\/(www\.)?/, '')}
    </a>
  )
}

/** One platform: its score as a tick meter and what the score is made of. */
export function PlatformRow({ label, platform }: PlatformRowProps): JSX.Element {
  return (
    <li className="flex flex-col gap-1 rounded-lg border border-[var(--cat-border)] px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-[var(--cat-ink)]">{label}</span>
        <TickBar value={Math.round(platform.score)} ticks={16} />
      </div>
      {label !== 'Reddit' && <ProfileLink platform={platform} />}
      <span className={MUTED}>{partsText(platform)}</span>
    </li>
  )
}

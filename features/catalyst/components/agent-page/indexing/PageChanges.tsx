import { SECTION_TITLE } from '@/features/catalyst/components/agent-page/approvals/approval-styles'

interface PageChangesProps {
  newlyIndexed: string[]
  dropped: string[]
}

interface ChangeListProps {
  title: string
  urls: string[]
  tone: string
}

function ChangeList({ title, urls, tone }: ChangeListProps): JSX.Element | null {
  if (urls.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <h3 className={SECTION_TITLE}>{title}</h3>
      <ul className={`text-[12px] ${tone}`}>
        {urls.map(url => (
          <li key={url} className="truncate">
            {url}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** What changed since last week's check: pages that got on Google, and ones that fell off. */
export function PageChanges({ newlyIndexed, dropped }: PageChangesProps): JSX.Element | null {
  if (newlyIndexed.length === 0 && dropped.length === 0) return null
  return (
    <section className="flex flex-col gap-3">
      <ChangeList title="Newly on Google" urls={newlyIndexed} tone="text-emerald-700" />
      <ChangeList title="Dropped off Google" urls={dropped} tone="text-[#e04a3d]" />
    </section>
  )
}

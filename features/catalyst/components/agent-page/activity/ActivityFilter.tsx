import { ACTIVITY_CATEGORIES, type ActivityCategory } from '@/lib/api/agent-mode-activity'

interface ActivityFilterProps {
  value: ActivityCategory
  onChange: (category: ActivityCategory) => void
}

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  all: 'All',
  articles: 'Articles',
  guest: 'Guest posts',
  keywords: 'Keywords',
  social: 'Social',
  site: 'Your site',
  outreach: 'Outreach',
}

const CHIP =
  'h-7 shrink-0 rounded-md px-2.5 text-[12px] font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[#e04a3d] focus-visible:outline-none'
const CHIP_ON = `${CHIP} bg-[#e04a3d]/10 text-primary-ink`
const CHIP_OFF = `${CHIP} text-[var(--cat-ink-2)] hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]`

/** Narrows the log to one kind of work. Scrolls sideways on narrow boards. */
export function ActivityFilter({ value, onChange }: ActivityFilterProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label="Show activity for"
      className="-mx-1 flex gap-0.5 overflow-x-auto px-1 pb-1"
    >
      {ACTIVITY_CATEGORIES.map(category => (
        <button
          key={category}
          type="button"
          aria-pressed={category === value}
          onClick={() => onChange(category)}
          className={category === value ? CHIP_ON : CHIP_OFF}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  )
}

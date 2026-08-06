import Image from 'next/image'

import { ArrowRight, Check, Code2, Zap } from '@/features/site/components/icons'

// The dashboard's Auto-fix surface, rebuilt for the marketing page. Fixed
// values, so it renders on the server. Mirrors the sibling platform cards'
// structure: a header with the brand pill, hairline-divided rows, and a
// "Manage" footer.

interface FixRow {
  title: string
  meta: string
  /** How this recommendation gets applied: one-click, a PR, or already done. */
  route: 'auto' | 'pr' | 'applied'
}

const ROWS: readonly FixRow[] = [
  { title: 'Add Organization JSON-LD', meta: 'Sitewide · Schema · ~2h', route: 'auto' },
  { title: 'Add Product schema', meta: '/products/aura-pro · Schema', route: 'auto' },
  { title: 'Rewrite title tag', meta: '/pricing · Meta · ~45m', route: 'pr' },
  { title: 'Add FAQ block', meta: '/docs/getting-started · Content', route: 'applied' },
]

/** The right-hand affordance per recommendation: auto-fix / PR / applied. */
function RouteBadge({ route }: { route: FixRow['route'] }): JSX.Element {
  if (route === 'applied') {
    return (
      <span className="bg-success/10 text-success inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-[10.5px] font-semibold">
        <Check className="h-3 w-3" aria-hidden />
        Applied
      </span>
    )
  }
  if (route === 'pr') {
    return (
      <span className="ring-border text-muted-foreground inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-[10.5px] font-semibold ring-1">
        <Code2 className="h-3 w-3" aria-hidden />
        PR #14
      </span>
    )
  }
  return (
    <span className="bg-primary/10 text-primary inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-[10.5px] font-semibold">
      <Zap className="h-3 w-3" aria-hidden />
      Auto fix
    </span>
  )
}

function FixRowView({ row }: { row: FixRow }): JSX.Element {
  return (
    <li className="border-border/70 flex items-center gap-3 border-t px-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[12px] font-medium">{row.title}</span>
        <span className="text-muted-foreground mt-0.5 block truncate text-[10.5px]">
          {row.meta}
        </span>
      </span>
      <RouteBadge route={row.route} />
    </li>
  )
}

/** Connector bar: connected themes + the auto-apply switch, on by default. */
function ChannelBar(): JSX.Element {
  return (
    <div className="border-border/70 flex items-center gap-3 border-t px-4 py-3">
      <span className="flex shrink-0 items-center gap-1.5">
        <Image src="/logos/shopify.svg" alt="Shopify" width={16} height={16} className="size-4" />
        <Image
          src="/logos/wordpress.svg"
          alt="WordPress"
          width={16}
          height={16}
          className="size-4"
        />
      </span>
      <span className="text-foreground min-w-0 flex-1 text-[11.5px] font-medium">
        Auto-apply schema &amp; meta to connected themes
      </span>
      <span
        aria-hidden
        className="bg-primary relative inline-flex h-5 w-9 shrink-0 items-center rounded-full"
      >
        <span className="absolute right-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
      </span>
    </div>
  )
}

/** Light-mode build of the dashboard's Auto-fix panel. */
export function HomeAutofixCard(): JSX.Element {
  return (
    <div className="bg-card ring-border w-full max-w-[520px] rounded-sm shadow-sm ring-1 shadow-black/5">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2.5">
        <div>
          <h4 className="text-foreground text-[14px] font-semibold">Auto-fix</h4>
          <p className="text-muted-foreground mt-0.5 text-[11.5px]">
            Apply ranked fixes in one click, or review them as a PR
          </p>
        </div>
        <span className="bg-primary shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white">
          12
        </span>
      </div>
      <ChannelBar />
      <ul>
        {ROWS.map(row => (
          <FixRowView key={row.title} row={row} />
        ))}
      </ul>
      <p className="border-border text-muted-foreground flex items-center justify-between border-t px-4 py-2.5 text-[10.5px]">
        <span>Ship to themes, or open a PR. No engineer needed.</span>
        <span className="text-primary inline-flex items-center gap-1 font-semibold">
          Manage
          <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </p>
    </div>
  )
}

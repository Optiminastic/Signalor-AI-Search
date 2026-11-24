import type { TablerIcon } from '@tabler/icons-react'
import Link from 'next/link'

import { FeaturedGraph } from '@/features/landing/components/FeaturedGraph'
import {
  PRICING_SECTION,
  PRODUCT_FEATURES,
  PRODUCT_MORE,
  RESOURCE_MAIN,
  RESOURCE_PRODUCT,
  RESOURCE_SUPPORT,
  type MenuLink,
  type MenuSection,
  type QuickLink,
} from '@/features/landing/nav-data'

function SectionLabel({ children }: { children: string }): JSX.Element {
  return (
    <div className="px-2 pt-1 pb-1 text-[11px] font-medium tracking-[0.1em] uppercase">
      {children}
    </div>
  )
}

function IconTile({ icon: Icon }: { icon: TablerIcon }): JSX.Element {
  return (
    <span className="ring-foreground/10 grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-white shadow ring-1">
      <Icon size={18} stroke={1.75} className="text-primary-ink" />
    </span>
  )
}

function ItemRow({ link }: { link: MenuLink }): JSX.Element {
  return (
    <Link
      href={link.href}
      className="flex items-center gap-3 rounded-lg p-2 transition-colors duration-150 hover:bg-black/3"
    >
      <IconTile icon={link.icon} />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="text-[14px] font-medium text-[#171717]">{link.label}</span>
          {link.badge && (
            <span className="rounded-full bg-[#e9f9ef] px-1.5 py-px text-[10px] font-semibold text-[#12a150]">
              {link.badge}
            </span>
          )}
        </span>
        <span className="block truncate text-[11px] text-[#71717a]">{link.desc}</span>
      </span>
    </Link>
  )
}

function SectionCard({
  section,
  className = '',
}: {
  section: MenuSection
  className?: string
}): JSX.Element {
  return (
    <div className={`ring-foreground/10 rounded-xl bg-white p-2 shadow ring-1 ${className}`}>
      <SectionLabel>{section.title}</SectionLabel>
      <div className={section.cols === 2 ? 'grid grid-cols-2 gap-x-1' : 'grid'}>
        {section.links.map(l => (
          <ItemRow key={l.label} link={l} />
        ))}
      </div>
    </div>
  )
}

function QuickList({ title, links }: { title: string; links: QuickLink[] }): JSX.Element {
  return (
    <div className="w-42 shrink-0 p-2">
      <SectionLabel>{title}</SectionLabel>
      {links.map(l => (
        <Link
          key={l.label}
          href={l.href}
          className="flex items-center gap-2.5 rounded-lg p-2 text-[14px] font-medium text-[#171717] transition-colors duration-150 hover:bg-black/3"
        >
          <l.icon size={16} stroke={1.75} className="text-[#52525b]" />
          {l.label}
        </Link>
      ))}
    </div>
  )
}

function FeaturedCard(): JSX.Element {
  return (
    <Link
      href="/api"
      className="flex w-74 shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-black/6 bg-gradient-to-b from-[#fdf1ef] to-[#f7f7f8] transition-colors duration-150 hover:border-black/12"
    >
      <div className="flex h-34 items-start justify-center overflow-hidden pt-2">
        <div className="origin-top scale-[0.72]">
          <FeaturedGraph />
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="text-[14px] font-medium text-[#171717]">API &amp; MCP</p>
        <p className="mt-0.5 truncate text-[13px] text-[#71717a]">
          Plug your AI stack into SignalorAI data
        </p>
      </div>
    </Link>
  )
}

export function ProductPanel(): JSX.Element {
  return (
    <div className="flex w-220 gap-1 bg-[#FAFAFA] p-1">
      <SectionCard section={PRODUCT_FEATURES} className="flex-1" />
      <SectionCard section={PRODUCT_MORE} className="flex-1" />
      <FeaturedCard />
    </div>
  )
}

export function ResourcesPanel(): JSX.Element {
  return (
    <div className="flex w-230 gap-1 bg-[#FAFAFA] p-1">
      <SectionCard section={RESOURCE_MAIN} className="flex-1" />
      <SectionCard section={RESOURCE_PRODUCT} className="w-56 shrink-0" />
      <QuickList title={RESOURCE_SUPPORT.title} links={RESOURCE_SUPPORT.links} />
    </div>
  )
}

export function PricingPanel(): JSX.Element {
  return (
    <div className="w-78 bg-[#FAFAFA] p-1">
      <SectionCard section={PRICING_SECTION} />
    </div>
  )
}

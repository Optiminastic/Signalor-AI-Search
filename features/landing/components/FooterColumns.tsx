import Link from 'next/link'

import { SignalorMark } from '@/components/SignalorMark'
import { FOOTER_COLUMNS, SOCIAL } from '@/features/landing/footer-data'
import type { FooterColumn, FooterLink } from '@/features/landing/footer-data'
import { ExternalLink } from '@/lib/icons'

const LINK_CLS =
  'inline-flex items-center gap-1 text-[14px] text-[#6b6b6b] transition-colors hover:text-[#171717]'

function FooterLinkRow({ href, label, external }: FooterLink): JSX.Element {
  if (external || href.startsWith('mailto:')) {
    return (
      <a href={href} className={LINK_CLS} target="_blank" rel="noreferrer">
        {label}
        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
      </a>
    )
  }
  return (
    <Link href={href} className={LINK_CLS}>
      {label}
    </Link>
  )
}

function BrandPanel(): JSX.Element {
  return (
    <div className="min-w-0 border-b border-black/[0.06] bg-[#f7f7f6] px-6 py-10 sm:px-8 lg:w-[340px] lg:shrink-0 lg:border-r lg:border-b-0 lg:px-10 lg:py-14">
      <Link href="/" className="flex items-center gap-2">
        <SignalorMark className="text-primary-ink h-7 w-7" />
        <span className="text-[18px] font-semibold tracking-tight text-[#171717]">SignalorAI</span>
      </Link>
      <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-[#6b6b6b]">
        The AI visibility platform to monitor, score, and grow how generative search cites your
        brand.
      </p>
      <ul className="mt-6 flex flex-wrap items-center gap-2">
        {SOCIAL.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-black/[0.08] bg-white text-[#6b6b6b] transition-colors hover:border-black/15 hover:bg-[#f0f0ef] hover:text-[#171717]"
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LinkColumn({ col }: { col: FooterColumn }): JSX.Element {
  return (
    <div className="min-w-0 px-6 py-8 sm:px-8 lg:px-8 lg:py-14">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#171717] uppercase">
        {col.title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {col.links.map(item => (
          <li key={item.label}>
            <FooterLinkRow {...item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FooterColumns(): JSX.Element {
  return (
    <div className="border-t border-black/[0.06]">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <BrandPanel />
        <div className="grid flex-1 grid-cols-2 divide-x divide-y divide-black/[0.06] bg-[#f7f7f6] lg:grid-cols-4 lg:divide-y-0">
          {FOOTER_COLUMNS.map(col => (
            <LinkColumn key={col.title} col={col} />
          ))}
        </div>
      </div>
    </div>
  )
}

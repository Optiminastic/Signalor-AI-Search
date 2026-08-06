import Link from 'next/link'

import { ExternalLink, Github, Linkedin, Twitter } from '@/features/site/components/icons'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { HomeFooterRecentPosts } from '@/features/site/components/landing/home-footer-recent-posts'
import LogoComp from '@/features/site/components/LogoComp'
import { MailLink } from '@/features/site/components/mail-link'

type FooterLink = {
  href: string
  label: string
  external?: boolean
  /** Renders as a MailLink to this user instead of a route link. */
  mailUser?: string
  mailSubject?: string
}

type FooterColumn = {
  title: string
  links: FooterLink[]
  withRecentPosts?: boolean
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Platform',
    links: [
      { href: '/sign-up', label: 'Get started' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/integration', label: 'Integrations' },
      { href: '/prompt-tracking', label: 'Prompt tracking' },
      { href: '/ai-visibility', label: 'AI visibility' },
      { href: '/recommendations', label: 'Recommendations' },
      { href: '/creators-program', label: 'Creators program' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { href: '/solutions/competitive-lens', label: 'Agencies' },
      { href: '/solutions/visibility', label: 'Brands' },
      { href: '/solutions/fix-playbook', label: 'SEO & growth teams' },
      {
        href: '#contact-sales',
        label: 'Contact sales',
        external: true,
        mailUser: 'hello',
        mailSubject: 'Sales inquiry',
      },
    ],
  },
  {
    title: 'Free tools',
    links: [
      { href: '/tools', label: 'All free tools' },
      { href: '/tools/url-analyzer', label: 'URL analyzer' },
      { href: '/tools/llms-check', label: 'LLM checker' },
      { href: '/tools/competitors-analysis', label: 'Competitors analysis' },
      { href: '/tools/schema-validator', label: 'Schema validator' },
      { href: '/tools/domain-rating', label: 'Domain rating' },
    ],
  },
  {
    title: 'Resources',
    links: [{ href: '/blog', label: 'Blog' }],
    withRecentPosts: true,
  },
]

const SOCIAL_LINKS = [
  { href: 'https://x.com/SignalorAI', label: 'X (Twitter)', icon: Twitter },
  { href: 'https://www.linkedin.com/in/signalorai/', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://github.com/signalorai', label: 'GitHub', icon: Github },
] as const

const LEGAL_LINKS = [
  { href: '/policy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms of service' },
  { href: '/about-us', label: 'About' },
] as const

function FooterLinkRow({ href, label, external, mailUser, mailSubject }: FooterLink): JSX.Element {
  const className =
    'inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
  if (mailUser) {
    return (
      <MailLink
        user={mailUser}
        subject={mailSubject}
        className={className}
        target="_blank"
        rel="noreferrer"
      >
        {label}
        {external ? <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden /> : null}
      </MailLink>
    )
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}

function FooterBrandCell(): JSX.Element {
  return (
    <div className="px-6 py-10 sm:px-8 lg:py-12">
      <Link href="/" className="inline-block">
        <LogoComp compact size={30} />
      </Link>
      <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed">
        The AI visibility platform to monitor, score, and grow how generative search cites your
        brand.
      </p>
      <ul className="mt-6 flex items-center gap-2">
        {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="bg-card text-muted-foreground ring-border hover:text-foreground hover:ring-foreground/20 flex h-8 w-8 items-center justify-center rounded-md shadow-sm ring-1 shadow-black/5 transition-colors"
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterLegalBar(): JSX.Element {
  return (
    <div className="border-border relative border-t">
      <GridCornerHandles top />
      <div className="flex flex-col gap-4 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <nav
          aria-label="Legal"
          className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium"
        >
          {LEGAL_LINKS.map((link, index) => (
            <span key={link.href} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden>·</span> : null}
              <Link href={link.href} className="hover:text-foreground transition-colors">
                {link.label}
              </Link>
            </span>
          ))}
          <span aria-hidden>·</span>
          <MailLink user="hello" className="hover:text-foreground transition-colors">
            Contact us
          </MailLink>
          <span aria-hidden>·</span>
          <MailLink
            user="hello"
            subject="Press inquiry"
            className="hover:text-foreground transition-colors"
          >
            Press
          </MailLink>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://status.signalor.ai/"
            target="_blank"
            rel="noreferrer"
            className="bg-card text-foreground ring-border hover:ring-foreground/20 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm ring-1 shadow-black/5 transition-colors"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                aria-hidden
                className="bg-success/50 absolute inline-flex h-full w-full rounded-full [animation-duration:2.5s] motion-safe:animate-ping"
              />
              <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
            </span>
            All systems online
          </a>
          <p className="text-muted-foreground text-[12px]">
            © {new Date().getFullYear()} SignalorAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export function HomeFooter(): JSX.Element {
  return (
    <footer className="border-border border-t">
      <div className="border-border max-w-8xl relative mx-auto border-x">
        <GridCornerHandles top />
        <div className="lg:divide-border grid lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:divide-x">
          <FooterBrandCell />
          {FOOTER_COLUMNS.map(column => (
            <div
              key={column.title}
              className="max-lg:border-border relative px-6 py-10 max-lg:border-t sm:px-8 lg:py-12"
            >
              <GridHandle className="-top-[3.5px] -left-[3.5px] hidden lg:block" />
              <p className="text-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map(link => (
                  <li key={link.label}>
                    <FooterLinkRow {...link} />
                  </li>
                ))}
                {column.withRecentPosts ? <HomeFooterRecentPosts /> : null}
              </ul>
            </div>
          ))}
        </div>
        <FooterLegalBar />
        <div aria-hidden className="border-border overflow-hidden border-t px-6">
          <p className="from-foreground/[0.08] to-foreground/[0.01] -mb-[0.18em] bg-gradient-to-b bg-clip-text text-center font-sans text-[clamp(72px,13vw,164px)] leading-none font-bold tracking-tighter text-transparent select-none">
            SignalorAI
          </p>
        </div>
      </div>
    </footer>
  )
}

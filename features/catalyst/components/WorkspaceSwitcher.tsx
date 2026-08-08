'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { domainOf } from '@/features/catalyst/competitors-data'
import { BrandFavicon } from '@/features/catalyst/components/competitors/BrandFavicon'
import { useActiveProject } from '@/hooks/useActiveProject'
import { Building2, Check, ChevronDown, Plus } from '@/lib/icons'

const LOGO_BG = 'conic-gradient(from 210deg at 50% 50%, #F2A79E, #e04a3d, #b9382d, #F2A79E)'

interface Project {
  id: number
  name: string
  url: string
}

/** The brand's real favicon; falls back to the gradient monogram tile. */
function Tile({ name, url }: { name: string; url: string }): JSX.Element {
  const domain = url.includes('.') ? domainOf(url) : ''
  return <BrandFavicon domain={domain} name={name} color={LOGO_BG} size={32} />
}

interface MenuProps {
  projects: Project[]
  activeId: number | undefined
  onSelect: (id: number) => void
}

function MenuFooter(): JSX.Element {
  const item =
    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-background-secondary-default'
  return (
    <>
      <div className="my-1 h-px bg-[var(--cat-border)]" />
      <Link href="/dashboard/brands" className={item}>
        <Building2 size={15} className="text-[var(--cat-ink-3)]" />
        Manage brands
      </Link>
      <Link href="/dashboard/brands" className={item}>
        <Plus size={15} className="text-[var(--cat-ink-3)]" />
        Create new brand
      </Link>
    </>
  )
}

function ProjectMenu({ projects, activeId, onSelect }: MenuProps): JSX.Element {
  return (
    <div className="bg-background-primary-default absolute top-[calc(100%+4px)] right-0 left-0 z-30 overflow-hidden rounded-2xl border border-[var(--cat-border-soft)] p-1 shadow-lg">
      <p className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        Switch project
      </p>
      {projects.map(p => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p.id)}
          className="hover:bg-background-secondary-default flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors"
        >
          <Tile name={p.name} url={p.url} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-[var(--cat-ink)]">
              {p.name}
            </span>
            <span className="block truncate text-[11px] text-[var(--cat-ink-3)]">{p.url}</span>
          </span>
          {p.id === activeId && <Check size={15} className="shrink-0 text-[#e04a3d]" />}
        </button>
      ))}
      {projects.length === 0 && (
        <p className="px-2 py-2 text-[12px] text-[var(--cat-ink-3)]">No projects yet.</p>
      )}
      <MenuFooter />
    </div>
  )
}

function SwitcherTrigger({
  project,
  onToggle,
}: {
  project: Project
  onToggle: () => void
}): JSX.Element {
  // BoardUI's org card: a soft rounded surface with the brand avatar, two lines,
  // and a chevron in its own small boxed button on the right.
  return (
    <button
      type="button"
      onClick={onToggle}
      className="bg-background-primary-default hover:bg-background-secondary-hover flex w-full items-center gap-2.5 rounded-2xl border border-[var(--cat-border-soft)] p-2 text-left transition-colors"
    >
      <Tile name={project.name} url={project.url} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-[var(--cat-ink)]">
          {project.name}
        </span>
        <span className="block truncate text-[11px] text-[var(--cat-ink-3)]">{project.url}</span>
      </span>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[var(--cat-card)] text-[var(--cat-ink-3)] shadow-xs">
        <ChevronDown size={14} />
      </span>
    </button>
  )
}

const EMPTY_PROJECT: Project = { id: 0, name: 'No project', url: 'Create a brand to start' }

export function WorkspaceSwitcher({ collapsed }: { collapsed?: boolean }): JSX.Element {
  const { projects, activeOrg, select } = useActiveProject()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const active: Project = activeOrg
    ? { id: activeOrg.id, name: activeOrg.name, url: activeOrg.url }
    : EMPTY_PROJECT
  const list: Project[] = projects.map(p => ({ id: p.id, name: p.name, url: p.url }))

  const choose = (id: number): void => {
    select(id)
    setOpen(false)
    const org = projects.find(p => p.id === id)
    if (org?.slug) router.push(`/dashboard/${org.slug}`)
  }

  if (collapsed) {
    return (
      <Link
        href="/dashboard/brands"
        title={active.name}
        className="mt-3 flex justify-center rounded-md py-1 transition-colors hover:bg-[var(--cat-hover)]"
      >
        <Tile name={active.name} url={active.url} />
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative mt-3">
      <SwitcherTrigger project={active} onToggle={() => setOpen(o => !o)} />
      {open && <ProjectMenu projects={list} activeId={activeOrg?.id} onSelect={choose} />}
    </div>
  )
}

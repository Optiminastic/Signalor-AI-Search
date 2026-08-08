'use client'

import { useEffect, useRef, useState } from 'react'

import {
  buildTaskBrief,
  buildTaskPrompt,
} from '@/features/catalyst/components/tasks/detail/taskBrief'
import { engineLogo } from '@/features/catalyst/engine-logos'
import { useActiveProject } from '@/hooks/useActiveProject'
import type { TaskDetail } from '@/hooks/useTaskDetail'
import { Check, ChevronDown, Copy, ExternalLink } from '@/lib/icons'

interface ItemProps {
  icon: React.ReactNode
  title: string
  sub: string
  href?: string
  onClick?: () => void
}

function MenuItem({ icon, title, sub, href, onClick }: ItemProps): JSX.Element {
  const body = (
    <>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[13px] font-medium text-[var(--cat-ink)]">
          {title}
          {href && <ExternalLink size={11} className="text-[var(--cat-ink-3)]" />}
        </span>
        <span className="block truncate text-[11px] text-[var(--cat-ink-3)]">{sub}</span>
      </span>
    </>
  )
  const cls =
    'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-background-secondary-default'
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} onClick={onClick}>
        {body}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  )
}

function EngineIcon({ engine }: { engine: string }): JSX.Element {
  const logo = engineLogo(engine)
  if (!logo) return <Copy size={14} />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={logo} alt="" className="h-4 w-4" />
}

interface SplitButtonProps {
  copied: boolean
  open: boolean
  onCopy: () => void
  onToggle: () => void
}

function SplitButton({ copied, open, onCopy, onToggle }: SplitButtonProps): JSX.Element {
  return (
    <div className="flex h-8 items-stretch overflow-hidden rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)]">
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-1.5 px-2.5 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        {copied ? <Check size={13} className="text-[#2FBE7E]" /> : <Copy size={13} />}
        {copied ? 'Copied' : 'Copy task'}
      </button>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label="More ways to use this task"
        className="grid w-7 place-items-center border-l border-[var(--cat-border)] text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
}

interface ShareItemsProps {
  prompt: string
  onCopy: () => void
  onClose: () => void
}

function ShareMenuItems({ prompt, onCopy, onClose }: ShareItemsProps): JSX.Element {
  return (
    <div className="bg-background-primary-default absolute top-[calc(100%+4px)] right-0 z-30 w-[290px] rounded-2xl border border-[var(--cat-border-soft)] p-1 shadow-lg">
      <MenuItem
        icon={<Copy size={14} className="text-[var(--cat-ink-2)]" />}
        title="Copy task"
        sub="Copy as Markdown for LLMs"
        onClick={onCopy}
      />
      <MenuItem
        icon={<EngineIcon engine="chatgpt" />}
        title="Open in ChatGPT"
        sub="Ask it to implement this task"
        href={`https://chatgpt.com/?q=${prompt}`}
        onClick={onClose}
      />
      <MenuItem
        icon={<EngineIcon engine="claude" />}
        title="Open in Claude"
        sub="Ask it to implement this task"
        href={`https://claude.ai/new?q=${prompt}`}
        onClick={onClose}
      />
    </div>
  )
}

/**
 * "Copy task" split button — copies the task as an LLM-ready Markdown brief,
 * or opens ChatGPT / Claude prefilled with a prompt to implement the task.
 */
export function TaskShareMenu({ task }: { task: TaskDetail }): JSX.Element {
  const { activeOrg } = useActiveProject()
  const siteUrl = activeOrg?.url ?? ''
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const copy = (): void => {
    void navigator.clipboard.writeText(buildTaskBrief(task, siteUrl)).then(() => {
      setCopied(true)
      setOpen(false)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }
  const prompt = encodeURIComponent(buildTaskPrompt(task, siteUrl))

  return (
    <div ref={ref} className="relative">
      <SplitButton copied={copied} open={open} onCopy={copy} onToggle={() => setOpen(o => !o)} />
      {open && <ShareMenuItems prompt={prompt} onCopy={copy} onClose={() => setOpen(false)} />}
    </div>
  )
}

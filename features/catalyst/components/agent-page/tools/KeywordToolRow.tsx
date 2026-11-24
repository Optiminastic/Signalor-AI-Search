'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { SignalorMark } from '@/components/SignalorMark'
import { FinderKeyForm } from '@/features/catalyst/components/agent-page/tools/FinderKeyForm'
import type { KeywordTool } from '@/lib/api/agent-mode-keyword-tools'
import { Check } from '@/lib/icons'

interface KeywordToolRowProps {
  orgSlug: string
  tool: KeywordTool
  busy: boolean
  error: string | null
  onConnect: (apiKey: string) => void
  onDisconnect: () => void
}

const LOGO_SIZE = 28
/** Logo files in /public/logos. Semrush is drawn on a white tile so its orange mark shows in dark mode. */
const LOGOS: Record<string, { src: string; className: string }> = {
  search_console: { src: '/logos/search-console.svg', className: 'h-7 w-7 shrink-0' },
  semrush: {
    src: '/logos/semrush.svg',
    className: 'h-7 w-7 shrink-0 rounded-md border border-[var(--cat-border)] bg-white p-1',
  },
  ahrefs: { src: '/logos/ahrefs.png', className: 'h-7 w-7 shrink-0 rounded-md' },
}
const ROW = 'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left'
const MUTED = 'text-[12px] text-[var(--cat-ink-3)]'
const IN_USE =
  'rounded-sm bg-[rgba(224,74,61,0.1)] px-1.5 text-[10.5px] font-semibold text-primary-ink'

function Logo({ tool }: { tool: KeywordTool }): JSX.Element {
  if (tool.provider === 'signalor') {
    return (
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#e04a3d]/10">
        <SignalorMark className="text-primary-ink h-4 w-4" />
      </span>
    )
  }
  const logo = LOGOS[tool.provider]
  if (logo) {
    return (
      <Image
        src={logo.src}
        alt=""
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        className={logo.className}
      />
    )
  }
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--cat-hover)] text-[13px] font-semibold text-[var(--cat-ink-2)]">
      {tool.label.charAt(0)}
    </span>
  )
}

function Connected({ label }: { label: string }): JSX.Element {
  return (
    <span className="flex items-center gap-1 text-[12px] text-emerald-700">
      <Check size={13} strokeWidth={2.4} />
      {label}
    </span>
  )
}

/** Right side of the row: what state the tool is in and what the owner can do. */
function Status({ orgSlug, tool, busy, onDisconnect }: KeywordToolRowProps): JSX.Element {
  if (tool.kind === 'built_in') {
    return tool.connected ? (
      <Connected label="Included" />
    ) : (
      <span className={MUTED}>Not set up</span>
    )
  }
  if (tool.kind === 'elsewhere') {
    if (tool.connected) return <Connected label="Connected" />
    return (
      <Link href={`/dashboard/${orgSlug}/integrations`} className={`${MUTED} underline`}>
        Connect
      </Link>
    )
  }
  return (
    <span className="flex items-center gap-2">
      <Connected label={tool.keyHint ? `••${tool.keyHint}` : 'Connected'} />
      <button
        type="button"
        disabled={busy}
        onClick={onDisconnect}
        aria-label={`Disconnect ${tool.label}`}
        className={`${MUTED} underline hover:text-[var(--cat-ink)]`}
      >
        {busy ? 'Disconnecting…' : 'Disconnect'}
      </button>
    </span>
  )
}

function Name({ tool }: { tool: KeywordTool }): JSX.Element {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <span className="truncate text-[13.5px] font-medium text-[var(--cat-ink)]">{tool.label}</span>
      {tool.inUse && <span className={IN_USE}>In use</span>}
    </span>
  )
}

/** A keyword tool that needs an API key and isn't connected: click to paste one. */
function KeyRow(props: KeywordToolRowProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const { tool } = props
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Connect ${tool.label} with an API key`}
        className={`${ROW} transition-colors hover:bg-[var(--cat-hover)]`}
      >
        <Logo tool={tool} />
        <Name tool={tool} />
        <span className={MUTED}>Add API key</span>
      </button>
      {open && (
        <div className="px-2.5 pb-1">
          <FinderKeyForm finder={tool} busy={props.busy} onConnect={props.onConnect} />
        </div>
      )}
    </>
  )
}

/** One keyword tool: built-in data, Search Console, or a tool connected by API key. */
export function KeywordToolRow(props: KeywordToolRowProps): JSX.Element {
  const { tool, error } = props
  const needsKey = tool.kind === 'api_key' && !tool.connected
  return (
    <li className="flex flex-col gap-1">
      {needsKey ? (
        <KeyRow {...props} />
      ) : (
        <div className={ROW}>
          <Logo tool={tool} />
          <Name tool={tool} />
          <Status {...props} />
        </div>
      )}
      {error && (
        <p role="alert" className="text-primary-ink px-2.5 text-[11.5px]">
          {error}
        </p>
      )}
    </li>
  )
}

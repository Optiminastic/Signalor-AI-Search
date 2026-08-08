'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type {
  Dispatch,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
  SetStateAction,
} from 'react'

import { SEARCH_FIELD } from '@/features/catalyst/components/control-styles'
import { SearchResults } from '@/features/catalyst/components/SearchResults'
import { searchIndex } from '@/features/catalyst/search-data'
import type { SearchItem } from '@/features/catalyst/search-data'
import { useBrandPath } from '@/hooks/useBrandPath'
import { Search } from '@/lib/icons'

/** ⌘K to focus, Esc + outside-click to close. */
function useSearchShortcuts(
  input: RefObject<HTMLInputElement | null>,
  wrap: RefObject<HTMLDivElement | null>,
  setOpen: Dispatch<SetStateAction<boolean>>,
): void {
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        input.current?.focus()
        setOpen(true)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    function onDown(e: MouseEvent): void {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [input, wrap, setOpen])
}

interface NavContext {
  results: SearchItem[]
  active: number
  setActive: Dispatch<SetStateAction<number>>
  go: (href: string) => void
}

function handleNav(e: ReactKeyboardEvent, ctx: NavContext): void {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    ctx.setActive(a => Math.min(a + 1, ctx.results.length - 1))
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    ctx.setActive(a => Math.max(a - 1, 0))
  } else if (e.key === 'Enter' && ctx.results[ctx.active]) {
    ctx.go(ctx.results[ctx.active].href)
  }
}

interface SearchInputProps {
  inputRef: RefObject<HTMLInputElement | null>
  query: string
  onChange: (value: string) => void
  onFocus: () => void
  onKeyDown: (e: ReactKeyboardEvent) => void
}

function SearchInput({
  inputRef,
  query,
  onChange,
  onFocus,
  onKeyDown,
}: SearchInputProps): JSX.Element {
  return (
    <>
      <Search
        size={15}
        className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--cat-ink-3)]"
      />
      <input
        ref={inputRef}
        value={query}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder="Search pages, competitors…"
        className={SEARCH_FIELD}
      />
      {/* BoardUI's Quick Search shortcut chip: a boxed kbd on the surface colour. */}
      <kbd className="bg-background-secondary-default absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-[var(--cat-ink-3)] shadow-xs">
        ⌘K
      </kbd>
    </>
  )
}

export function GlobalSearch(): JSX.Element {
  const router = useRouter()
  const brandPath = useBrandPath()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrap = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const results = searchIndex(query)
  useSearchShortcuts(input, wrap, setOpen)

  const go = (href: string): void => {
    setOpen(false)
    setQuery('')
    // Absolute paths (account pages) go as-is; bare sub-paths are brand-scoped.
    router.push(href.startsWith('/') ? href : brandPath(href))
  }

  return (
    // The one flexible item in the top bar: it gives up width first so the
    // controls on the right keep their intrinsic size instead of wrapping.
    <div ref={wrap} className="relative max-w-[260px] min-w-0 flex-1 xl:max-w-[380px]">
      <SearchInput
        inputRef={input}
        query={query}
        onChange={value => {
          setQuery(value)
          setOpen(true)
          setActive(0)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => handleNav(e, { results, active, setActive, go })}
      />
      {open && results.length > 0 && (
        <SearchResults results={results} active={active} onPick={go} onHover={setActive} />
      )}
    </div>
  )
}

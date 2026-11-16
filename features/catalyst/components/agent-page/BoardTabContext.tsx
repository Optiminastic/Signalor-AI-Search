'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import type { BoardTab } from '@/features/catalyst/components/agent-page/BoardTabs'

interface BoardTabState {
  tab: BoardTab
  setTab: (tab: BoardTab) => void
}

const BoardTabContext = createContext<BoardTabState | null>(null)

interface BoardTabProviderProps {
  children: ReactNode
}

/** The open board tab, shared so the chat can open a tab (for example "Open Approvals"). */
export function BoardTabProvider({ children }: BoardTabProviderProps): JSX.Element {
  const [tab, setTab] = useState<BoardTab>('activity')
  const value = useMemo(() => ({ tab, setTab }), [tab])
  return <BoardTabContext.Provider value={value}>{children}</BoardTabContext.Provider>
}

export function useBoardTab(): BoardTabState {
  const state = useContext(BoardTabContext)
  if (!state) throw new Error('useBoardTab must be used inside BoardTabProvider')
  return state
}

'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import type { BoardTab } from '@/features/catalyst/components/agent-page/BoardTabs'

interface AgentUiState {
  orgSlug: string
  /** The open board tab, so the chat can open one ("Open Approvals"). */
  tab: BoardTab
  setTab: (tab: BoardTab) => void
  /** Whether the + (connect tools) panel is open, so the chat can open it ("Connect Gmail"). */
  toolsOpen: boolean
  setToolsOpen: (open: boolean) => void
}

const AgentUiContext = createContext<AgentUiState | null>(null)

interface AgentUiProviderProps {
  orgSlug: string
  children: ReactNode
}

/** UI state shared between the chat and the board in an open Agent mode chat. */
export function AgentUiProvider({ orgSlug, children }: AgentUiProviderProps): JSX.Element {
  const [tab, setTab] = useState<BoardTab>('activity')
  const [toolsOpen, setToolsOpen] = useState(false)
  const value = useMemo(
    () => ({ orgSlug, tab, setTab, toolsOpen, setToolsOpen }),
    [orgSlug, tab, toolsOpen],
  )
  return <AgentUiContext.Provider value={value}>{children}</AgentUiContext.Provider>
}

export function useAgentUi(): AgentUiState {
  const state = useContext(AgentUiContext)
  if (!state) throw new Error('useAgentUi must be used inside AgentUiProvider')
  return state
}

/**
 * Open state for the + panel: shared when inside an open chat, local on the
 * home screen (where there is no chat to open it from).
 */
export function useToolsPanelOpen(): [boolean, (open: boolean) => void] {
  const shared = useContext(AgentUiContext)
  const [local, setLocal] = useState(false)
  return shared ? [shared.toolsOpen, shared.setToolsOpen] : [local, setLocal]
}

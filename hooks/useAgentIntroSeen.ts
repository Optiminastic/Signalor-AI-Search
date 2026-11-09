'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'signalor.agent-intro-seen'
const listeners = new Set<() => void>()

/** 'unknown' on the server and before hydration, so nothing flashes. */
type IntroSeen = 'unknown' | 'seen' | 'unseen'

function read(): IntroSeen {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1' ? 'seen' : 'unseen'
  } catch {
    // Storage blocked (private mode, policy): just show the intro again.
    return 'unseen'
  }
}

function write(seen: boolean): void {
  try {
    if (seen) window.localStorage.setItem(STORAGE_KEY, '1')
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Convenience only; ignore storage failures.
  }
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Per-browser "has seen the Agent intro" flag (localStorage, failure-tolerant). */
export function useAgentIntroSeen(): { seen: IntroSeen; markSeen: () => void; replay: () => void } {
  const seen = useSyncExternalStore(subscribe, read, () => 'unknown' as const)
  const markSeen = useCallback(() => write(true), [])
  const replay = useCallback(() => write(false), [])
  return { seen, markSeen, replay }
}

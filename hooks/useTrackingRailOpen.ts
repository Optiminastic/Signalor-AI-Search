'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'signalor.agent-tracking-rail-closed'
const listeners = new Set<() => void>()

function read(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    return true // storage blocked: keep it open
  }
}

function write(open: boolean): void {
  try {
    if (open) window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Convenience only; ignore storage failures.
  }
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Whether the "You vs competitors" column is open; remembered per browser, open by default. */
export function useTrackingRailOpen(): { open: boolean; setOpen: (open: boolean) => void } {
  const open = useSyncExternalStore(subscribe, read, () => true)
  const setOpen = useCallback((next: boolean) => write(next), [])
  return { open, setOpen }
}

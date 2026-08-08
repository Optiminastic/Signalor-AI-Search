'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface ThemeContextValue {
  dark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({ dark: false, toggle: () => {} })

export function useCatalystTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

interface ProviderProps {
  children: ReactNode
}

/**
 * Catalyst-scoped theme: flips CSS surface tokens via a `.dark` wrapper.
 * Starts light on server + first client render (so hydration matches), then
 * syncs the saved preference after mount.
 */
export function CatalystThemeProvider({ children }: ProviderProps): JSX.Element {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('catalyst-theme') === 'dark') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot sync of persisted theme
      setDark(true)
    }
  }, [])

  // Paint <html>/<body> with the themed canvas so the browser's overscroll
  // rubber-band and the loading screen follow the theme instead of flashing the
  // default white body (the `.dark` class only reaches the wrapper below).
  // `--cat-canvas`: #09090b dark / #ffffff light. Restored on unmount so the
  // marketing site keeps its own white background.
  useEffect(() => {
    const canvas = dark ? '#09090b' : '#ffffff'
    const root = document.documentElement
    const prevRoot = root.style.backgroundColor
    const prevBody = document.body.style.backgroundColor
    root.style.backgroundColor = canvas
    document.body.style.backgroundColor = canvas
    return () => {
      root.style.backgroundColor = prevRoot
      document.body.style.backgroundColor = prevBody
    }
  }, [dark])

  const toggle = useCallback((): void => {
    setDark(prev => {
      const next = !prev
      localStorage.setItem('catalyst-theme', next ? 'dark' : 'light')
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? 'dark' : undefined}>{children}</div>
    </ThemeContext.Provider>
  )
}

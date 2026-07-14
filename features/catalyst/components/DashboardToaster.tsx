'use client'

import { Toaster } from 'sonner'

import { useCatalystTheme } from '@/features/catalyst/components/CatalystThemeProvider'

/**
 * Sonner host mounted inside the dashboard so toasts follow the catalyst
 * light/dark toggle. The theme lives on a wrapper `<div>` (not `<html>`), and
 * Sonner renders toasts in a body-level portal outside that wrapper, so the
 * theme must be passed explicitly rather than inherited through CSS tokens.
 */
export function DashboardToaster(): JSX.Element {
  const { dark } = useCatalystTheme()
  return <Toaster theme={dark ? 'dark' : 'light'} position="bottom-right" />
}

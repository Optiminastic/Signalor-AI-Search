'use client'

import type { CSSProperties } from 'react'
import { Toaster } from 'sonner'

import { useCatalystTheme } from '@/features/catalyst/components/CatalystThemeProvider'
import { AlertTriangle, CheckCircle2, Info, Loader2 } from '@/lib/icons'

/**
 * Sonner host mounted inside the dashboard so toasts follow the catalyst
 * light/dark toggle.
 *
 * Colours are explicit values rather than `var(--cat-*)`: the theme lives on a
 * wrapper `<div>` (not `<html>`) and Sonner renders toasts in a body-level
 * portal outside that wrapper, so catalyst tokens there would always resolve to
 * their light `:root` values. Keep these in sync with the `--cat-*` blocks in
 * `app/globals.css`.
 */
interface ToastPalette {
  bg: string
  text: string
  border: string
  muted: string
  success: string
  error: string
}

const LIGHT: ToastPalette = {
  bg: '#ffffff',
  text: '#171717',
  border: '#e5e5e5',
  muted: '#6b7280',
  success: '#1e8a5c',
  error: '#E5484D',
}

const DARK: ToastPalette = {
  bg: '#1c1c1f',
  text: '#f4f4f5',
  border: '#2b2b31',
  muted: '#a1a1aa',
  success: '#2FBE7E',
  error: '#F87171',
}

/** Brand red, matching PrimaryButton, so a toast action reads as the app's CTA. */
const BRAND = '#e04a3d'

/**
 * Sonner exposes its surface colours as CSS custom properties. TypeScript has no
 * type for arbitrary `--*` keys, so these objects are cast to `CSSProperties`
 * rather than widened to `any`.
 */
function toasterVars(p: ToastPalette): CSSProperties {
  return {
    '--normal-bg': p.bg,
    '--normal-text': p.text,
    '--normal-border': p.border,
    '--success-bg': p.bg,
    '--success-text': p.success,
    '--success-border': p.border,
    '--error-bg': p.bg,
    '--error-text': p.error,
    '--error-border': p.border,
  } as CSSProperties
}

function toastVars(p: ToastPalette): CSSProperties {
  return {
    background: p.bg,
    color: p.text,
    borderColor: p.border,
    '--muted-foreground': p.muted,
    '--action-bg': BRAND,
    '--action-text': '#ffffff',
  } as CSSProperties
}

/**
 * Type icons from the app's own icon set, coloured per palette — replacing
 * Sonner's default heavy filled glyphs, which read as off-theme (a black circle
 * on a light toast). One accent colour per type; the toast body stays neutral.
 */
function toastIcons(p: ToastPalette): Record<string, JSX.Element> {
  return {
    success: <CheckCircle2 size={17} style={{ color: p.success }} />,
    error: <AlertTriangle size={17} style={{ color: p.error }} />,
    warning: <AlertTriangle size={17} style={{ color: '#f59e0b' }} />,
    info: <Info size={17} style={{ color: BRAND }} />,
    loading: <Loader2 size={16} className="animate-spin" style={{ color: p.muted }} />,
  }
}

export function DashboardToaster(): JSX.Element {
  const { dark } = useCatalystTheme()
  const palette = dark ? DARK : LIGHT
  return (
    <Toaster
      theme={dark ? 'dark' : 'light'}
      position="bottom-right"
      gap={10}
      icons={toastIcons(palette)}
      style={toasterVars(palette)}
      toastOptions={{
        // Structure comes from classes (global, so they survive the portal);
        // colour comes from the CSS vars above.
        classNames: {
          toast:
            'rounded-xl border shadow-[0_8px_24px_rgba(16,24,40,.12)] text-[13px] font-medium gap-2.5',
          description: 'text-[12px] opacity-80',
          actionButton: 'rounded-md text-[12px] font-semibold',
          cancelButton: 'rounded-md text-[12px] font-medium',
        },
        style: toastVars(palette),
      }}
    />
  )
}

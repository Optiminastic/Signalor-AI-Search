'use client'

import { useEffect, useRef, useState } from 'react'

// ─── GBP-only mode ──────────────────────────────────────────────────────────
// Multi-currency display is parked until Adaptive Pricing is enabled on the
// Dodo products. Until then the site quotes GBP only, which is what actually
// gets charged — showing a converted figure that checkout then contradicts is
// worse than showing one honest price.
//
// To bring it back: restore the commented members of `CurrencyCode`, the
// `CURRENCIES` entries, `EUR_COUNTRIES`, `detectFromTimezone`, and the currency
// mapping inside the ipapi handler. `CurrencyToggle` re-renders itself as soon
// as it has more than one option.

// export type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'INR'
export type CurrencyCode = 'GBP'

export type Currency = {
  code: CurrencyCode
  symbol: string
  /** Multiply the GBP base price by this to get the display amount.
   *  These static rates are an offline fallback only — when live Dodo prices
   *  are available the page uses the provider's per-currency amounts instead. */
  rate: number
  decimals: number
  locale: string
}

const CURRENCIES: Record<CurrencyCode, Currency> = {
  GBP: { code: 'GBP', symbol: '£', rate: 1, decimals: 2, locale: 'en-GB' },
  // EUR: { code: 'EUR', symbol: '€', rate: 1.17, decimals: 2, locale: 'en-DE' },
  // USD: { code: 'USD', symbol: '$', rate: 1.27, decimals: 2, locale: 'en-US' },
  // INR: { code: 'INR', symbol: '₹', rate: 106, decimals: 0, locale: 'en-IN' },
}

// Eurozone + broader EU/EEA countries map to EUR. GB is intentionally NOT here
// (it maps to GBP, the canonical currency).
// const EUR_COUNTRIES = new Set([
//   'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
//   'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
//   'SI', 'ES', 'SE', 'CH', 'NO', 'IS', 'AL', 'BA', 'ME', 'MK', 'RS', 'MD',
//   'UA', 'BY', 'LI', 'AD', 'MC', 'SM', 'VA',
// ])

// function detectFromTimezone(): CurrencyCode | null {
//   try {
//     const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
//     if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'INR'
//     if (tz.startsWith('America/')) return 'USD'
//   } catch {
//     // SSR / unavailable
//   }
//   return null
// }

/**
 * Resolves the display currency (GBP-only for now) and the visitor's country.
 *
 * The country lookup is deliberately kept while currency selection is parked:
 * it is passed to Dodo as the billing-address hint so checkout doesn't default
 * to the United States. Only the currency mapping is disabled.
 */
export function useCurrency(): {
  currency: Currency
  ready: boolean
  country: string | null
  selectCurrency: (code: CurrencyCode) => void
} {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES.GBP)
  const [country, setCountry] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const manualOverride = useRef(false)

  useEffect(() => {
    // Apply timezone hint synchronously on the client before the async fetch.
    // This avoids SSR hydration mismatches while still giving instant detection.
    // const tzCode = detectFromTimezone()
    // if (tzCode && !manualOverride.current) {
    //   setCurrency(CURRENCIES[tzCode])
    //   setReady(true)
    // }

    let cancelled = false
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(r => r.json())
      .then((data: { country_code?: string }) => {
        if (cancelled || manualOverride.current) return
        const cc = (data.country_code ?? '').toUpperCase()
        if (cc) setCountry(cc)
        // Currency stays GBP regardless of country while multi-currency is off.
        // let code: CurrencyCode = 'GBP'
        // if (cc === 'IN') code = 'INR'
        // else if (cc === 'US') code = 'USD'
        // else if (EUR_COUNTRIES.has(cc)) code = 'EUR'
        // else code = 'GBP' // GB + default rest of world → GBP (canonical)
        // setCurrency(CURRENCIES[code])
      })
      .catch(() => {
        /* GBP is already the initial value */
      })
      .finally(() => {
        clearTimeout(timeout)
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timeout)
    }
  }, [])

  function selectCurrency(code: CurrencyCode): void {
    manualOverride.current = true
    setCurrency(CURRENCIES[code])
  }

  return { currency, ready, country, selectCurrency }
}

/** Format a GBP base price into the display currency. */
export function formatPrice(gbpPrice: number, currency: Currency): string {
  const amount = gbpPrice * currency.rate
  if (currency.decimals === 0) {
    return Math.round(amount).toLocaleString(currency.locale)
  }
  return amount.toFixed(currency.decimals)
}

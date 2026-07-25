'use client'

import { useMemo } from 'react'

import { useGaData } from '@/hooks/useGaData'
import type { GACountry } from '@/lib/api/integrations'
import { centroidFor } from '@/lib/geo/country-centroids'

export interface WorldMarker {
  country: string
  /** ISO alpha-2 code (e.g. "IN") — drives the flag emoji. */
  code: string
  /** Geographic centroid — projected onto the map in WorldMap. */
  lat: number
  lon: number
  /** Share of sessions (%). */
  share: number
}

interface UseWorldPresenceResult {
  markers: WorldMarker[]
  /** Distinct countries with at least one session. */
  countries: number
  /** Total sessions across all countries, pre-formatted (e.g. "132.4K"). */
  sessions: string
  /** True when there are country markers to plot. */
  hasData: boolean
  /** GA is connected + synced but the selected property has zero traffic. */
  isEmpty: boolean
  isLoading: boolean
  /** The GA integration is connected for this account. */
  connected: boolean
  /** Connected, but the first sync hasn't landed data yet. */
  syncing: boolean
}

function formatSessions(total: number): string {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M`
  if (total >= 1_000) return `${(total / 1_000).toFixed(1)}K`
  return String(total)
}

function toMarkers(countries: GACountry[], totalSessions: number): WorldMarker[] {
  if (totalSessions <= 0) return []
  return countries
    .map(c => {
      const centroid = centroidFor(c.country_id)
      if (!centroid) return null
      return {
        country: c.country,
        code: c.country_id,
        lat: centroid.lat,
        lon: centroid.lon,
        share: Math.round((c.sessions / totalSessions) * 1000) / 10,
      }
    })
    .filter((m): m is WorldMarker => m !== null)
}

/** Real sessions-by-country from the org's connected GA4 property. Rides on
 *  `useGaData`, so it shares its cache and its while-syncing polling. */
export function useWorldPresence(): UseWorldPresenceResult {
  const { data, isLoading, connected, syncing } = useGaData()

  return useMemo(() => {
    const countries = data?.countries ?? []
    // Sum the country breakdown rather than using snapshot.sessions: GA4 caps the
    // country report, so the totals disagree and shares wouldn't reach 100%.
    const total = countries.reduce((sum, c) => sum + c.sessions, 0)
    const markers = toMarkers(countries, total)
    return {
      markers,
      countries: countries.filter(c => c.sessions > 0).length,
      sessions: formatSessions(total),
      hasData: markers.length > 0,
      // A synced snapshot with no sessions means "connected, empty property" —
      // distinct from "not connected" (null) and "still syncing".
      isEmpty: connected && !syncing && data !== null && total === 0,
      isLoading,
      connected,
      syncing,
    }
  }, [data, isLoading, connected, syncing])
}

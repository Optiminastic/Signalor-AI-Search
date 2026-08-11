'use client'

import { useState } from 'react'

interface SiteFaviconProps {
  /** Bare domain, e.g. "signalor.ai". Scheme and path are stripped. */
  domain: string
  /** Tile edge length in px. */
  size?: number
  /** Tooltip; defaults to the domain. */
  title?: string
}

function bareDomain(value: string): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
}

/**
 * A site's real favicon, falling back to a letter tile when it has none.
 *
 * Sits beside `EngineLogo` as the other half of the logo vocabulary: that one
 * renders a bundled SVG for a known engine, this one fetches whatever a
 * third-party domain actually uses. Extracted because the same favicon-with-
 * fallback existed inline in the brand list, the rank table and the task glyph.
 */
export function SiteFavicon({ domain, size = 16, title }: SiteFaviconProps): JSX.Element {
  const [failed, setFailed] = useState(false)
  const host = bareDomain(domain)
  const box = { width: size, height: size }

  if (!host || failed) {
    return (
      <span
        title={title ?? host}
        className="grid shrink-0 place-items-center rounded-[3px] bg-[rgba(224,74,61,0.12)] font-semibold text-[#e04a3d] uppercase"
        style={{ ...box, fontSize: Math.max(8, Math.round(size * 0.55)) }}
      >
        {host ? host[0] : '?'}
      </span>
    )
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`}
      alt=""
      title={title ?? host}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-[3px] object-contain"
      style={box}
    />
  )
}

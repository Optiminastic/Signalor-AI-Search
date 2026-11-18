'use client'

import { useState } from 'react'

interface SiteFaviconProps {
  domain: string
}

const BASE = 'grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-md'

/** The site's own favicon, falling back to its first letter. */
export function SiteFavicon({ domain }: SiteFaviconProps): JSX.Element {
  const [failed, setFailed] = useState(false)
  if (failed || !domain) {
    return (
      <span
        className={`${BASE} bg-[rgba(224,74,61,0.12)] text-[12px] font-semibold text-[#e04a3d] uppercase`}
      >
        {domain.charAt(0) || '?'}
      </span>
    )
  }
  return (
    <span className={`${BASE} bg-[var(--cat-bg)]`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        width={18}
        height={18}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-[18px] w-[18px] object-contain"
      />
    </span>
  )
}

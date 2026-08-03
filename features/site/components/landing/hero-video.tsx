'use client'

import { useRef, useState } from 'react'

import { Play } from '@/features/site/components/icons'

interface HeroVideoProps {
  src: string
  poster: string
  label: string
}

/**
 * Product demo player. Renders the poster frame until the visitor presses play,
 * so the hero costs one image on first paint and never autoplays.
 */
export function HeroVideo({ src, poster, label }: HeroVideoProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  function handlePlay(): void {
    setStarted(true)
    void videoRef.current?.play()
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={started}
        playsInline
        preload="none"
        aria-label={label}
        className="block aspect-[21/10] w-full bg-black object-cover object-top"
        onPlay={() => setStarted(true)}
        onPause={() => setStarted(true)}
      />
      {started ? null : (
        <button
          type="button"
          onClick={handlePlay}
          className="group absolute inset-0 flex items-center justify-center"
        >
          <span className="sr-only">{label}</span>
          <span
            aria-hidden
            className="ring-border flex size-16 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 shadow-black/10 transition-transform motion-safe:group-hover:scale-105"
          >
            <Play className="text-foreground ml-0.5 size-6" />
          </span>
        </button>
      )}
    </div>
  )
}

'use client'

import { useId } from 'react'

import {
  SECONDARY_BUTTON,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { BusinessProfile } from '@/hooks/useBusinessProfile'
import {
  MAX_OTHER_PHOTOS,
  type BusinessPhoto,
  type PhotoKind,
} from '@/lib/api/agent-mode-business-profile'

interface PhotoUploaderProps {
  profile: BusinessProfile
  photos: BusinessPhoto[]
}

const MUTED = 'text-[11.5px] text-[var(--cat-ink-3)]'
const ACCEPT = 'image/jpeg,image/png'

const SLOTS: { kind: PhotoKind; label: string; hint: string }[] = [
  { kind: 'logo', label: 'Logo', hint: 'Square works best.' },
  { kind: 'cover', label: 'Cover photo', hint: 'Wide, shows your business at its best.' },
  {
    kind: 'other',
    label: 'More photos',
    hint: `Up to ${MAX_OTHER_PHOTOS}: inside, outside, team, work.`,
  },
]

interface ThumbProps {
  photo: BusinessPhoto
  onRemove: () => void
}

function Thumb({ photo, onRemove }: ThumbProps): JSX.Element {
  return (
    <li className="flex flex-col items-start gap-1">
      {/* Signed, short-lived S3 links: next/image can't optimise or cache them. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={`${photo.kind} photo`}
        className="h-20 w-20 rounded-md border border-[var(--cat-border)] object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-[11.5px] text-[#e04a3d] hover:underline"
      >
        Remove
      </button>
    </li>
  )
}

interface SlotProps extends PhotoUploaderProps {
  slot: (typeof SLOTS)[number]
}

function Slot({ slot, profile, photos }: SlotProps): JSX.Element {
  const id = useId()
  const mine = photos.filter(p => p.kind === slot.kind)
  const full = slot.kind === 'other' && mine.length >= MAX_OTHER_PHOTOS
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-medium text-[var(--cat-ink)]">{slot.label}</p>
        <label
          htmlFor={id}
          className={`${SECONDARY_BUTTON} cursor-pointer ${full ? 'pointer-events-none opacity-50' : ''}`}
        >
          {mine.length > 0 && slot.kind !== 'other' ? 'Replace' : 'Upload'}
        </label>
        <input
          id={id}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={full || profile.uploading}
          onChange={event => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) profile.uploadPhoto({ file, kind: slot.kind })
          }}
        />
      </div>
      <p className={MUTED}>{slot.hint}</p>
      {mine.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {mine.map(photo => (
            <Thumb key={photo.id} photo={photo} onRemove={() => profile.removePhoto(photo.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}

/** Logo, cover and other photos for the new listing. JPG or PNG; big photos are shrunk first. */
export function PhotoUploader({ profile, photos }: PhotoUploaderProps): JSX.Element {
  return (
    <section className="flex flex-col gap-3">
      <h3 className={SECTION_TITLE}>Photos</h3>
      {SLOTS.map(slot => (
        <Slot key={slot.kind} slot={slot} profile={profile} photos={photos} />
      ))}
      {profile.uploading && (
        <p role="status" className={MUTED}>
          Uploading…
        </p>
      )}
    </section>
  )
}

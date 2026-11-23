import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * The brand's Google Business Profile (its Google Maps / search listing).
 * ranking-be checks Google weekly; when there's no listing, the owner fills in
 * the facts and photos for a new one. Facts always come from the owner.
 */
export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Day = (typeof DAYS)[number]

export const DESCRIPTION_MAX = 750
export const PHOTO_MAX_BYTES = 4 * 1024 * 1024
export const PHOTO_MIN_SIDE = 250
export const MAX_OTHER_PHOTOS = 10

const listingSchema = z
  .object({
    name: z.string().catch(''),
    address: z.string().catch(''),
    category: z.string().catch(''),
    website: z.string().catch(''),
    phone: z.string().catch(''),
    rating: z.number().nullable().catch(null),
    reviews: z.number().nullable().catch(null),
    link: z.string().catch(''),
  })
  .passthrough()

export type BusinessListing = z.infer<typeof listingSchema>

const draftSchema = z
  .object({
    name: z.string().catch(''),
    primary_category: z.string().catch(''),
    extra_categories: z.array(z.string()).catch([]),
    address: z.string().catch(''),
    hide_address: z.boolean().catch(false),
    service_area: z.string().catch(''),
    phone: z.string().catch(''),
    website: z.string().catch(''),
    hours: z.record(z.string()).catch({}),
    description: z.string().catch(''),
  })
  .transform(d => ({
    name: d.name,
    primaryCategory: d.primary_category,
    extraCategories: d.extra_categories,
    address: d.address,
    hideAddress: d.hide_address,
    serviceArea: d.service_area,
    phone: d.phone,
    website: d.website,
    hours: d.hours,
    description: d.description,
  }))

export type BusinessDraft = z.infer<typeof draftSchema>

const photoSchema = z.object({
  id: z.number(),
  kind: z.enum(['logo', 'cover', 'other']),
  url: z.string().catch(''),
  width: z.number(),
  height: z.number(),
})

export type BusinessPhoto = z.infer<typeof photoSchema>
export type PhotoKind = BusinessPhoto['kind']

const reportSchema = z
  .object({
    status: z.enum(['found', 'not_found', 'unknown', 'never_checked']).catch('unknown'),
    checking: z.boolean().catch(false),
    checked_at: z.string().nullable(),
    listing: listingSchema.nullable().catch(null),
    draft: draftSchema,
    photos: z.array(photoSchema).catch([]),
    photos_enabled: z.boolean().catch(false),
  })
  .transform(r => ({
    status: r.status,
    checking: r.checking,
    checkedAt: r.checked_at,
    listing: r.listing,
    draft: r.draft,
    photos: r.photos,
    photosEnabled: r.photos_enabled,
  }))

export type BusinessProfileReport = z.infer<typeof reportSchema>

const suggestionSchema = z.object({
  description: z.string().catch(''),
  categories: z.array(z.string()).catch([]),
})

export type BusinessSuggestion = z.infer<typeof suggestionSchema>

const base = (orgSlug: string, ...rest: string[]): string =>
  programPath(orgSlug, 'business-profile', ...rest)

export function getBusinessProfile(orgSlug: string): Promise<BusinessProfileReport> {
  return agentModeRequest(base(orgSlug), reportSchema)
}

export function checkBusinessProfileNow(orgSlug: string): Promise<BusinessProfileReport> {
  return agentModeRequest(base(orgSlug, 'check'), reportSchema, { method: 'POST' })
}

/** The draft in the backend's field names (snake_case, matching ranking-be). */
function toPayload(draft: BusinessDraft): Record<string, unknown> {
  return {
    name: draft.name,
    primary_category: draft.primaryCategory,
    extra_categories: draft.extraCategories,
    address: draft.address,
    hide_address: draft.hideAddress,
    service_area: draft.serviceArea,
    phone: draft.phone,
    website: draft.website,
    hours: draft.hours,
    description: draft.description,
  }
}

export function saveBusinessDraft(
  orgSlug: string,
  draft: BusinessDraft,
): Promise<BusinessProfileReport> {
  return agentModeRequest(base(orgSlug, 'draft'), reportSchema, {
    method: 'PATCH',
    body: toPayload(draft),
  })
}

export function suggestBusinessListing(orgSlug: string): Promise<BusinessSuggestion> {
  return agentModeRequest(base(orgSlug, 'suggest'), suggestionSchema, { method: 'POST' })
}

export function uploadBusinessPhoto(
  orgSlug: string,
  file: Blob,
  kind: PhotoKind,
): Promise<BusinessProfileReport> {
  const form = new FormData()
  form.append('file', file, 'photo.jpg')
  form.append('kind', kind)
  return agentModeRequest(base(orgSlug, 'photos'), reportSchema, { method: 'POST', body: form })
}

export function deleteBusinessPhoto(
  orgSlug: string,
  photoId: number,
): Promise<BusinessProfileReport> {
  return agentModeRequest(base(orgSlug, 'photos', String(photoId)), reportSchema, {
    method: 'DELETE',
  })
}

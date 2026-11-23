import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ListingCard } from '@/features/catalyst/components/agent-page/business/ListingCard'
import { ListingForm } from '@/features/catalyst/components/agent-page/business/ListingForm'
import type { BusinessProfile } from '@/hooks/useBusinessProfile'
import {
  getBusinessProfile,
  saveBusinessDraft,
  type BusinessProfileReport,
} from '@/lib/api/agent-mode-business-profile'
import { fitPhoto } from '@/lib/fit-photo'

const NOOP = (): void => undefined

function profile(overrides: Partial<BusinessProfile> = {}): BusinessProfile {
  return {
    report: null,
    isLoading: false,
    loadError: null,
    checkNow: NOOP,
    checking: false,
    saveDraft: NOOP,
    saving: false,
    saved: false,
    suggest: () => Promise.resolve(null),
    suggesting: false,
    uploadPhoto: NOOP,
    uploading: false,
    removePhoto: NOOP,
    error: null,
    ...overrides,
  }
}

function report(overrides: Partial<BusinessProfileReport> = {}): BusinessProfileReport {
  return {
    status: 'not_found',
    checking: false,
    checkedAt: '2026-11-23T10:00:00Z',
    listing: null,
    draft: {
      name: 'Brand Store',
      primaryCategory: '',
      extraCategories: [],
      address: '',
      hideAddress: false,
      serviceArea: '',
      phone: '',
      website: 'https://brand.example',
      hours: { mon: '09:00-18:00' },
      description: '',
    },
    photos: [],
    photosEnabled: true,
    ...overrides,
  }
}

function mockFetch(body: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => vi.unstubAllGlobals())

describe('ListingCard', () => {
  it('shows the listing with its rating and a Maps link', () => {
    const html = renderToStaticMarkup(
      <ListingCard
        listing={{
          name: 'Brand Store',
          address: '22 MG Road',
          category: 'Bakery',
          website: '',
          phone: '',
          rating: 4.56,
          reviews: 12,
          link: 'https://www.google.com/maps?cid=42',
        }}
        checking={false}
        onCheckNow={NOOP}
      />,
    )
    expect(html).toContain('Brand Store')
    expect(html).toContain('4.6 stars · 12 reviews')
    expect(html).toContain('href="https://www.google.com/maps?cid=42"')
  })
})

describe('ListingForm', () => {
  it('prefills the saved draft and offers the photo slots', () => {
    const html = renderToStaticMarkup(<ListingForm profile={profile()} report={report()} />)
    expect(html).toContain('value="Brand Store"')
    expect(html).toContain('value="09:00-18:00"')
    expect(html).toContain('Logo')
    expect(html).toContain('Cover photo')
    expect(html).toContain('Draft it for me')
  })

  it('says when photo storage is not switched on', () => {
    const html = renderToStaticMarkup(
      <ListingForm profile={profile()} report={report({ photosEnabled: false })} />,
    )
    expect(html).toContain('aren’t switched on')
    expect(html).not.toContain('Cover photo')
  })
})

describe('business profile API', () => {
  it('reads the report and maps names to camelCase', async () => {
    mockFetch({
      status: 'found',
      checking: false,
      checked_at: '2026-11-23T10:00:00Z',
      listing: {
        name: 'Brand Store',
        link: 'https://www.google.com/maps?cid=1',
        rating: 4.5,
        reviews: 3,
      },
      draft: { primary_category: 'Bakery', hide_address: true },
      photos: [{ id: 1, kind: 'logo', url: 'https://signed.example/1', width: 400, height: 400 }],
      photos_enabled: true,
    })
    const result = await getBusinessProfile('brand')
    expect(result.status).toBe('found')
    expect(result.listing?.name).toBe('Brand Store')
    expect(result.draft.primaryCategory).toBe('Bakery')
    expect(result.draft.hideAddress).toBe(true)
    expect(result.photos[0]?.kind).toBe('logo')
  })

  it('saves the draft in the backend field names with PATCH', async () => {
    const fetchMock = mockFetch({ status: 'not_found', checked_at: null, draft: {}, photos: [] })
    await saveBusinessDraft('brand', report().draft)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/agent-mode/programs/brand/business-profile/draft')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(String(init.body))).toMatchObject({
      name: 'Brand Store',
      primary_category: '',
    })
  })
})

describe('fitPhoto', () => {
  it('returns a photo that already fits untouched', async () => {
    const file = new File([new Uint8Array(2000)], 'small.jpg', { type: 'image/jpeg' })
    await expect(fitPhoto(file, { maxBytes: 4000, minSide: 250 })).resolves.toBe(file)
  })
})

import axios from 'axios'
import { z } from 'zod'

import { apiClient } from './client'

export const GROWTH_SERVICES = [
  { value: 'seo', label: 'SEO – Google search visibility' },
  { value: 'geo', label: 'GEO – AI search visibility' },
  { value: 'aeo', label: 'AEO – Answer engine visibility' },
  { value: 'all', label: 'All of the above' },
] as const

type GrowthService = (typeof GROWTH_SERVICES)[number]['value']

const SERVICE_VALUES = GROWTH_SERVICES.map(s => s.value) as [GrowthService, ...GrowthService[]]

/** Mirrors the backend's normalize_website: bare domains get https://. */
function toWebsiteUrl(raw: string): URL | null {
  const value = raw.trim()
  if (!value) return null
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`)
    const host = url.hostname
    const isIp = /^[\d.]+$/.test(host)
    if (!['http:', 'https:'].includes(url.protocol) || !host.includes('.') || isIp) return null
    return url
  } catch {
    return null
  }
}

/** Client-side validation. The backend re-validates every field independently. */
export const growthLeadSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(120, 'Keep it under 120 characters.'),
  email: z.string().trim().min(1, 'Enter your work email.').email('Enter a valid work email.'),
  company_name: z
    .string()
    .trim()
    .min(1, 'Enter your company or brand name.')
    .max(200, 'Keep it under 200 characters.'),
  website: z
    .string()
    .trim()
    .min(1, 'Enter your website URL.')
    .max(500, 'Keep it under 500 characters.')
    .refine(v => toWebsiteUrl(v) !== null, 'Enter a valid website URL, e.g. acme.com.'),
  service: z.enum(SERVICE_VALUES, {
    errorMap: () => ({ message: "Choose what you'd like to improve." }),
  }),
  goals: z.string().trim().max(2000, 'Keep it under 2,000 characters.'),
})

export type GrowthLeadInput = z.input<typeof growthLeadSchema>
export type GrowthLeadPayload = z.output<typeof growthLeadSchema>
export type GrowthLeadField = keyof GrowthLeadPayload

const responseSchema = z.object({
  ok: z.literal(true),
  lead_id: z.string().uuid(),
  status: z.string(),
  created_at: z.string(),
})

export type GrowthLeadResult = z.infer<typeof responseSchema>

/** A failed submission, with any per-field messages the backend returned. */
export class GrowthLeadError extends Error {
  readonly fieldErrors: Partial<Record<GrowthLeadField, string>>

  constructor(message: string, fieldErrors: Partial<Record<GrowthLeadField, string>> = {}) {
    super(message)
    this.name = 'GrowthLeadError'
    this.fieldErrors = fieldErrors
  }
}

const FIELD_NAMES: GrowthLeadField[] = [
  'full_name',
  'email',
  'company_name',
  'website',
  'service',
  'goals',
]

function readFieldErrors(data: unknown): Partial<Record<GrowthLeadField, string>> {
  const parsed = z.record(z.array(z.string())).safeParse(data)
  if (!parsed.success) return {}
  const out: Partial<Record<GrowthLeadField, string>> = {}
  for (const field of FIELD_NAMES) {
    const first = parsed.data[field]?.[0]
    if (first) out[field] = first
  }
  return out
}

function toGrowthLeadError(err: unknown): GrowthLeadError {
  if (!axios.isAxiosError(err) || !err.response) {
    return new GrowthLeadError(
      "We couldn't reach our servers. Check your connection and try again.",
    )
  }
  const { status, data } = err.response
  if (status === 429) {
    return new GrowthLeadError('Too many submissions from your network. Please wait a minute.')
  }
  if (status === 400) {
    return new GrowthLeadError('Please fix the highlighted fields.', readFieldErrors(data))
  }
  return new GrowthLeadError('Something went wrong on our side. Please try again shortly.')
}

export async function submitGrowthLead(payload: GrowthLeadPayload): Promise<GrowthLeadResult> {
  const body = growthLeadSchema.parse(payload)
  try {
    const { data } = await apiClient.post('/api/growth-leads/', body)
    return responseSchema.parse(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new GrowthLeadError('Something went wrong on our side. Please try again shortly.')
    }
    throw toGrowthLeadError(err)
  }
}

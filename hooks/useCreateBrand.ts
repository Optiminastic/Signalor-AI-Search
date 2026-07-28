'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/client'
import { createOrganization } from '@/lib/api/organizations'
import { useSession } from '@/lib/auth-client'

export interface NewBrandInput {
  name: string
  url: string
}

interface UseCreateBrandResult {
  submit: (input: NewBrandInput) => void
  isPending: boolean
  /** Server-supplied message, or '' when there is no error to show. */
  error: string
}

/** Accept a bare domain the way the onboarding form does. */
function withProtocol(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

/**
 * Surface the backend's own message rather than a generic failure.
 *
 * The onboard endpoint answers 403 with `{error, code: 'plan_limit_exceeded'}`
 * when the account is out of brand slots and 409 with `{detail}` when the domain
 * is already onboarded, so both carry text worth showing verbatim.
 */
function createBrandError(err: unknown): string {
  const fallback = 'Could not create the brand. Try again.'
  if (!(err instanceof ApiError)) return fallback
  const body = (err.data ?? {}) as { error?: unknown; detail?: unknown }
  if (typeof body.error === 'string' && body.error) return body.error
  if (typeof body.detail === 'string' && body.detail) return body.detail
  if (err.status === 409) return 'You already have a brand for this domain.'
  return fallback
}

/** Create a brand (organization) and refresh the brands list + capacity counter. */
export function useCreateBrand(onCreated: () => void): UseCreateBrandResult {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: NewBrandInput) =>
      createOrganization({ name: input.name.trim(), url: withProtocol(input.url), email }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['catalyst', 'brands'] })
      await queryClient.invalidateQueries({ queryKey: ['catalyst', 'brand-capacity'] })
      onCreated()
    },
  })

  return {
    submit: (input: NewBrandInput) => mutation.mutate(input),
    isPending: mutation.isPending,
    error: mutation.isError ? createBrandError(mutation.error) : '',
  }
}

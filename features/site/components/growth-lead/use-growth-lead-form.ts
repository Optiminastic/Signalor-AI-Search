'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'

import {
  GrowthLeadError,
  growthLeadSchema,
  submitGrowthLead,
  type GrowthLeadField,
  type GrowthLeadInput,
  type GrowthLeadPayload,
} from '@/features/site/lib/api/growth-lead'

const DEFAULT_VALUES: Partial<GrowthLeadInput> = {
  full_name: '',
  email: '',
  company_name: '',
  website: '',
  goals: '',
}

type GrowthLeadForm = UseFormReturn<GrowthLeadInput, unknown, GrowthLeadPayload>

interface UseGrowthLeadForm {
  form: GrowthLeadForm
  formError: string
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
}

function toError(err: unknown): GrowthLeadError {
  return err instanceof GrowthLeadError
    ? err
    : new GrowthLeadError('Something went wrong. Please try again.')
}

/**
 * Form state + submission. Duplicate submits are prevented by `isSubmitting`:
 * the form disables its fieldset and submit button for the whole request, and
 * React flushes that before the next click is dispatched.
 */
export function useGrowthLeadForm(onSuccess: () => void): UseGrowthLeadForm {
  const form = useForm<GrowthLeadInput, unknown, GrowthLeadPayload>({
    resolver: zodResolver(growthLeadSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
  })
  const [formError, setFormError] = useState('')

  const onSubmit = form.handleSubmit(async values => {
    setFormError('')
    try {
      await submitGrowthLead(values)
      onSuccess()
    } catch (err) {
      const error = toError(err)
      for (const [field, message] of Object.entries(error.fieldErrors)) {
        form.setError(field as GrowthLeadField, { type: 'server', message })
      }
      setFormError(error.message)
    }
  })

  return { form, formError, onSubmit }
}

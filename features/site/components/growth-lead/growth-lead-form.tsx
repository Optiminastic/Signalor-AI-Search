'use client'

import {
  GoalsTextarea,
  ServiceSelect,
  TEXT_FIELDS,
  TextInput,
} from '@/features/site/components/growth-lead/growth-lead-inputs'
import { useGrowthLeadForm } from '@/features/site/components/growth-lead/use-growth-lead-form'
import { Button } from '@/features/site/components/ui/button'
import { SignalorLoader } from '@/features/site/components/ui/signalor-loader'

interface SubmitRowProps {
  submitting: boolean
  formError: string
}

function SubmitRow({ submitting, formError }: SubmitRowProps): JSX.Element {
  return (
    <>
      {formError ? (
        <p
          role="alert"
          className="border-destructive/25 bg-destructive/5 text-destructive border px-4 py-3 text-[13px]"
        >
          {formError}
        </p>
      ) : null}
      <div className="space-y-3 pt-1">
        <Button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-none text-[14px]"
        >
          {submitting ? <SignalorLoader size="sm" /> : 'Submit Enquiry'}
        </Button>
        <p className="text-muted-foreground text-center text-[13px]">
          We&apos;ll get in touch with you shortly.
        </p>
      </div>
    </>
  )
}

interface GrowthLeadFormProps {
  onSuccess: () => void
}

export function GrowthLeadForm({ onSuccess }: GrowthLeadFormProps): JSX.Element {
  const { form, formError, onSubmit } = useGrowthLeadForm(onSuccess)
  const { register, formState } = form
  const { errors, isSubmitting } = formState

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {TEXT_FIELDS.map(config => (
          <TextInput
            key={config.name}
            config={config}
            registration={register(config.name)}
            error={errors[config.name]?.message}
          />
        ))}
        <div className="sm:col-span-2">
          <ServiceSelect registration={register('service')} error={errors.service?.message} />
        </div>
        <div className="sm:col-span-2">
          <GoalsTextarea registration={register('goals')} error={errors.goals?.message} />
        </div>
      </fieldset>
      <SubmitRow submitting={isSubmitting} formError={formError} />
    </form>
  )
}

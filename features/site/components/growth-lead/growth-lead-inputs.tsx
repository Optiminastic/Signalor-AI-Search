'use client'

import type { UseFormRegisterReturn } from 'react-hook-form'

import {
  GROWTH_FIELD_CLASS,
  GrowthLeadField,
} from '@/features/site/components/growth-lead/growth-lead-field'
import { ChevronDown } from '@/features/site/components/icons'
import {
  GROWTH_SERVICES,
  type GrowthLeadField as FieldName,
} from '@/features/site/lib/api/growth-lead'

type TextFieldName = Exclude<FieldName, 'service' | 'goals'>

interface TextFieldConfig {
  name: TextFieldName
  label: string
  placeholder: string
  type: 'text' | 'email' | 'url'
  autoComplete: string
}

export const TEXT_FIELDS: readonly TextFieldConfig[] = [
  {
    name: 'full_name',
    label: 'Full name',
    placeholder: 'Jane Cooper',
    type: 'text',
    autoComplete: 'name',
  },
  {
    name: 'email',
    label: 'Work email',
    placeholder: 'jane@acme.com',
    type: 'email',
    autoComplete: 'email',
  },
  {
    name: 'company_name',
    label: 'Company / brand name',
    placeholder: 'Acme',
    type: 'text',
    autoComplete: 'organization',
  },
  {
    name: 'website',
    label: 'Website URL',
    placeholder: 'acme.com',
    type: 'url',
    autoComplete: 'url',
  },
]

function describedBy(id: string, error?: string): string | undefined {
  return error ? `${id}-error` : undefined
}

interface TextInputProps {
  config: TextFieldConfig
  registration: UseFormRegisterReturn
  error?: string
}

export function TextInput({ config, registration, error }: TextInputProps): JSX.Element {
  const { name, label, placeholder, type, autoComplete } = config
  return (
    <GrowthLeadField id={name} label={label} error={error}>
      <input
        id={name}
        type={type}
        inputMode={type === 'text' ? undefined : type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(name, error)}
        className={GROWTH_FIELD_CLASS}
        {...registration}
      />
    </GrowthLeadField>
  )
}

interface FieldInputProps {
  registration: UseFormRegisterReturn
  error?: string
}

export function ServiceSelect({ registration, error }: FieldInputProps): JSX.Element {
  return (
    <GrowthLeadField id="service" label="What are you looking to improve?" error={error}>
      <div className="relative">
        <select
          id="service"
          defaultValue=""
          required
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy('service', error)}
          className={`${GROWTH_FIELD_CLASS} invalid:text-muted-foreground/70 cursor-pointer appearance-none pr-10`}
          {...registration}
        >
          <option value="" disabled>
            Select a service
          </option>
          {GROWTH_SERVICES.map(s => (
            <option key={s.value} value={s.value} className="text-foreground">
              {s.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2"
        />
      </div>
    </GrowthLeadField>
  )
}

export function GoalsTextarea({ registration, error }: FieldInputProps): JSX.Element {
  return (
    <GrowthLeadField id="goals" label="Tell us about your goals" optional error={error}>
      <textarea
        id="goals"
        rows={4}
        placeholder="e.g. We want to show up in ChatGPT and Google AI Overviews when people compare tools in our category."
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy('goals', error)}
        className={`${GROWTH_FIELD_CLASS} min-h-28 resize-y leading-relaxed`}
        {...registration}
      />
    </GrowthLeadField>
  )
}

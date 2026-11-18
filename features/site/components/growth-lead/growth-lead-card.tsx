'use client'

import { useState } from 'react'

import { GrowthLeadForm } from '@/features/site/components/growth-lead/growth-lead-form'
import { GrowthLeadSuccess } from '@/features/site/components/growth-lead/growth-lead-success'

/** Swaps the form for the thank-you state once the backend has saved the lead. */
export function GrowthLeadCard(): JSX.Element {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="border border-black/8 bg-white p-6 shadow-xs sm:p-8">
      {submitted ? <GrowthLeadSuccess /> : <GrowthLeadForm onSuccess={() => setSubmitted(true)} />}
    </div>
  )
}

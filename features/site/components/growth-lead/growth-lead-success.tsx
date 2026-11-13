import Link from 'next/link'

import { Check } from '@/features/site/components/icons'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'

export function GrowthLeadSuccess(): JSX.Element {
  return (
    <div role="status" className="px-2 py-10 text-center sm:py-14">
      <div className="bg-success/10 mx-auto mb-5 grid h-12 w-12 place-content-center rounded-full">
        <Check className="text-success h-6 w-6" strokeWidth={2.5} aria-hidden />
      </div>
      <h2 className="text-foreground text-2xl font-semibold tracking-tight">
        Thank you for reaching out!
      </h2>
      <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-[15px] leading-relaxed">
        We&apos;ve received your enquiry. Our team will review your requirements and get back to you
        shortly.
      </p>
      <Link href="/" className={`${LANDING_PRIMARY_CTA_CLASS} mt-8`}>
        Back to website
      </Link>
    </div>
  )
}

import { Star } from '@/lib/icons'

/** G2 social-proof badge: mark + 4.7 stars + caption. */
export function G2Badge(): JSX.Element {
  return (
    <div className="mt-9 flex items-center justify-center gap-2.5">
      <span className="bg-primary-strong grid h-9 w-9 place-items-center rounded-full text-[13px] font-bold text-white">
        G2
      </span>
      <div className="flex flex-col items-start gap-0.5">
        <div className="text-primary-ink flex items-center gap-0.5">
          {[0, 1, 2, 3].map(i => (
            <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
          ))}
          <Star
            size={14}
            fill="currentColor"
            strokeWidth={0}
            className="[clip-path:inset(0_50%_0_0)]"
          />
        </div>
        <span className="text-[12px] font-medium text-[#6b6b6b]">4.7/5 stars on G2</span>
      </div>
    </div>
  )
}

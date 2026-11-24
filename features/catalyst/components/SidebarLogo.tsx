import { SignalorMark } from '@/components/SignalorMark'

/** SignalorAI app identity. Collapse/expand lives in the top bar, not here. */
export function SidebarLogo({ collapsed }: { collapsed?: boolean }): JSX.Element {
  if (collapsed) {
    return (
      <div className="flex flex-1 justify-center py-1">
        <SignalorMark className="text-primary-ink h-[26px] w-[26px]" />
      </div>
    )
  }
  return (
    <div className="flex flex-1 items-center gap-2 px-1">
      <SignalorMark className="text-primary-ink h-[26px] w-[26px] shrink-0" />
      <span className="text-[15px] font-semibold tracking-tight text-[var(--cat-ink)]">
        SignalorAI
      </span>
    </div>
  )
}

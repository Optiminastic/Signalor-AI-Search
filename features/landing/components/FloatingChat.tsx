import { MessageCircle } from '@/lib/icons'

/** Floating support-chat launcher (bottom-right). */
export function FloatingChat(): JSX.Element {
  return (
    <button
      type="button"
      aria-label="Open chat"
      className="bg-primary-strong fixed right-6 bottom-6 z-30 grid h-14 w-14 place-items-center rounded-full text-white shadow-[0_8px_24px_rgba(224,74,61,0.4)] transition-colors hover:bg-[#c53f34]"
    >
      <MessageCircle size={24} strokeWidth={2} className="text-white" />
    </button>
  )
}

import { CatalystShell } from '@/features/catalyst/components/CatalystShell'
import { BoardUIShowcase } from '@/features/catalyst/components/ui-kit/BoardUIShowcase'

export default function UIKitPage(): JSX.Element {
  return (
    <CatalystShell>
      <BoardUIShowcase />
    </CatalystShell>
  )
}

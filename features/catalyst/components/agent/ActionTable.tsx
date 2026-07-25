import { ActionRow } from '@/features/catalyst/components/agent/ActionRow'
import { AgentSectionPanel } from '@/features/catalyst/components/agent/AgentSectionPanel'
import type { AgentAction } from '@/lib/api/agent'
import type { LucideIcon } from '@/lib/icons'
import { FileText, Globe, Layout } from '@/lib/icons'

const GROUP_ICON: Record<string, LucideIcon> = {
  Content: FileText,
  'On-site': Layout,
  'Off-page': Globe,
}

function ColumnHeader(): JSX.Element {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--cat-border-soft)] px-4 py-2 text-[10px] font-semibold tracking-wide text-[var(--cat-ink-3)] uppercase">
      <span className="w-8 shrink-0" />
      <span className="flex-1">Action</span>
      <span className="w-[68px] shrink-0 text-right">Priority</span>
      <span className="hidden w-[56px] shrink-0 text-right lg:block">Effort</span>
      <span className="w-[104px] shrink-0" />
    </div>
  )
}

interface ActionTableProps {
  group: string
  actions: AgentAction[]
}

export function ActionTable({ group, actions }: ActionTableProps): JSX.Element {
  return (
    <AgentSectionPanel icon={GROUP_ICON[group] ?? Layout} title={group} count={actions.length}>
      <ColumnHeader />
      <div className="divide-y divide-[var(--cat-border-soft)]">
        {actions.map(a => (
          <ActionRow key={a.action_id} action={a} />
        ))}
      </div>
    </AgentSectionPanel>
  )
}

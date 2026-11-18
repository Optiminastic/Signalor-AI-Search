import { AgentModePage } from '@/features/catalyst/components/agent-page/AgentModePage'

/** Full-page SignalorAI Agent (intro on first visit, then the chat). No dashboard shell. */
export default function AgentModeRoute(): JSX.Element | null {
  return <AgentModePage />
}

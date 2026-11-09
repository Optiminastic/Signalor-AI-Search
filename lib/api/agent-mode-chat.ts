import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/** Agent mode chat: one conversation per brand, answered by ranking-be's agent. */

const chatMessageSchema = z
  .object({
    id: z.number(),
    role: z.enum(['user', 'assistant']),
    status: z.enum(['pending', 'complete', 'failed']),
    content: z.string(),
    tool_trace: z.array(z.object({ tool: z.string(), write: z.boolean() })),
  })
  .transform(m => ({
    id: m.id,
    role: m.role,
    status: m.status,
    content: m.content,
    changedPlan: m.tool_trace.some(t => t.write),
  }))

const chatEnvelope = z.object({ messages: z.array(chatMessageSchema) })

export type AgentChatMessage = z.infer<typeof chatMessageSchema>

export async function getChat(orgSlug: string): Promise<AgentChatMessage[]> {
  return (await agentModeRequest(programPath(orgSlug, 'chat'), chatEnvelope)).messages
}

export async function sendChat(orgSlug: string, message: string): Promise<AgentChatMessage[]> {
  const options = { method: 'POST' as const, body: { message } }
  return (await agentModeRequest(programPath(orgSlug, 'chat'), chatEnvelope, options)).messages
}

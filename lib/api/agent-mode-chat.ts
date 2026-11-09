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
    /** Tools the agent used for this reply, in order (for the live activity canvas). */
    tools: m.tool_trace.map(t => t.tool),
  }))

const chatEnvelope = z.object({ messages: z.array(chatMessageSchema) })

const chatSummarySchema = z
  .object({ id: z.string(), title: z.string(), updated_at: z.string() })
  .transform(c => ({ id: c.id, title: c.title || 'Untitled chat', updatedAt: c.updated_at }))

const chatListEnvelope = z.object({ conversations: z.array(chatSummarySchema) })
const startedEnvelope = z.object({
  conversation: chatSummarySchema,
  messages: z.array(chatMessageSchema),
})

export type AgentChatMessage = z.infer<typeof chatMessageSchema>
export type AgentChatSummary = z.infer<typeof chatSummarySchema>

/** The brand's saved chats, most recent first. */
export async function listChats(orgSlug: string): Promise<AgentChatSummary[]> {
  return (await agentModeRequest(programPath(orgSlug, 'chats'), chatListEnvelope)).conversations
}

/** Starts a new chat with its first question; returns the chat and its thread. */
export async function startChat(
  orgSlug: string,
  message: string,
): Promise<{ chat: AgentChatSummary; messages: AgentChatMessage[] }> {
  const options = { method: 'POST' as const, body: { message } }
  const data = await agentModeRequest(programPath(orgSlug, 'chats'), startedEnvelope, options)
  return { chat: data.conversation, messages: data.messages }
}

export async function getChat(orgSlug: string, chatId: string): Promise<AgentChatMessage[]> {
  const path = programPath(orgSlug, 'chats', encodeURIComponent(chatId))
  return (await agentModeRequest(path, chatEnvelope)).messages
}

interface SendChatOptions {
  orgSlug: string
  chatId: string
  message: string
}

export async function sendChat({
  orgSlug,
  chatId,
  message,
}: SendChatOptions): Promise<AgentChatMessage[]> {
  const path = programPath(orgSlug, 'chats', encodeURIComponent(chatId))
  const options = { method: 'POST' as const, body: { message } }
  return (await agentModeRequest(path, chatEnvelope, options)).messages
}

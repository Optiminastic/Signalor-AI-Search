import type { BoardTab } from '@/features/catalyst/components/agent-page/BoardTabs'

/**
 * Clickable next steps under the agent's latest reply: board tabs worth opening
 * and follow-up questions to send in one click. Worked out from the tools the
 * reply used and the tabs it mentions, so they always fit what was just said.
 */
export interface ReplyActions {
  tabs: BoardTab[]
  followUps: string[]
  /** A tool the reply says to connect (opens the + panel), if any. */
  connect: ConnectTool | null
}

export type ConnectTool = 'gmail' | 'hunter' | 'apollo' | 'buffer'

export const CONNECT_LABELS: Record<ConnectTool, string> = {
  gmail: 'Gmail',
  hunter: 'Hunter',
  apollo: 'Apollo',
  buffer: 'Buffer',
}

/** Most blocking first: without Gmail nothing approved can be sent. */
const CONNECT_ORDER: ConnectTool[] = ['gmail', 'hunter', 'apollo', 'buffer']
const CONNECT_WORDS = /\b(connect|connected|connecting|reconnect|not linked|sign in)\b/i

const MAX_TABS = 2
const MAX_FOLLOW_UPS = 3

export const TAB_LABELS: Record<BoardTab, string> = {
  activity: 'Activity',
  articles: 'Articles',
  guest: 'Guest posts',
  keywords: 'Keywords',
  tracking: 'Tracking',
  social: 'Social',
  approvals: 'Approvals',
  indexing: 'Indexing',
}

/** The tab that shows what each chat tool looked at or started. */
const TOOL_TABS: Record<string, BoardTab> = {
  get_approvals: 'approvals',
  get_outreach: 'approvals',
  get_guest_posts: 'guest',
  find_guest_sites: 'guest',
  get_social: 'social',
  check_social_now: 'social',
  get_indexing: 'indexing',
  check_indexing_now: 'indexing',
}

/** Tabs the reply names in plain words ("open Approvals", "the Guest posts tab"). */
const TAB_MENTIONS: [BoardTab, RegExp][] = [
  ['approvals', /\bapprovals?\b/i],
  ['guest', /\bguest[- ]posts?\b/i],
  ['social', /\bsocial\b/i],
  ['indexing', /\bindex(ing|ed)?\b/i],
  ['articles', /\barticles?\b/i],
  ['keywords', /\bkeywords?\b/i],
]

const FOLLOW_UPS: Record<string, string[]> = {
  get_overview: ['What should I do next?', 'What is waiting for my approval?'],
  get_approvals: ['Which draft should I approve first?', 'Why can’t you approve from chat?'],
  get_outreach: ['Who replied to our emails?', 'When are the next follow-ups?'],
  get_guest_posts: ['Find more guest post sites', 'How does guest post pitching work?'],
  find_guest_sites: ['Show the guest post sites you found'],
  get_social: ['How can I raise my social score?', 'Check my social presence now'],
  check_social_now: ['Show my social score'],
  get_indexing: ['Which pages are not indexed yet?', 'Check indexing now'],
  check_indexing_now: ['Show my indexing status'],
  get_connections: ['Which tools should I connect first?'],
  get_positioning: [
    'Which competitors do AI answers recommend instead?',
    'Which sites should we get mentioned on?',
  ],
  get_plan: ['What happens this week?', 'Skip the tasks I don’t need'],
  get_progress: ['What worked best so far?', 'What should I do next?'],
  get_activity: ['Did any of it work?', 'What is the agent doing next?'],
}

const DEFAULT_FOLLOW_UPS = [
  'What is the agent running right now?',
  'What should I do next?',
  'What is waiting for my approval?',
]

function unique<T>(items: T[]): T[] {
  return items.filter((item, i) => items.indexOf(item) === i)
}

function tabsFor(tools: string[], text: string): BoardTab[] {
  const fromTools = tools.map(tool => TOOL_TABS[tool]).filter((tab): tab is BoardTab => !!tab)
  const fromText = TAB_MENTIONS.filter(([, pattern]) => pattern.test(text)).map(([tab]) => tab)
  return unique([...fromTools, ...fromText]).slice(0, MAX_TABS)
}

function same(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

function followUpsFor(tools: string[], asked: string[]): string[] {
  const suggested = unique([
    ...tools.flatMap(tool => FOLLOW_UPS[tool] ?? []),
    ...DEFAULT_FOLLOW_UPS,
  ])
  return suggested.filter(q => !asked.some(a => same(a, q))).slice(0, MAX_FOLLOW_UPS)
}

/**
 * @param tools the tools the reply used, in order
 * @param text the reply itself
 * @param asked what the owner already asked in this chat (never suggested again)
 */
export function replyActions(tools: string[], text: string, asked: string[]): ReplyActions {
  return {
    tabs: tabsFor(tools, text),
    followUps: followUpsFor(tools, asked),
    connect: connectFor(text),
  }
}

/** The first tool the reply names together with connecting it ("Gmail isn't connected"). */
function connectFor(text: string): ConnectTool | null {
  if (!CONNECT_WORDS.test(text)) return null
  return CONNECT_ORDER.find(tool => new RegExp(`\\b${tool}\\b`, 'i').test(text)) ?? null
}
